const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";
const { getWeebCentralPages } = require("../../lib/weebcentral");
const { getProjectSukiPages } = require("../../lib/projectsuki");
const { getManhwaZPages } = require("../../lib/manhwaz");
const { getAdultMangaPages } = require("../../lib/adult-manga");

const ADULT_MANGA_PROVIDERS = ["pornhwaz", "hentai20", "pornhwapro", "hentai18", "hentainame", "hentaizap", "hentaifox"];

module.exports = async function handler(req, res) {
  const chapterId = String(req.query.chapterId || "");
  if (chapterId.startsWith("weebcentral:")) {
    try {
      res.status(200).json({ pages: await getWeebCentralPages(chapterId.slice(12)) });
      return;
    } catch (error) {
      // Fall back to the backend proxy below.
    }
  }
  if (chapterId.startsWith("projectsuki:")) {
    try {
      res.status(200).json({ pages: await getProjectSukiPages(chapterId.slice(12)) });
      return;
    } catch (error) {
      // Fall back to the backend proxy below.
    }
  }
  if (chapterId.startsWith("manhwaz:")) {
    try {
      res.status(200).json({ pages: await getManhwaZPages(chapterId.slice(8)) });
      return;
    } catch (error) {
      // Fall back to the backend proxy below.
    }
  }
  const adultProvider = ADULT_MANGA_PROVIDERS.find((provider) => chapterId.startsWith(`${provider}:`));
  if (adultProvider) {
    try {
      res.status(200).json({ pages: await getAdultMangaPages(adultProvider, chapterId.slice(adultProvider.length + 1)) });
      return;
    } catch (error) {
      // Fall back to the backend proxy below.
    }
  }

  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const query = new URLSearchParams(req.query);
  await proxyJson(res, `${backendUrl}/api/manga/pages${query.toString() ? `?${query}` : ""}`);
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
