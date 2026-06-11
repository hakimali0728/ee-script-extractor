<div align="center">

# 🌍 EE Script Extractor

### Extract the JavaScript source from any public Google Earth Engine app — paste a URL, get clean code.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-GitHub_Pages-2ea043?style=for-the-badge)](https://hakimali0728.github.io/ee-script-extractor)
[![Made with Vanilla JS](https://img.shields.io/badge/Made_with-Vanilla_JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**🔗 Live site:** [`https://hakimali0728.github.io/ee-script-extractor`](https://hakimali0728.github.io/ee-script-extractor)

</div>

---

## ✨ What it does

EE Script Extractor is a tiny, **zero-dependency** web tool that pulls the JavaScript source out of a public Google Earth Engine app. No installs, no build step — just open the page and paste a URL. 🎯

---

## 📖 Usage

### 1️⃣ Copy your Earth Engine app URL

Go to your app and copy the URL from the browser. It looks like this:

```
https://google.earthengine.app/view/forest-change
```

### 2️⃣ Paste it into EE Script Extractor

Open the site, paste the URL into the input box, and click **Extract**. 🔍

### 3️⃣ Get your JavaScript

The tool fetches and shows you the clean, formatted JavaScript source:

```javascript
var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');
Map.addLayer(gfc2014);
// ...
```

### 4️⃣ Copy or download

- 📋 Click **Copy script** to copy everything to your clipboard
- ⬇️ Click **Download .js** to save it as a file

---

## 🖥️ Run it locally

No dependencies required — any static file server works.

```bash
# Clone the repo
git clone https://github.com/hakimali0728/ee-script-extractor.git
cd ee-script-extractor

# Serve it (pick one)
python -m http.server 8000     # Python 3
npx serve .                    # Node.js
```

Then open 👉 **http://localhost:8000**

---

## ⚙️ How it works

```
Browser  ──►  CORS proxy  ──►  Earth Engine app  ──►  HTML
   ▲                                                    │
   └────────────  extracted JavaScript  ◄───────────────┘
```

Browsers block direct cross-origin requests (CORS), so the tool routes the
request through a public CORS proxy, then parses the returned HTML for inline
scripts, referenced `.js` files, and embedded Earth Engine code patterns.

> ⚠️ **Note:** Public proxies are best-effort — they can be rate-limited or
> temporarily down. For production reliability, host your own lightweight proxy.

---

## 🗂️ Project structure

```
ee-script-extractor/
├── index.html      # UI
├── styles.css      # styling
├── app.js          # fetch + extract logic
└── README.md
```

---

## 🤝 Contributing

Issues and pull requests are welcome! 🙌

## 📜 License

Released under the [MIT License](LICENSE).
