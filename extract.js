#!/usr/bin/env node
// EE Script Extractor — command-line version. NO PROXY NEEDED.
//
// CORS only restricts browsers; from Node we fetch the Earth Engine app
// directly. Two steps: fetch the /view/ HTML, read the init("…-modules.json")
// pointer, fetch that JSON, and parse its `dependencies` into readable source.
//
// Usage:  node extract.js <ee-app-url> [output-file.js]
// Example: node extract.js https://manabsac.users.earthengine.app/view/showsmslice

import { writeFile } from "node:fs/promises";

const appUrl = process.argv[2];
const outFile = process.argv[3] || "ee-app-source.js";

if (!appUrl) {
  console.error("Usage: node extract.js <ee-app-url> [output-file.js]");
  process.exit(1);
}

function findModulesUrl(html, base) {
  const m = html.match(/init\(\s*["']([^"']+?modules\.json)["']/i);
  if (m) return m[1].replace(/\\\//g, "/"); // unescape \/ from the HTML
  try {
    const u = new URL(base);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    if (seg) return `${u.origin}/javascript/${seg.toLowerCase()}-modules.json`;
  } catch {
    /* ignore */
  }
  return null;
}

function parseModules(jsonText) {
  const data = JSON.parse(jsonText);
  const deps = data.dependencies || {};
  const names = Object.keys(deps);
  if (!names.length) return "";
  const entry = data.path && deps[data.path] ? data.path : null;
  const ordered = entry ? [entry, ...names.filter((n) => n !== entry)] : names;
  return ordered
    .map((n) => `// ===== Module: ${n} =====\n\n${String(deps[n]).trim()}`)
    .join("\n\n\n");
}

async function getText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "ee-script-extractor" }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

try {
  process.stderr.write(`→ Fetching app page: ${appUrl}\n`);
  const html = await getText(appUrl);

  const modulesUrl = findModulesUrl(html, appUrl);
  if (!modulesUrl) throw new Error("Couldn't find the modules.json pointer — is this a published /view/ app URL?");

  process.stderr.write(`→ Fetching source:   ${modulesUrl}\n`);
  const code = parseModules(await getText(modulesUrl));
  if (!code) throw new Error("modules.json contained no source (app may be empty or restricted).");

  await writeFile(outFile, code, "utf8");
  process.stderr.write(`\n✅ Extracted ${code.length} chars → ${outFile}\n`);
} catch (err) {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
}
