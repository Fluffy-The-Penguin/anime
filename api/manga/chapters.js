const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";
const { getWeebCentralChapters } = require("../../lib/weebcentral");
const { getProjectSukiChapters } = require("../../lib/projectsuki");
const { getManhwaZChapters } = require("../../lib/manhwaz");

module.exports = async function handler(req, res) {
  const mangaId = String(req.query.mangaId || "");
  if (mangaId.startsWith("weebcentral:")) {
    try {
      res.status(200).json(await getWeebCentralChapters(mangaId.slice(12)));
      return;
    } catch (error) {
      // Fall back to the backend proxy below.
    }
  }
  if (mangaId.startsWith("projectsuki:")) {
    try {
      res.status(200).json(await getProjectSukiChapters(mangaId.slice(12)));
      return;
    } catch (error) {
      // Fall back to the backend proxy below.
    }
  }
  if (mangaId.startsWith("manhwaz:")) {
    try {
      res.status(200).json(await getManhwaZChapters(mangaId.slice(8)));
      return;
    } catch (error) {
      // Fall back to the backend proxy below.
    }
  }

  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const query = new URLSearchParams(req.query);
  await proxyJson(res, `${backendUrl}/api/manga/chapters${query.toString() ? `?${query}` : ""}`);
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
