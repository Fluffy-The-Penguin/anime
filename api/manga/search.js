const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";
const { searchWeebCentralManga } = require("../../lib/weebcentral");
const { searchProjectSukiManga } = require("../../lib/projectsuki");

module.exports = async function handler(req, res) {
  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const query = new URLSearchParams(req.query);
  const backendResults = await fetchBackendJson(`${backendUrl}/api/manga/search${query.toString() ? `?${query}` : ""}`);
  const providers = String(req.query.providers || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const results = Array.isArray(backendResults) ? backendResults.filter((item) => !providers.length || providers.includes(item.provider)) : [];
  const shouldTryWeebCentral = req.query.title && (!providers.length || providers.includes("weebcentral")) && !results.some((item) => item.provider === "weebcentral");
  const shouldTryProjectSuki = req.query.title && (!providers.length || providers.includes("projectsuki")) && !results.some((item) => item.provider === "projectsuki");

  const title = String(req.query.title || "").trim();
  const [weebCentralResults, projectSukiResults] = await Promise.allSettled([
    shouldTryWeebCentral ? searchWeebCentralManga(title) : [],
    shouldTryProjectSuki ? searchProjectSukiManga(title) : [],
  ]);
  if (weebCentralResults.status === "fulfilled") results.push(...weebCentralResults.value);
  if (projectSukiResults.status === "fulfilled") results.push(...projectSukiResults.value);

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
