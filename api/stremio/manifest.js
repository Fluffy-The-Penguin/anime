module.exports = async function handler(req, res) {
  const url = validateHttpUrl(req.query.url);
  if (!url) {
    res.status(400).json({ error: "url is required" });
    return;
  }

  await proxyJson(res, url);
};

async function proxyJson(res, target) {
  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 AniTrack/1.0",
        "Accept": "application/json,text/plain,*/*",
      },
    });
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
