const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";

module.exports = async function handler(req, res) {
  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const path = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path || "";
  const query = new URLSearchParams(req.query);
  query.delete("path");

  await proxyJson(res, `${backendUrl}/api/adult/${path}${query.toString() ? `?${query}` : ""}`);
};

async function proxyJson(res, target) {
  try {
    const response = await fetch(target, { headers: { Accept: "application/json" } });
    const body = await response.text();
    res.status(response.status);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.send(body);
  } catch (error) {
    res.status(502).json({ error: "Backend proxy failed" });
  }
}
