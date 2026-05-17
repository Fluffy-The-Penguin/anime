module.exports = async function handler(req, res) {
  const manifestUrl = validateHttpUrl(req.query.url);
  const type = String(req.query.type || "series").trim();
  const id = String(req.query.id || "").trim();
  if (!manifestUrl || !type || !id) {
    res.status(400).json({ error: "url, type, and id are required" });
    return;
  }

  const baseUrl = manifestUrl.replace(/\/manifest\.json(?:\?.*)?$/i, "").replace(/\/+$/, "");
  await proxyJson(res, `${baseUrl}/stream/${pathSegment(type)}/${pathSegment(id)}.json`);
};

async function proxyJson(res, target) {
  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 AniTrack/1.0",
        "Accept": "application/json,text/plain,*/*",
      },
    });
    if (response.status === 404) {
      res.status(200).json([]);
      return;
    }
    const body = await response.text();
    res.status(response.status);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.send(body);
  } catch (error) {
    res.status(502).json({ error: "Backend proxy failed" });
  }
}

function validateHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch (error) {
    return "";
  }
}

function pathSegment(value) {
  return encodeURIComponent(value).replace(/%3A/gi, ":");
}
