module.exports = async function handler(req, res) {
  const manifestUrl = validateHttpUrl(req.query.url);
  const title = String(req.query.title || "").trim();
  const episode = String(req.query.episode || "1").trim();
  const malId = String(req.query.malId || "").trim();
  const anilistId = String(req.query.anilistId || "").trim();
  if (!manifestUrl || !title) {
    res.status(400).json({ error: "url and title are required" });
    return;
  }

  try {
    const streams = await searchStremioByTitle({ manifestUrl, title, episode, malId, anilistId });
    res.status(200).json(streams);
  } catch (error) {
    res.status(502).json({ error: "Stremio search failed" });
  }
};

async function searchStremioByTitle({ manifestUrl, title, episode, malId, anilistId }) {
  const baseUrl = addonBaseUrl(manifestUrl);
  const manifest = await fetchJson(manifestUrl);
  const catalogs = asArray(manifest.catalogs).filter((catalog) => ["series", "anime", "movie"].includes(catalog.type));
  const metas = [];

  for (const catalog of catalogs) {
    const supportsSearch = asArray(catalog.extra).some((extra) => extra.name === "search");
    if (!supportsSearch && catalogs.length > 1) continue;

    try {
      const data = await fetchJson(`${baseUrl}/catalog/${pathSegment(catalog.type)}/${pathSegment(catalog.id)}/search=${encodeURIComponent(title)}.json`);
      asArray(data.metas).forEach((meta) => metas.push({ ...meta, type: catalog.type }));
    } catch (error) {
      // Try the next catalog.
    }
  }

  const bestMetas = metas
    .map((meta) => ({ ...meta, score: titleScore(title, meta.name || meta.title || "") }))
    .filter((meta) => meta.score > 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const fallbackIds = [];
  if (malId) fallbackIds.push(`mal:${malId}:${episode}`, `mal:${malId}`);
  if (anilistId) fallbackIds.push(`anilist:${anilistId}:${episode}`, `anilist:${anilistId}`);

  for (const meta of bestMetas) {
    const streamIds = await streamIdCandidates(baseUrl, meta, episode);
    const streams = await firstStreamsForIds(baseUrl, meta.type, [...streamIds, ...fallbackIds]);
    if (streams.length) return streams.map((stream) => ({ ...stream, matchedTitle: meta.name || meta.title, matchedId: meta.id }));
  }

  return firstStreamsForIds(baseUrl, "series", fallbackIds);
}

async function streamIdCandidates(baseUrl, meta, episode) {
  const ids = [meta.id, `${meta.id}:${episode}`, `${meta.id}:1:${episode}`, `${meta.id}:0:${episode}`].filter(Boolean);
  try {
    const data = await fetchJson(`${baseUrl}/meta/${pathSegment(meta.type)}/${pathSegment(meta.id)}.json`);
    asArray(data.meta?.videos).forEach((video) => {
      if (String(video.episode || "") === String(episode) || String(video.title || "").includes(String(episode))) ids.unshift(video.id);
    });
  } catch (error) {
    // Meta endpoint is optional.
  }
  return [...new Set(ids)];
}

async function firstStreamsForIds(baseUrl, type, ids) {
  for (const id of ids.filter(Boolean)) {
    try {
      const data = await fetchJson(`${baseUrl}/stream/${pathSegment(type)}/${pathSegment(id)}.json`);
      if (asArray(data.streams).length) return data.streams;
    } catch (error) {
      // Try next ID.
    }
  }
  return [];
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 AniTrack/1.0",
      "Accept": "application/json,text/plain,*/*",
    },
  });
  if (response.status === 404) return {};
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function addonBaseUrl(manifestUrl) {
  return manifestUrl.replace(/\/manifest\.json(?:\?.*)?$/i, "").replace(/\/+$/, "");
}

function titleScore(query, candidate) {
  const a = normalizeTitle(query);
  const b = normalizeTitle(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (b.includes(a) || a.includes(b)) return 0.82;
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  const shared = [...aTokens].filter((token) => bTokens.has(token)).length;
  return shared / Math.max(aTokens.size, bTokens.size, 1);
}

function normalizeTitle(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
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

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
