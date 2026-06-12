<div align="center">

# 🌍 EE Script Extractor

### Extract the published JavaScript source from a public Google Earth Engine app — paste a URL, get the code.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-GitHub_Pages-2ea043?style=for-the-badge)](https://hakimali0728.github.io/ee-script-extractor)
[![Made with Vanilla JS](https://img.shields.io/badge/Made_with-Vanilla_JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![Proxy: Cloudflare Worker](https://img.shields.io/badge/Proxy-Cloudflare_Worker-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)](#-set-up-the-proxy-required)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**🔗 Live site:** [`https://hakimali0728.github.io/ee-script-extractor`](https://hakimali0728.github.io/ee-script-extractor)

</div>

---

## ✨ What it does

EE Script Extractor is a tiny, **zero-dependency** web tool that pulls the
JavaScript source out of a **published, public** Google Earth Engine app.
Paste the app URL, click **Extract**, and read / copy / download the code. 🎯

> ℹ️ It works because a published EE app ships its source in a
> `…-modules.json` bundle that the page loads at runtime. The tool reads that
> bundle. It only works for **public** apps the author has published.

---

## 🔍 How it works

```
  App URL (/view/<app>)
        │  ① fetch HTML  (via proxy)
        ▼
  init("…-modules.json")   ◄── pointer to the source bundle
        │  ② fetch JSON  (via proxy)
        ▼
  { "dependencies": { "user/repo:Script": "<JS source>" }, "path": "<entry>" }
        │  ③ parse + concatenate modules
        ▼
  📜 Readable JavaScript source
```

Both EE URLs live on `*.earthengine.app`, which sends **no CORS headers**, so a
browser can't fetch them directly. The tool routes requests through a small
proxy — your own **Cloudflare Worker** (recommended) or flaky public fallbacks.

---

## 📖 Usage

1. 1️⃣ Copy a **public** Earth Engine app URL, e.g. `https://your-name.users.earthengine.app/view/your-app`
2. 2️⃣ Open the site, expand **⚙️ Proxy settings**, and paste your Cloudflare Worker URL (see below)
3. 3️⃣ Paste the app URL and click **Extract** 🔍
4. 4️⃣ 📋 **Copy script** or ⬇️ **Download .js**

---

## ⚡ Quick start — CLI (no proxy, recommended)

The fastest way, with **zero setup and no proxy**. CORS only restricts browsers,
so from Node we fetch the app directly:

```bash
node extract.js https://your-name.users.earthengine.app/view/your-app
# → saves ee-app-source.js  (runs in ~1–2 seconds)

# optional: choose the output file name
node extract.js https://your-name.users.earthengine.app/view/your-app my-script.js
```

**Prefer no typing?** On Windows, just **double-click `extract.bat`** and paste
the URL when prompted (or drag a URL onto it). Same result, zero command line.

That's it — no Cloudflare, no proxy field, nothing to hang on. The web app
below is only needed if you want a hosted, click-in-browser version.

---

## 🖥️ Web UI — Python backend (no proxy)

Want the click-in-browser experience **without** any proxy? Run the bundled
Python backend. It serves the page **and** does the fetching for it
(frontend → backend → Earth Engine → back), so there's no CORS and no proxy.
Standard library only — nothing to `pip install`.

```bash
python server.py            # then open http://localhost:8000
```

On Windows you can just **double-click `start-web.bat`** — it launches the
server and opens your browser. Paste an app URL, click **Extract**, done.

---

## ☁️ Static hosting (GitHub Pages): set up a proxy

Only needed if you host the front-end **without** the Python backend (e.g. on
GitHub Pages). Browsers block direct cross-site fetches, so deploy a small free
Cloudflare Worker proxy. It's restricted to `*.earthengine.app`, so it can't be
abused as an open proxy.

```bash
cd proxy
npx wrangler login      # opens a browser to authorize (one time)
npx wrangler deploy     # prints your Worker URL
```

You'll get a URL like `https://ee-script-extractor-proxy.<your-subdomain>.workers.dev`.
Paste it into the site's **⚙️ Proxy settings** field (it's saved in your browser),
or append `?proxy=<worker-url>` to the page URL.

---

## 🗂️ Project structure

```
ee-script-extractor/
├── server.py           # 🖥️ Python backend web app (no proxy)
├── extract.js          # ⚡ CLI extractor (no proxy needed)
├── extract.bat         # double-click CLI launcher (Windows)
├── start-web.bat       # double-click web-app launcher (Windows)
├── index.html          # web UI
├── styles.css          # styling
├── app.js              # web app: backend-first, proxy fallback
├── wrangler.toml       # Cloudflare Worker config (deployed from repo root)
├── proxy/
│   ├── worker.js       # Cloudflare Worker CORS proxy
│   └── deploy.bat      # one-click Worker deploy (Windows)
├── sitemap.xml
├── robots.txt
└── README.md
```

---

## ⚠️ Notes & limits

- 🔓 Works only for **public, published** apps — private or unpublished apps return no source.
- 🧩 The extracted code is the **author's published source**; respect its license and the EE Terms of Service.
- 🌐 Front-end code is always visible in the browser — this is a static client-side tool by design.

---

## ❓ FAQ

**How do I extract the source code from a Google Earth Engine app?**
Copy the public app URL (e.g. `https://your-name.users.earthengine.app/view/your-app`),
paste it into EE Script Extractor, and click **Extract**. You get the published
JavaScript source instantly — copy or download it.

**Can I get the JavaScript behind an Earth Engine Apps `/view/` URL?**
Yes, for **public** apps. The page loads a `…-modules.json` bundle that contains
the author's script; this tool fetches and beautifies it for you.

**Does it work for any public GEE app?**
Any published, public Earth Engine app. Private or unpublished apps don't expose
their source, so they can't be extracted.

**Is it free? Do I need to log in?**
Completely free and no login. Use the hosted web app, the Python backend, or the
Node/CLI script.

**Keywords:** extract Google Earth Engine code, get GEE app source code, Earth
Engine Apps JavaScript extractor, view earthengine.app script, download GEE app code.

---

## 🤝 Contributing

Issues and pull requests are welcome! 🙌

## 📜 License

Released under the [MIT License](LICENSE).
