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

## ☁️ Web app: set up the proxy (required for the browser version only)

Public CORS proxies are unreliable and are often blocked on corporate networks,
so deploy your own free Cloudflare Worker. It's restricted to `*.earthengine.app`
targets, so it can't be abused as an open proxy.

```bash
cd proxy
npx wrangler login      # opens a browser to authorize (one time)
npx wrangler deploy     # prints your Worker URL
```

You'll get a URL like `https://ee-script-extractor-proxy.<your-subdomain>.workers.dev`.
Paste it into the site's **⚙️ Proxy settings** field (it's saved in your browser),
or append `?proxy=<worker-url>` to the page URL.

---

## 🖥️ Run it locally

No dependencies — any static file server works.

```bash
git clone https://github.com/hakimali0728/ee-script-extractor.git
cd ee-script-extractor

python -m http.server 8000     # Python 3
# or: npx serve .
```

Then open 👉 **http://localhost:8000** (you'll still need the Worker proxy for extraction).

---

## 🗂️ Project structure

```
ee-script-extractor/
├── extract.js          # ⚡ CLI extractor (no proxy needed)
├── index.html          # web UI
├── styles.css          # styling
├── app.js              # web app: two-step fetch + parse logic
├── proxy/
│   ├── worker.js       # Cloudflare Worker CORS proxy
│   └── wrangler.toml   # Worker config
└── README.md
```

---

## ⚠️ Notes & limits

- 🔓 Works only for **public, published** apps — private or unpublished apps return no source.
- 🧩 The extracted code is the **author's published source**; respect its license and the EE Terms of Service.
- 🌐 Front-end code is always visible in the browser — this is a static client-side tool by design.

---

## 🤝 Contributing

Issues and pull requests are welcome! 🙌

## 📜 License

Released under the [MIT License](LICENSE).
