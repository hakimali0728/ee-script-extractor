#!/usr/bin/env python3
"""EE Script Extractor - local backend (no proxy, no CORS, zero pip installs).

Architecture you asked for:  frontend  ->  this Python backend  ->  fetches the
Earth Engine app  ->  returns the extracted source  ->  frontend shows it.

Servers aren't bound by the browser's CORS rules, so the backend fetches the
app directly: it reads the init("...-modules.json") pointer from the app page,
fetches that JSON, and returns the JavaScript source from its `dependencies`.

Run:
    python server.py            # serves http://localhost:8000
    python server.py 8080       # custom port

Then open the URL, paste an Earth Engine app URL, and click Extract.
Uses only the Python standard library - nothing to install.
"""

import json
import re
import sys
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
USER_AGENT = "ee-script-extractor"

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}


def fetch_text(url, timeout=30):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, "replace")


def find_modules_url(html, base_url):
    """Prefer the explicit init("...modules.json") pointer; fall back to the
    /view/<app> -> /javascript/<app>-modules.json convention."""
    match = re.search(r'init\(\s*["\']([^"\']+?modules\.json)["\']', html, re.I)
    if match:
        return match.group(1).replace("\\/", "/")  # unescape \/ from the HTML

    parsed = urllib.parse.urlparse(base_url)
    segments = [s for s in parsed.path.split("/") if s]
    if segments:
        return f"{parsed.scheme}://{parsed.netloc}/javascript/{segments[-1].lower()}-modules.json"
    return None


def parse_modules(json_text):
    data = json.loads(json_text)
    deps = data.get("dependencies", {})
    names = list(deps.keys())
    if not names:
        return {"code": "", "count": 0, "entry": None}

    entry = data.get("path") if data.get("path") in deps else None
    ordered = [entry] + [n for n in names if n != entry] if entry else names

    code = "\n\n\n".join(
        f"// ===== Module: {name} =====\n\n{str(deps[name]).strip()}" for name in ordered
    )
    return {"code": code, "count": len(ordered), "entry": entry}


def extract(app_url):
    html = fetch_text(app_url)
    modules_url = find_modules_url(html, app_url)
    if not modules_url:
        raise ValueError("Couldn't find the modules.json pointer - is this a published /view/ app URL?")

    result = parse_modules(fetch_text(modules_url))
    if not result["code"]:
        raise ValueError("modules.json contained no source (app may be empty or restricted).")
    result["modulesUrl"] = modules_url
    return result


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/extract":
            params = urllib.parse.parse_qs(parsed.query)
            target = (params.get("url") or [""])[0].strip()
            if not target:
                return self._send_json({"error": "missing 'url' parameter"}, 400)
            try:
                return self._send_json(extract(target))
            except Exception as err:  # noqa: BLE001 - surface any failure to the UI
                return self._send_json({"error": str(err)}, 502)

        return self._serve_static(parsed.path)

    def _serve_static(self, path):
        if path in ("", "/"):
            path = "/index.html"

        target = (ROOT / path.lstrip("/")).resolve()
        # Prevent path traversal outside the project directory.
        if not str(target).startswith(str(ROOT)) or not target.is_file():
            return self.send_error(404, "Not found")

        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", CONTENT_TYPES.get(target.suffix, "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")  # avoids stale cached assets
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass  # keep the console quiet


if __name__ == "__main__":
    print(f"EE Script Extractor backend  ->  http://localhost:{PORT}")
    print("Open that URL, paste an Earth Engine app URL, click Extract.  (Ctrl+C to stop)")
    try:
        ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
