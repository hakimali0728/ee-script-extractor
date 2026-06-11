// EE Script Extractor — extracts the author-published source of a public
// Google Earth Engine app.
//
// How it works (two steps). The /view/ page is just a UI shell; the real
// source lives in a "<app>-modules.json" file that the page loads. Both the
// page and the JSON are served from *.earthengine.app, which sends no CORS
// headers — so the browser can't fetch them directly. We route through a
// proxy (your Cloudflare Worker, recommended; or flaky public fallbacks):
//   1. Fetch the app's /view/ HTML, read the init("…-modules.json") pointer.
//   2. Fetch that modules.json — its `dependencies` map holds the JS source.

// Flaky public fallbacks, used only when no Worker proxy is configured.
const PUBLIC_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
];

// Optional hard-coded Worker proxy. Leave "" and set it via the UI field
// (saved in the browser) or by appending ?proxy=<workerUrl> to the page URL.
const DEFAULT_WORKER_PROXY = "";

const els = {
  url: document.getElementById("url"),
  proxy: document.getElementById("proxy"),
  extract: document.getElementById("extract"),
  status: document.getElementById("status"),
  result: document.getElementById("result"),
  output: document.getElementById("output"),
  meta: document.getElementById("meta"),
  copy: document.getElementById("copy"),
  download: document.getElementById("download"),
};

let lastScript = "";

function setStatus(message, kind = "") {
  els.status.textContent = message;
  els.status.className = `status ${kind}`.trim();
}

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function getWorkerProxy() {
  return (els.proxy && els.proxy.value.trim()) || localStorage.getItem("ee_proxy") || DEFAULT_WORKER_PROXY;
}

// Build the ordered list of URLs to try: Worker proxy first (if set), then
// the public fallbacks.
function proxiedCandidates(target) {
  const out = [];
  const worker = getWorkerProxy();
  if (worker) out.push(`${worker.replace(/\/+$/, "")}/?url=${encodeURIComponent(target)}`);
  for (const build of PUBLIC_PROXIES) out.push(build(target));
  return out;
}

async function fetchText(target) {
  let lastError;
  for (const candidate of proxiedCandidates(target)) {
    try {
      const res = await fetch(candidate, { redirect: "follow" });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("all proxies failed");
}

// Find the modules.json URL the app loads. Prefer the explicit init(...)
// pointer in the HTML; fall back to deriving it from the /view/<app> path.
function findModulesUrl(html, appUrl) {
  const match = html.match(/init\(\s*["']([^"']+?modules\.json)["']/i);
  if (match) return match[1].replace(/\\\//g, "/"); // unescape \/ from the HTML

  try {
    const u = new URL(appUrl);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    if (seg) return `${u.origin}/javascript/${seg.toLowerCase()}-modules.json`;
  } catch {
    /* ignore */
  }
  return null;
}

// Turn the modules.json into readable, concatenated source. `dependencies`
// maps "user/repo:Script Name" -> source; `path` names the entry module.
function parseModules(jsonText) {
  const data = JSON.parse(jsonText);
  const deps = data.dependencies || {};
  const names = Object.keys(deps);
  if (!names.length) return { code: "", count: 0, entry: null };

  const entry = data.path && deps[data.path] ? data.path : null;
  const ordered = entry ? [entry, ...names.filter((n) => n !== entry)] : names;

  const code = ordered
    .map((n) => `// ===== Module: ${n} =====\n\n${String(deps[n]).trim()}`)
    .join("\n\n\n");

  return { code, count: ordered.length, entry };
}

async function extract() {
  const target = els.url.value.trim();
  if (!isValidUrl(target)) {
    setStatus("Please enter a valid http(s) URL.", "error");
    return;
  }

  els.extract.disabled = true;
  els.result.classList.add("hidden");

  try {
    setStatus("Fetching app page…");
    const html = await fetchText(target);

    const modulesUrl = findModulesUrl(html, target);
    if (!modulesUrl) {
      setStatus("Couldn't locate the app's modules.json. Is this a published EE app /view/ URL?", "error");
      return;
    }

    setStatus("Fetching app source…");
    const json = await fetchText(modulesUrl);

    const { code, count, entry } = parseModules(json);
    if (!code) {
      setStatus("modules.json contained no source — the app may be empty or access-restricted.", "error");
      return;
    }

    lastScript = code;
    els.output.textContent = code;
    els.meta.textContent = `${count} module(s)${entry ? ` · entry: ${entry}` : ""}`;
    els.result.classList.remove("hidden");
    setStatus("Source extracted ✅", "success");
  } catch (err) {
    setStatus(
      `Failed: ${err.message}. Public proxies are unreliable — deploy the Cloudflare Worker and paste its URL in Proxy settings.`,
      "error"
    );
  } finally {
    els.extract.disabled = false;
  }
}

async function copyScript() {
  if (!lastScript) return;
  try {
    await navigator.clipboard.writeText(lastScript);
    setStatus("Copied to clipboard ✅", "success");
  } catch {
    setStatus("Clipboard blocked by browser. Select the text manually.", "error");
  }
}

function downloadScript() {
  if (!lastScript) return;
  const blob = new Blob([lastScript], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ee-app-source.js";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- init ---
(function init() {
  // Seed the proxy field from ?proxy= or saved value, and keep it persisted.
  const fromQuery = new URLSearchParams(location.search).get("proxy");
  if (fromQuery) localStorage.setItem("ee_proxy", fromQuery);
  if (els.proxy) {
    els.proxy.value = localStorage.getItem("ee_proxy") || DEFAULT_WORKER_PROXY || "";
    els.proxy.addEventListener("input", () => {
      const v = els.proxy.value.trim();
      if (v) localStorage.setItem("ee_proxy", v);
      else localStorage.removeItem("ee_proxy");
    });
  }

  els.extract.addEventListener("click", extract);
  els.url.addEventListener("keydown", (e) => {
    if (e.key === "Enter") extract();
  });
  els.copy.addEventListener("click", copyScript);
  els.download.addEventListener("click", downloadScript);
})();
