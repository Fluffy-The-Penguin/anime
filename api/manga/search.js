const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";
const { searchWeebCentralManga } = require("../_weebcentral");

module.exports = async function handler(req, res) {
  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const query = new URLSearchParams(req.query);
  const backendResults = await fetchBackendJson(`${backendUrl}/api/manga/search${query.toString() ? `?${query}` : ""}`);
  const results = Array.isArray(backendResults) ? backendResults : [];
  const providers = String(req.query.providers || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const shouldTryWeebCentral = req.query.title && (!providers.length || providers.includes("weebcentral")) && !results.some((item) => item.provider === "weebcentral");

  if (shouldTryWeebCentral) {
    const weebCentralResults = await searchWeebCentralManga(String(req.query.title || "").trim());
    results.push(...weebCentralResults);
  }

  res.status(200).json(results);
};

async function fetchBackendJson(target) {
  try {
    const response = await fetch(target, { headers: { Accept: "application/json" } });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    return [];
  }
}
