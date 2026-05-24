const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";
const { searchWeebCentralManga } = require("../../lib/weebcentral");
const { searchProjectSukiManga } = require("../../lib/projectsuki");
const { searchManhwaZManga } = require("../../lib/manhwaz");
const { searchAdultMangaSource, latestAdultMangaSource } = require("../../lib/adult-manga");

const ADULT_MANGA_PROVIDERS = ["pornhwaz", "hentai20", "pornhwapro", "hentai18", "hentainame", "hentaizap", "hentaifox", "3hentai", "hentaiera", "hentaicity"];

module.exports = async function handler(req, res) {
  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const query = new URLSearchParams(req.query);
  const backendResults = await fetchBackendJson(`${backendUrl}/api/manga/search${query.toString() ? `?${query}` : ""}`);
  const providers = String(req.query.providers || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const results = Array.isArray(backendResults) ? backendResults.filter((item) => !providers.length || providers.includes(item.provider)) : [];
  const title = String(req.query.title || "").trim();
  const tag = String(req.query.tag || "").trim();
  const category = String(req.query.category || "").trim();
  const latest = !title && (String(req.query.latest || "") === "1" || tag);
  const page = Math.max(1, Number.parseInt(req.query.page || "1", 10) || 1);
  if (latest) {
    const latestProviders = ADULT_MANGA_PROVIDERS.filter((provider) => (!providers.length || providers.includes(provider)) && !results.some((item) => item.provider === provider));
    const latestResults = await Promise.allSettled(latestProviders.map((provider) => latestAdultMangaSource(provider, { page, tag, category })));
    latestResults.forEach((result) => {
      if (result.status === "fulfilled") results.push(...result.value);
    });
    res.status(200).json(results);
    return;
  }
  const shouldTryWeebCentral = req.query.title && (!providers.length || providers.includes("weebcentral")) && !results.some((item) => item.provider === "weebcentral");
  const shouldTryProjectSuki = req.query.title && (!providers.length || providers.includes("projectsuki")) && !results.some((item) => item.provider === "projectsuki");
  const shouldTryManhwaZ = req.query.title && (!providers.length || providers.includes("manhwaz")) && !results.some((item) => item.provider === "manhwaz");
  const adultProviders = ADULT_MANGA_PROVIDERS.filter((provider) => req.query.title && (!providers.length || providers.includes(provider)) && !hasStrongAdultMatch(results, provider));
  const adultQueries = doujinQueries(title, providers, adultProviders);

  const [weebCentralResults, projectSukiResults, manhwaZResults, ...adultResults] = await Promise.allSettled([
    shouldTryWeebCentral ? searchWeebCentralManga(title) : [],
    shouldTryProjectSuki ? searchProjectSukiManga(title) : [],
    shouldTryManhwaZ ? searchManhwaZManga(title) : [],
    ...adultProviders.flatMap((provider) => adultQueries.map((query) => searchAdultMangaSource(provider, query, { page }))),
  ]);
  if (weebCentralResults.status === "fulfilled") results.push(...weebCentralResults.value);
  if (projectSukiResults.status === "fulfilled") results.push(...projectSukiResults.value);
  if (manhwaZResults.status === "fulfilled") results.push(...manhwaZResults.value);
  adultResults.forEach((result) => {
    if (result.status === "fulfilled") results.push(...result.value);
  });

  res.status(200).json(results);
};

function doujinQueries(title, providers, adultProviders) {
  const galleryProviders = ["hentaizap", "hentaifox", "3hentai", "hentaiera", "hentaicity"];
  if (!adultProviders.some((provider) => galleryProviders.includes(provider))) return [title];
  const terms = String(title || "").split(/[\s,]+/).map((term) => term.trim()).filter((term) => term.length > 1);
  if (terms.length < 2) return [title];
  return [...new Set([title, ...terms])];
}

async function fetchBackendJson(target) {
  try {
    const response = await fetch(target, { headers: { Accept: "application/json" } });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    return [];
  }
}

function hasStrongAdultMatch(results, provider) {
  if (["hentainame", "hentaizap", "hentaifox", "3hentai", "hentaiera", "hentaicity"].includes(provider)) return results.some((item) => item.provider === provider);
  return results.some((item) => item.provider === provider && Number(item.score || 0) >= 0.45);
}
