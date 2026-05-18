const { Readable } = require("node:stream");

const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";
const ANIMEDEX_BASE_URL = "https://animedex.pp.ua";
const ANIZONE_BASE_URL = "https://anizone.to";
const REQUEST_TIMEOUT_MS = 15000;

module.exports = async function handler(req, res) {
  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const route = firstQueryValue(req.query.path).trim();

  if (route === "anime") {
    await handleAnimeRoute(req, res, backendUrl);
    return;
  }

  const query = queryWithout(req.query, ["path"]);
  if (!route) {
    res.status(404).json({ error: "Adult API route not found" });
    return;
  }

  await proxyJson(res, `${backendUrl}/api/adult/${route}${query.toString() ? `?${query}` : ""}`);
};

async function handleAnimeRoute(req, res, backendUrl) {
  const route = firstQueryValue(req.query.animePath).replace(/^\/+|\/+$/g, "");
  const query = queryWithout(req.query, ["path", "animePath"]);

  try {
    if (route === "animedex/search") {
      res.json(await searchAnimeDex(cleanQuery(req.query.title)));
      return;
    }
    if (route === "animedex/episodes") {
      res.json(await getAnimeDexEpisodes({ animeId: cleanQuery(req.query.animeId), anilistId: cleanQuery(req.query.anilistId) }));
      return;
    }
    if (route === "animedex/streams") {
      res.json(await getAnimeDexStreams(cleanQuery(req.query.episodeId || req.query.id)));
      return;
    }
    if (route === "animedex/proxy") {
      await proxyAnimeDexMedia(req, res);
      return;
    }
    if (route === "anizone/search") {
      res.json(await searchAniZone(cleanQuery(req.query.title)));
      return;
    }
    if (route === "anizone/episodes") {
      res.json(await getAniZoneEpisodes(cleanQuery(req.query.animeId)));
      return;
    }
    if (route === "anizone/streams") {
      res.json(await getAniZoneStreams(validateHttpUrl(req.query.episodeUrl || req.query.url)));
      return;
    }
    if (route === "anizone/proxy") {
      await proxyAniZoneMedia(req, res, backendUrl);
      return;
    }
  } catch (error) {
    if (isProviderUnavailableError(error)) {
      res.json(route.endsWith("/search") || route.endsWith("/episodes") ? [] : { provider: route.split("/")[0], sources: [], tracks: [] });
      return;
    }
    res.status(error.status || 502).json({ error: "Anime provider request failed" });
    return;
  }

  await proxyJson(res, `${backendUrl}/api/anime/${route}${query.toString() ? `?${query}` : ""}`);
}

async function searchAnimeDex(title) {
  if (!title) return [];
  const data = await fetchJson(`${ANIMEDEX_BASE_URL}/api/anime/search?q=${encodeURIComponent(title)}&page=1`);
  return asArray(data.animes).map((item) => ({
    provider: "animedex",
    id: item.id,
    anilistId: item.anilistId || "",
    malId: item.malId || "",
    title: cleanHtml(item.name || item.title || item.id),
    nativeTitle: cleanHtml(item.jname || ""),
    url: `${ANIMEDEX_BASE_URL}/watch/${encodeURIComponent(item.id)}/ep-1`,
    image: item.poster || item.image || "",
    banner: item.banner || "",
    episodeCount: item.episodes?.total || item.episodes?.sub || item.totalEpisodes || 0,
    score: titleScore(title, item.name || item.title || item.id),
  })).filter((item) => item.id && item.title && item.score >= 0.2).sort((a, b) => b.score - a.score);
}

async function getAnimeDexEpisodes({ animeId, anilistId }) {
  if (anilistId) {
    const data = await postJson(`${ANIMEDEX_BASE_URL}/api/stream/sources`, { action: "episodes", anilistId });
    const episodes = [...asArray(data.sub).map((item) => ({ ...item, audio: "sub" })), ...asArray(data.dub).map((item) => ({ ...item, audio: "dub" }))];
    if (episodes.length) return episodes.map((episode, index) => animeDexEpisodeRow(episode, index));
  }
  if (!animeId) return [];
  const data = await fetchJson(`${ANIMEDEX_BASE_URL}/api/anime/episodes/${encodeURIComponent(animeId)}`);
  return asArray(data.episodes).map((episode, index) => animeDexEpisodeRow({ ...episode, id: `${animeId}:${episode.epSlug || episode.number}` }, index));
}

function animeDexEpisodeRow(episode, index) {
  const number = episode.number || index + 1;
  return {
    id: episode.id || String(number),
    provider: "animedex",
    number,
    title: cleanHtml(episode.title || `Episode ${number}`),
    date: episode.airDate || "",
    duration: episode.duration || 0,
    image: episode.image || "",
    description: cleanHtml(episode.description || ""),
    audio: episode.audio || "sub",
  };
}

async function getAnimeDexStreams(episodeId) {
  if (!episodeId) return { provider: "animedex", sources: [], tracks: [] };
  const data = await postJson(`${ANIMEDEX_BASE_URL}/api/stream/sources`, { action: "sources", episodeId });
  const tracks = normalizeTrackList(data.subtitles);
  return {
    provider: "animedex",
    sources: asArray(data.sources).filter((source) => source?.url && (source.isHLS || String(source.url).includes(".m3u8"))).map((source, index) => ({
      name: `AnimeDex ${source.quality || index + 1}`,
      quality: source.quality || "auto",
      type: source.isHLS || String(source.url).includes(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp4",
      url: proxyAnimeDexUrl(source.url),
      referer: source.referer || "",
      isHLS: Boolean(source.isHLS || String(source.url).includes(".m3u8")),
      tracks,
    })),
    tracks,
    intro: data.intro || null,
    outro: data.outro || null,
  };
}

async function proxyAnimeDexMedia(req, res) {
  const target = validateHttpUrl(req.query.url);
  if (!target || !isAllowedAnimeDexMediaUrl(target)) {
    res.status(400).json({ error: "valid AnimeDex media url is required" });
    return;
  }
  const response = await fetchWithTimeout(target, { headers: animeDexMediaHeaders(req) });
  if (!response.ok) {
    res.status(response.status).send(await response.text().catch(() => response.statusText));
    return;
  }
  const contentType = animeDexContentTypeForUrl(target, response.headers.get("content-type"));
  res.status(response.status);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", contentType);
  ["content-length", "content-range", "accept-ranges", "cache-control"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) res.setHeader(header, value);
  });
  if (target.includes(".m3u8") || contentType.includes("mpegurl")) {
    const text = await response.text();
    res.send(rewriteM3u8(text, target, proxyAnimeDexUrl));
    return;
  }
  if (!response.body) {
    res.end();
    return;
  }
  Readable.fromWeb(response.body).pipe(res);
}

function animeDexMediaHeaders(req) {
  return {
    Accept: "*/*",
    Referer: "https://kwik.cx/",
    Origin: "https://kwik.cx",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
    ...(req.headers.range ? { Range: req.headers.range } : {}),
  };
}

function proxyAnimeDexUrl(url) {
  return `/api/anime/animedex/proxy?url=${encodeURIComponent(url)}`;
}

function isAllowedAnimeDexMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (parsed.hostname === "owocdn.top" || parsed.hostname.endsWith(".owocdn.top"));
  } catch (error) {
    return false;
  }
}

function animeDexContentTypeForUrl(url, upstreamType = "") {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".jpg") || path.includes("/segment-")) return "video/mp2t";
  return upstreamType || contentTypeForUrl(url);
}

async function searchAniZone(title) {
  if (!title) return [];
  const html = await fetchText(`${ANIZONE_BASE_URL}/anime?search=${encodeURIComponent(title)}`);
  const results = [];
  const seen = new Set();
  const linkRegex = /<a\b[^>]*href="(https:\/\/anizone\.to\/anime\/([a-z0-9-]+))"[^>]*title="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html))) {
    const url = decodeXml(match[1]);
    const id = decodeXml(match[2]);
    if (seen.has(id)) continue;
    seen.add(id);
    const titleText = cleanHtml(match[3]);
    const nearby = html.slice(Math.max(0, match.index - 1200), Math.min(html.length, match.index + 1200));
    const image = firstMatch(nearby, /<img\b[^>]*src="([^"]+)"/i);
    results.push({ provider: "anizone", id, title: titleText, url, image: absolutizeUrl(image, ANIZONE_BASE_URL), score: titleScore(title, titleText) });
  }
  return results.filter((item) => item.score >= 0.2).sort((a, b) => b.score - a.score);
}

async function getAniZoneEpisodes(animeId) {
  const slug = String(animeId || "").replace(/^anizone:/, "").replace(/[^a-z0-9-]/gi, "");
  if (!slug) return [];
  const html = await fetchText(`${ANIZONE_BASE_URL}/anime/${slug}`);
  const links = [];
  const seen = new Set();
  const linkRegex = new RegExp(`href="(https:\\/\\/anizone\\.to\\/anime\\/${escapeRegex(slug)}\\/(\\d+))"`, "gi");
  let match;
  while ((match = linkRegex.exec(html))) {
    const url = decodeXml(match[1]);
    const number = Number(match[2]);
    if (!number || seen.has(number)) continue;
    seen.add(number);
    links.push({ id: url, provider: "anizone", number, title: `Episode ${number}`, date: "", url, description: "AniZone direct HLS episode." });
  }
  return links.sort((a, b) => a.number - b.number);
}

async function getAniZoneStreams(episodeUrl) {
  if (!episodeUrl || !episodeUrl.startsWith(`${ANIZONE_BASE_URL}/anime/`)) return { provider: "anizone", sources: [], tracks: [] };
  const html = await fetchText(episodeUrl, { headers: { Referer: ANIZONE_BASE_URL } });
  const streamUrl = firstMatch(html, /<media-player\b[^>]*\bsrc="([^"]+\.m3u8[^"]*)"/i);
  if (!streamUrl) return { provider: "anizone", sources: [], tracks: [] };
  const tracks = [...html.matchAll(/<track\b[^>]*src=([^\s>]+)[^>]*label="([^"]+)"[^>]*srclang="([^"]+)"/gi)].map((match) => ({
    kind: "subtitles",
    label: cleanHtml(match[2]),
    srclang: match[3],
    url: proxyAniZoneUrl(decodeXml(match[1].replace(/^['"]|['"]$/g, ""))),
  }));
  return { provider: "anizone", sources: [{ name: "AniZone HLS", quality: "auto", type: "application/vnd.apple.mpegurl", url: proxyAniZoneUrl(streamUrl), isHLS: true, tracks }], tracks };
}

async function proxyAniZoneMedia(req, res, backendUrl) {
  const target = validateHttpUrl(req.query.url);
  if (!target || !isAllowedAniZoneMediaUrl(target)) {
    res.status(400).json({ error: "valid AniZone media url is required" });
    return;
  }
  let response = await fetchWithTimeout(target, { headers: mediaHeaders(req) });
  if (response.status === 403 && backendUrl) {
    response = await fetchWithTimeout(`${backendUrl}/api/anime/anizone/proxy?url=${encodeURIComponent(target)}`, { headers: req.headers.range ? { Range: req.headers.range } : {} });
  }
  if (!response.ok) {
    res.status(response.status).send(await response.text().catch(() => response.statusText));
    return;
  }
  const contentType = response.headers.get("content-type") || contentTypeForUrl(target);
  res.status(response.status);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", contentType);
  ["content-length", "content-range", "accept-ranges", "cache-control"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) res.setHeader(header, value);
  });
  if (target.includes(".m3u8") || contentType.includes("mpegurl")) {
    const text = await response.text();
    res.send(rewriteM3u8ForAniZone(text, target));
    return;
  }
  if (!response.body) {
    res.end();
    return;
  }
  Readable.fromWeb(response.body).pipe(res);
}

function mediaHeaders(req) {
  return {
    Accept: "*/*",
    Referer: `${ANIZONE_BASE_URL}/`,
    Origin: ANIZONE_BASE_URL,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
    ...(req.headers.range ? { Range: req.headers.range } : {}),
  };
}

function rewriteM3u8ForAniZone(text, manifestUrl) {
  return rewriteM3u8(text, manifestUrl, proxyAniZoneUrl);
}

function rewriteM3u8(text, manifestUrl, proxyUrl) {
  return String(text || "")
    .replace(/URI="([^"]+)"/g, (_, uri) => `URI="${proxiedM3u8Url(uri, manifestUrl, proxyUrl)}"`)
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      return proxiedM3u8Url(trimmed, manifestUrl, proxyUrl);
    })
    .join("\n");
}

function proxiedM3u8Url(value, manifestUrl, proxyUrl) {
  const url = decodeXml(value);
  if (url.startsWith("/api/anime/")) return url;
  return proxyUrl(new URL(url, manifestUrl).toString());
}

function proxyAniZoneUrl(url) {
  return `/api/anime/anizone/proxy?url=${encodeURIComponent(url)}`;
}

function isAllowedAniZoneMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (parsed.hostname.endsWith(".xin-cdn.xyz") || parsed.hostname.endsWith(".vid-cdn.xyz"));
  } catch (error) {
    return false;
  }
}

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

async function fetchJson(url, options = {}) {
  const text = await fetchText(url, options);
  return text ? JSON.parse(text) : {};
}

async function postJson(url, body) {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: providerHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body || {}),
  });
  if (!response.ok) throw upstreamError(response, url);
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function fetchText(url, options = {}) {
  const response = await fetchWithTimeout(url, { ...options, headers: providerHeaders(options.headers) });
  if (!response.ok) throw upstreamError(response, url);
  return response.text();
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function providerHeaders(headers = {}) {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
    Accept: "application/json,text/plain,*/*",
    "Accept-Language": "en-US,en;q=0.9",
    ...headers,
  };
}

function upstreamError(response, url) {
  const error = new Error(`${response.status} ${response.statusText}`);
  error.status = response.status;
  error.url = url;
  return error;
}

function isProviderUnavailableError(error) {
  return [403, 429, 503].includes(Number(error?.status));
}

function queryWithout(query, names) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (names.includes(key)) continue;
    for (const item of asArray(value)) params.append(key, String(item));
  }
  return params;
}

function firstQueryValue(value) {
  return String(Array.isArray(value) ? value[0] || "" : value || "");
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function cleanQuery(value) {
  return firstQueryValue(value).trim().slice(0, 160);
}

function cleanHtml(value) {
  return decodeXml(String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeXml(value) {
  return String(value || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function firstMatch(text, regex) {
  return regex.exec(String(text || ""))?.[1] || "";
}

function absolutizeUrl(url, baseUrl) {
  if (!url) return "";
  try {
    return new URL(decodeXml(url), baseUrl).toString();
  } catch (error) {
    return "";
  }
}

function validateHttpUrl(value) {
  try {
    const url = new URL(firstQueryValue(value));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch (error) {
    return "";
  }
}

function normalizeTrackList(tracks) {
  return asArray(tracks).filter((track) => track?.url || track?.file).map((track, index) => ({
    kind: track.kind || "subtitles",
    label: track.label || track.lang || track.srclang || `Subtitle ${index + 1}`,
    srclang: track.srclang || track.lang || "en",
    url: track.url || track.file,
  }));
}

function contentTypeForUrl(url) {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  if (path.endsWith(".ts")) return "video/mp2t";
  if (path.endsWith(".m4s")) return "video/iso.segment";
  if (path.endsWith(".key")) return "application/octet-stream";
  if (path.endsWith(".vtt")) return "text/vtt";
  return "application/octet-stream";
}

function titleScore(query, candidate) {
  const a = normalizeTitle(query);
  const b = normalizeTitle(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.replace(/\s+/g, "") === b.replace(/\s+/g, "")) return 0.95;
  if (b.includes(a) || a.includes(b)) return 0.82;
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  const shared = [...aTokens].filter((token) => bTokens.has(token)).length;
  return shared / Math.max(aTokens.size, bTokens.size, 1);
}

function normalizeTitle(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
