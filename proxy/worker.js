// Cloudflare Worker — a tiny CORS proxy for EE Script Extractor.
//
// It fetches a target URL server-side and returns it with permissive CORS
// headers so the static site can read it. To avoid running an open proxy
// (which gets abused), it only allows https://*.earthengine.app targets —
// exactly what this tool needs.
//
// Deploy:  cd proxy && npx wrangler deploy
// Usage:   https://<your-worker>.workers.dev/?url=<encoded target URL>

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

function isAllowed(target) {
  try {
    const u = new URL(target);
    return u.protocol === "https:" && /(^|\.)earthengine\.app$/.test(u.hostname);
  } catch {
    return false;
  }
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const target = new URL(request.url).searchParams.get("url");
    if (!target) {
      return new Response("Missing ?url= parameter", { status: 400, headers: CORS });
    }
    if (!isAllowed(target)) {
      return new Response("Only https://*.earthengine.app URLs are allowed", {
        status: 403,
        headers: CORS,
      });
    }

    let upstream;
    try {
      upstream = await fetch(target, {
        headers: { "User-Agent": "ee-script-extractor" },
        redirect: "follow",
      });
    } catch (err) {
      return new Response(`Upstream fetch failed: ${err.message}`, { status: 502, headers: CORS });
    }

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...CORS,
        "Content-Type": upstream.headers.get("Content-Type") || "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  },
};
