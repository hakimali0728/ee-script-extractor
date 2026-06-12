# 📣 Launch posts — EE Script Extractor

Ready-to-paste posts for different platforms. Links used:
- 🔗 Live tool: https://hakimali0728.github.io/ee-script-extractor/
- 💻 Repo: https://github.com/hakimali0728/ee-script-extractor

> Tip: communities dislike pure self-promo. Reply to comments, answer questions,
> and be upfront about the limitation (only **public, published** apps). That
> honesty earns trust *and* backlinks.

---

## 1) Reddit — r/GoogleEarthEngine, r/gis, r/remotesensing

**Title:** I built a free tool to extract the JavaScript source from any public Earth Engine app

**Body:**

Ever come across a slick Google Earth Engine app and wished you could see how it
was built? I kept hitting that wall, so I made a small free tool for it.

**EE Script Extractor** — paste a public EE app URL (the `…/view/…` one) and it
pulls out the published JavaScript source so you can read, learn from, copy, or
download it.

👉 Try it: https://hakimali0728.github.io/ee-script-extractor/

- No login, completely free
- Open source (MIT): https://github.com/hakimali0728/ee-script-extractor
- Also ships a Python backend and a Node CLI if you prefer running it locally

**Honest limitation:** it only works for **public, published** apps — those
expose their source in a `modules.json` bundle the page loads. Private or
unpublished apps don't expose anything, so they can't be extracted. Please
respect each script's license / the EE Terms of Service.

Feedback and PRs welcome — what would make this more useful for your workflow?

---

## 2) Google Earth Engine Developers Group (groups.google.com/g/google-earth-engine-developers)

**Subject:** Free open-source tool: extract the JS source of a public EE app from its URL

Hi all,

I built a small open-source tool that extracts the published JavaScript source
of a **public** Earth Engine app directly from its app URL.

How it works: a published EE app loads a `<app>-modules.json` bundle that
contains the author's script. The tool fetches that, parses the `dependencies`,
and shows you clean, formatted source you can copy or download.

- Web app: https://hakimali0728.github.io/ee-script-extractor/
- Source (MIT): https://github.com/hakimali0728/ee-script-extractor
- Bonus: Python backend + Node CLI for local/offline use

It only works for public, published apps (private ones don't expose source), and
I'd encourage everyone to respect the original author's license.

Hope it's useful for learning and debugging. Happy to take suggestions.

---

## 3) LinkedIn

🌍 Ever admired a Google Earth Engine app and wished you could peek at its code?

I built a free, open-source tool that does exactly that: paste a public EE app
URL → get its published JavaScript source, ready to read, copy, or download.

✅ Free, no login
✅ Open source (MIT)
✅ Web app + Python backend + Node CLI
ℹ️ Works for public, published apps only — please respect each script's license

Try it 👉 https://hakimali0728.github.io/ee-script-extractor/
Code 👉 https://github.com/hakimali0728/ee-script-extractor

#GoogleEarthEngine #RemoteSensing #GIS #Geospatial #OpenSource #JavaScript

---

## 4) X / Twitter

Built a tiny free tool: paste a public Google Earth Engine app URL → get its
JavaScript source code. Read it, copy it, download it. 🌍

No login. Open source. Web + CLI.

🔗 https://hakimali0728.github.io/ee-script-extractor/

#GoogleEarthEngine #GIS #RemoteSensing #geospatial

---

## 5) dev.to / Medium (short announcement)

**Title:** Extract the source code of any public Google Earth Engine app

**Tags:** earthengine, gis, javascript, opensource

Google Earth Engine "Apps" are great for sharing analyses — but the underlying
script isn't shown to viewers. It is, however, loaded by the page as a
`modules.json` bundle. I built **EE Script Extractor** to fetch and beautify
that bundle so you can read the published source.

**Use it:**
1. Copy a public app URL, e.g. `https://your-name.users.earthengine.app/view/your-app`
2. Paste it into https://hakimali0728.github.io/ee-script-extractor/
3. Click **Extract** → copy or download the `.js`

It's MIT-licensed and runs as a static site (via a Cloudflare Worker proxy), a
zero-dependency Python backend, or a Node CLI — whatever fits your setup:
https://github.com/hakimali0728/ee-script-extractor

**Caveat:** public, published apps only; private apps don't expose source.
Respect each script's license and the EE Terms of Service.
