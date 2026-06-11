// EE Script Extractor — client-side, dependency-free.
//
// Browsers block cross-origin fetches (CORS), so direct requests to
// google.earthengine.app fail. We route through public CORS proxies and try
// each one until a response comes back. This is best-effort: a proxy may be
// rate-limited or down. For production reliability, host your own proxy.

const PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

const els = {
  url: document.getElementById("url"),
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

async function fetchViaProxies(target) {
  let lastError;
  for (const build of PROXIES) {
    try {
      const res = await fetch(build(target), { redirect: "follow" });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("All proxies failed");
}

// Pull every bit of JavaScript we can find out of the fetched page:
// inline <script> bodies, referenced .js URLs, and any raw Earth Engine
// code patterns embedded in the markup.
function extractJavaScript(html, baseUrl) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const parts = [];

  const inline = [];
  const external = [];

  doc.querySelectorAll("script").forEach((s) => {
    const src = s.getAttribute("src");
    if (src) {
      try {
        external.push(new URL(src, baseUrl).href);
      } catch {
        external.push(src);
      }
    } else if (s.textContent && s.textContent.trim()) {
      inline.push(s.textContent.trim());
    }
  });

  if (inline.length) {
    parts.push("// ===== Inline scripts =====");
    parts.push(inline.join("\n\n"));
  }

  // Earth Engine code signatures, in case the source is embedded as a string.
  const eePattern = /(ee\.[A-Za-z]+\([^\n<]*|Map\.[A-Za-z]+\([^\n<]*)/g;
  const eeHits = html.match(eePattern);
  if (eeHits && eeHits.length) {
    parts.push("\n// ===== Detected Earth Engine code patterns =====");
    parts.push([...new Set(eeHits)].join("\n"));
  }

  if (external.length) {
    parts.push("\n// ===== Referenced external scripts =====");
    parts.push(external.map((u) => `// ${u}`).join("\n"));
  }

  return { code: parts.join("\n").trim(), inlineCount: inline.length, externalCount: external.length };
}

async function extract() {
  const target = els.url.value.trim();
  if (!isValidUrl(target)) {
    setStatus("Please enter a valid http(s) URL.", "error");
    return;
  }

  els.extract.disabled = true;
  els.result.classList.add("hidden");
  setStatus("Fetching page…");

  try {
    const html = await fetchViaProxies(target);
    setStatus("Extracting JavaScript…");

    const { code, inlineCount, externalCount } = extractJavaScript(html, target);

    if (!code) {
      setStatus("No JavaScript found in the page. The app may load its source dynamically.", "error");
      return;
    }

    lastScript = code;
    els.output.textContent = code;
    els.meta.textContent = `${inlineCount} inline script(s), ${externalCount} external reference(s)`;
    els.result.classList.remove("hidden");
    setStatus("Done ✅", "success");
  } catch (err) {
    setStatus(`Failed to fetch: ${err.message}. The proxy may be down or the URL blocked.`, "error");
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
  a.download = "ee-script.js";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

els.extract.addEventListener("click", extract);
els.url.addEventListener("keydown", (e) => {
  if (e.key === "Enter") extract();
});
els.copy.addEventListener("click", copyScript);
els.download.addEventListener("click", downloadScript);
