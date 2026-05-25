const { Readable } = require("node:stream");

const DEFAULT_BACKEND_URL = "http://fi10.bot-hosting.net:21204";
const ANILIST_URL = "https://graphql.anilist.co";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";
const ANIMEDEX_BASE_URL = "https://animedex.pp.ua";
const ANIZONE_BASE_URL = "https://anizone.to";
const ANILIBRIA_BASE_URL = "https://anilibria.top";
const TOKYOINSIDER_BASE_URL = "https://www.tokyoinsider.com";
const JIMAKU_BASE_URL = "https://jimaku.cc";
const REQUEST_TIMEOUT_MS = 15000;

module.exports = async function handler(req, res) {
  const backendUrl = (process.env.ANITRACK_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const route = firstQueryValue(req.query.path).trim();

  if (route === "anime") {
    await handleAnimeRoute(req, res, backendUrl);
    return;
  }
  if (route === "anilist") {
    await handleAniListRoute(req, res, backendUrl);
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
      res.json(await getAnimeDexStreams(cleanQuery(req.query.episodeId || req.query.id), subtitleContextFromRequest(req)));
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
      res.json(await getAniZoneStreams(validateHttpUrl(req.query.episodeUrl || req.query.url), subtitleContextFromRequest(req)));
      return;
    }
    if (route === "anizone/proxy") {
      await proxyAniZoneMedia(req, res, backendUrl);
      return;
    }
    if (route === "anilibria/search") {
      res.json(await searchAniLibria(cleanQuery(req.query.title)));
      return;
    }
    if (route === "anilibria/episodes") {
      res.json(await getAniLibriaEpisodes(cleanQuery(req.query.animeId)));
      return;
    }
    if (route === "anilibria/streams") {
      res.json(await getAniLibriaStreams(cleanQuery(req.query.releaseId || req.query.animeId), cleanQuery(req.query.episodeId || req.query.id), subtitleContextFromRequest(req)));
      return;
    }
    if (route === "anilibria/proxy") {
      await proxyAniLibriaMedia(req, res);
      return;
    }
    if (route === "tokyoinsider/search") {
      res.json(await searchTokyoInsider(cleanQuery(req.query.title)));
      return;
    }
    if (route === "tokyoinsider/episodes") {
      res.json(await getTokyoInsiderEpisodes(cleanQuery(req.query.animeId)));
      return;
    }
    if (route === "tokyoinsider/streams") {
      res.json(await getTokyoInsiderStreams(validateTokyoInsiderPageUrl(req.query.episodeUrl || req.query.url), subtitleContextFromRequest(req)));
      return;
    }
    if (route === "tokyoinsider/proxy") {
      await proxyTokyoInsiderMedia(req, res);
      return;
    }
    if (route === "jimaku/proxy") {
      await proxyJimakuSubtitle(req, res);
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

async function handleAniListRoute(req, res, backendUrl) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    if (!body?.query) {
      res.status(400).json({ error: "Missing AniList query" });
      return;
    }

    let response;
    try {
      response = await fetchWithTimeout(`${backendUrl}/api/anilist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: body.query, variables: body.variables || {} }),
      });
    } catch (error) {
      const fallback = await directAniListResponse(body).catch(() => fallbackAniListResponse(body));
      res.json(fallback);
      return;
    }
    const text = await response.text();
    if (!response.ok) {
      const fallback = await directAniListResponse(body).catch(() => fallbackAniListResponse(body));
      res.json(fallback);
      return;
    }
    res.status(response.status);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (error) {
    res.status(502).json({ error: "AniList proxy failed" });
  }
}

async function directAniListResponse(body) {
  const response = await fetchWithTimeout(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: body.query, variables: body.variables || {} }),
  });
  if (!response.ok) throw new Error(`AniList request failed: ${response.status}`);
  return response.json();
}

async function fallbackAniListResponse(body) {
  const query = String(body?.query || "");
  const variables = body?.variables || {};
  const type = /type:\s*MANGA/.test(query) ? "manga" : "anime";
  const page = Math.max(1, Number(variables.page) || 1);

  if (/Media\s*\(/.test(query)) {
    const id = Number(variables.id);
    if (!id) return null;
    const data = await fetchJson(`${JIKAN_BASE_URL}/${type}/${id}/full`);
    return { data: { Media: type === "manga" ? jikanToAniListManga(data.data) : jikanToAniListAnime(data.data) } };
  }

  const params = new URLSearchParams({ page: String(page), limit: "25" });
  if (variables.search) params.set("q", String(variables.search));
  if (variables.year) params.set("start_date", `${variables.year}-01-01`);
  const endpoint = variables.search ? `${JIKAN_BASE_URL}/${type}` : `${JIKAN_BASE_URL}/top/${type}`;
  const data = await fetchJson(`${endpoint}?${params}`);
  const mapper = type === "manga" ? jikanToAniListManga : jikanToAniListAnime;
  return { data: { Page: { media: asArray(data.data).map(mapper).filter(Boolean) } } };
}

function jikanToAniListAnime(item) {
  if (!item) return null;
  return {
    id: item.mal_id,
    idMal: item.mal_id,
    dataSource: "jikan",
    title: { romaji: item.title || "", english: item.title_english || item.title || "", native: item.title_japanese || "" },
    synonyms: asArray(item.title_synonyms),
    description: item.synopsis || "",
    episodes: item.episodes || 0,
    duration: parseDurationMinutes(item.duration),
    averageScore: item.score ? Math.round(Number(item.score) * 10) : null,
    popularity: item.members || 0,
    seasonYear: item.year || yearFromDate(item.aired?.from),
    status: item.status || "Unknown",
    format: item.type || "Anime",
    genres: asArray(item.genres).map((genre) => genre.name).filter(Boolean),
    bannerImage: item.trailer?.images?.maximum_image_url || item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
    coverImage: { extraLarge: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "", large: item.images?.jpg?.image_url || "", color: null },
    studios: { nodes: asArray(item.studios).map((studio) => ({ name: studio.name })) },
    streamingEpisodes: [],
  };
}

function jikanToAniListManga(item) {
  if (!item) return null;
  return {
    id: item.mal_id,
    idMal: item.mal_id,
    dataSource: "jikan",
    title: { romaji: item.title || "", english: item.title_english || item.title || "", native: item.title_japanese || "" },
    synonyms: asArray(item.title_synonyms),
    description: item.synopsis || "",
    chapters: item.chapters || 0,
    volumes: item.volumes || 0,
    averageScore: item.score ? Math.round(Number(item.score) * 10) : null,
    popularity: item.members || 0,
    seasonYear: yearFromDate(item.published?.from),
    status: item.status || "Unknown",
    format: item.type || "Manga",
    genres: asArray(item.genres).map((genre) => genre.name).filter(Boolean),
    bannerImage: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
    coverImage: { extraLarge: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "", large: item.images?.jpg?.image_url || "", color: null },
    staff: { nodes: asArray(item.authors).slice(0, 1).map((author) => ({ name: { full: author.name } })) },
  };
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

async function getAnimeDexStreams(episodeId, subtitleContext = {}) {
  if (!episodeId) return { provider: "animedex", sources: [], tracks: [] };
  const data = await postJson(`${ANIMEDEX_BASE_URL}/api/stream/sources`, { action: "sources", episodeId });
  const tracks = await mergeExternalSubtitleTracks(normalizeTrackList(data.subtitles), subtitleContext);
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
    const allowedHosts = ["owocdn.top", "uwucdn.top"];
    return parsed.protocol === "https:" && allowedHosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
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

async function getAniZoneStreams(episodeUrl, subtitleContext = {}) {
  if (!episodeUrl || !episodeUrl.startsWith(`${ANIZONE_BASE_URL}/anime/`)) return { provider: "anizone", sources: [], tracks: [] };
  const html = await fetchText(episodeUrl, { headers: { Referer: ANIZONE_BASE_URL } });
  const streamUrl = firstMatch(html, /<media-player\b[^>]*\bsrc="([^"]+\.m3u8[^"]*)"/i);
  if (!streamUrl) return { provider: "anizone", sources: [], tracks: [] };
  const tracks = await mergeExternalSubtitleTracks([...html.matchAll(/<track\b[^>]*src=([^\s>]+)[^>]*label="([^"]+)"[^>]*srclang="([^"]+)"/gi)].map((match) => ({
    kind: "subtitles",
    label: cleanHtml(match[2]),
    srclang: match[3],
    url: proxyAniZoneUrl(decodeXml(match[1].replace(/^['"]|['"]$/g, ""))),
  })), subtitleContext);
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

async function searchAniLibria(title) {
  if (!title) return [];
  const data = await fetchJson(`${ANILIBRIA_BASE_URL}/api/v1/app/search/releases?query=${encodeURIComponent(title)}&limit=20`);
  return asArray(data).map((item) => {
    const mainTitle = item?.name?.english || item?.name?.main || item?.name?.alternative || "";
    const nativeTitle = item?.name?.main || "";
    const image = item?.poster?.optimized?.src || item?.poster?.src || item?.poster?.preview || item?.poster?.thumbnail || "";
    return {
      provider: "anilibria",
      id: String(item.id || ""),
      title: mainTitle,
      nativeTitle,
      url: `${ANILIBRIA_BASE_URL}/anime/releases/${item.alias || item.id}`,
      image: absolutizeUrl(image, ANILIBRIA_BASE_URL),
      year: item.year || "",
      episodeCount: Number(item.episodes_total || 0),
      score: Math.max(titleScore(title, mainTitle), titleScore(title, nativeTitle)),
    };
  }).filter((item) => item.id && item.title && item.score >= 0.2).sort((a, b) => b.score - a.score).slice(0, 20);
}

async function getAniLibriaEpisodes(releaseId) {
  const release = await getAniLibriaRelease(releaseId);
  const releaseNumber = String(release?.id || releaseId || "");
  return asArray(release?.episodes).filter((episode) => episode?.id && (episode.hls_480 || episode.hls_720 || episode.hls_1080)).map((episode, index) => {
    const number = Number(episode.ordinal || episode.sort_order || index + 1);
    return {
      id: episode.id,
      provider: "anilibria",
      number,
      title: cleanHtml(episode.name_english || episode.name) || `Episode ${number || index + 1}`,
      date: "AniLibria RU HLS",
      url: `${ANILIBRIA_BASE_URL}/anime/releases/${releaseNumber}?episode=${encodeURIComponent(episode.id)}`,
      image: absolutizeUrl(episode.preview?.optimized?.src || episode.preview?.src || release?.poster?.optimized?.src || release?.poster?.src || "", ANILIBRIA_BASE_URL),
      description: "AniLibria Russian/fansub HLS episode.",
    };
  }).sort((a, b) => Number(a.number) - Number(b.number));
}

async function getAniLibriaStreams(releaseId, episodeId, subtitleContext = {}) {
  const release = await getAniLibriaRelease(releaseId);
  const episode = asArray(release?.episodes).find((item) => String(item.id) === String(episodeId) || String(item.ordinal) === String(episodeId) || String(item.sort_order) === String(episodeId));
  if (!episode) return { provider: "anilibria", sources: [], tracks: [] };
  const tracks = await mergeExternalSubtitleTracks([], subtitleContext);
  const sources = [
    ["1080p", episode.hls_1080],
    ["720p", episode.hls_720],
    ["480p", episode.hls_480],
  ].filter(([, url]) => url).map(([quality, url]) => ({
    name: `AniLibria ${quality}`,
    quality,
    type: "application/vnd.apple.mpegurl",
    url: proxyAniLibriaUrl(url),
    isHLS: true,
    tracks,
  }));
  return { provider: "anilibria", sources, tracks };
}

async function getAniLibriaRelease(releaseId) {
  const id = String(releaseId || "").replace(/^anilibria:/, "").replace(/[^0-9]/g, "");
  if (!id) return null;
  return fetchJson(`${ANILIBRIA_BASE_URL}/api/v1/anime/releases/${encodeURIComponent(id)}`);
}

async function proxyAniLibriaMedia(req, res) {
  const target = validateHttpUrl(req.query.url);
  if (!target || !isAllowedAniLibriaMediaUrl(target)) {
    res.status(400).json({ error: "valid AniLibria media url is required" });
    return;
  }
  const response = await fetchWithTimeout(target, { headers: aniLibriaMediaHeaders(req) });
  if (!response.ok) {
    res.status(response.status).send(await response.text().catch(() => response.statusText));
    return;
  }
  const contentType = response.headers.get("content-type") || contentTypeForUrl(target);
  res.status(response.status);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", contentType.includes("mpegURL") ? "application/vnd.apple.mpegurl" : contentType);
  ["content-length", "content-range", "accept-ranges", "cache-control"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) res.setHeader(header, value);
  });
  if (target.includes(".m3u8") || contentType.toLowerCase().includes("mpegurl")) {
    const text = await response.text();
    res.send(rewriteM3u8(text, target, proxyAniLibriaUrl));
    return;
  }
  if (!response.body) {
    res.end();
    return;
  }
  Readable.fromWeb(response.body).pipe(res);
}

function aniLibriaMediaHeaders(req) {
  return {
    Accept: "*/*",
    Referer: `${ANILIBRIA_BASE_URL}/`,
    Origin: ANILIBRIA_BASE_URL,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
    ...(req.headers.range ? { Range: req.headers.range } : {}),
  };
}

function proxyAniLibriaUrl(url) {
  return `/api/anime/anilibria/proxy?url=${encodeURIComponent(url)}`;
}

function isAllowedAniLibriaMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "cache.libria.fun" && /\.(?:m3u8|ts)$/i.test(parsed.pathname);
  } catch (error) {
    return false;
  }
}

async function searchTokyoInsider(title) {
  if (!title) return [];
  const results = new Map();
  try {
    const script = await fetchText(`${TOKYOINSIDER_BASE_URL}/upload/autocomplete.js`);
    const entryRegex = /\["([^"]+)","([^"]+)"\]/g;
    let match;
    while ((match = entryRegex.exec(script))) {
      const titleText = cleanHtml(match[1]);
      const path = decodeXml(match[2]).replace(/\\\//g, "/");
      addTokyoInsiderSearchResult(results, title, titleText, path);
    }
  } catch (error) {
    // Fall through to the public search page, which often includes newer entries.
  }

  try {
    const html = await fetchText(`${TOKYOINSIDER_BASE_URL}/anime/search?k=${encodeURIComponent(title).replace(/%20/g, "+")}`);
    const linkRegex = /<a\b[^>]*href="([^"]*\/anime\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html))) {
      const href = decodeXml(match[1]);
      const text = cleanHtml(match[2]);
      const seriesPath = tokyoInsiderSeriesPath(href);
      if (seriesPath) addTokyoInsiderSearchResult(results, title, text || tokyoInsiderTitleFromPath(seriesPath), seriesPath);
    }
  } catch (error) {
    // Search page is a secondary source only.
  }

  return [...results.values()].filter((item) => item.score >= 0.2).sort((a, b) => b.score - a.score).slice(0, 20);
}

function addTokyoInsiderSearchResult(results, query, titleText, path) {
  const seriesPath = tokyoInsiderSeriesPath(path);
  if (!seriesPath || !titleText) return;
  const score = titleScore(query, titleText);
  const existing = results.get(seriesPath);
  if (!existing || score > existing.score) {
    results.set(seriesPath, {
      provider: "tokyoinsider",
      id: seriesPath.replace(/^\//, ""),
      title: titleText,
      url: `${TOKYOINSIDER_BASE_URL}${seriesPath}`,
      image: "",
      score,
    });
  }
}

function tokyoInsiderSeriesPath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let path = raw;
  try { path = new URL(raw, TOKYOINSIDER_BASE_URL).pathname; } catch (error) {}
  const match = /^\/anime\/[^/]+\/[^/?#]+/i.exec(path);
  return match ? match[0] : "";
}

function tokyoInsiderTitleFromPath(path) {
  const slug = String(path || "").split("/").filter(Boolean).pop() || "";
  return decodeURIComponent(slug).replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

async function getTokyoInsiderEpisodes(animeId) {
  const seriesPath = tokyoInsiderSeriesPath(`/${String(animeId || "").replace(/^\/+/, "")}`);
  if (!seriesPath) return [];
  const html = await fetchText(`${TOKYOINSIDER_BASE_URL}${seriesPath}`);
  const episodes = [];
  const seen = new Set();
  const linkRegex = /<a\b[^>]*href="([^"]*\/anime\/[^"]+\/(episode|movie|special)\/(\d+))"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html))) {
    const url = new URL(decodeXml(match[1]), TOKYOINSIDER_BASE_URL).toString();
    if (!url.includes(seriesPath) || seen.has(url)) continue;
    seen.add(url);
    const type = match[2].toLowerCase();
    const number = Number(match[3]);
    episodes.push({
      id: url,
      provider: "tokyoinsider",
      number,
      type,
      title: cleanHtml(match[4]) || `${type === "episode" ? "Episode" : type} ${number}`,
      date: "TokyoInsider MP4",
      url,
      description: "TokyoInsider MP4 download source. MKV files are ignored because browsers usually cannot play them natively.",
    });
  }
  const episodeOnly = episodes.filter((episode) => episode.type === "episode");
  return (episodeOnly.length ? episodeOnly : episodes).sort((a, b) => a.number - b.number);
}

async function getTokyoInsiderStreams(episodeUrl, subtitleContext = {}) {
  if (!episodeUrl) return { provider: "tokyoinsider", sources: [], tracks: [] };
  const html = await fetchText(episodeUrl, { headers: { Referer: TOKYOINSIDER_BASE_URL } });
  const tracks = await mergeExternalSubtitleTracks([], subtitleContext);
  const seen = new Set();
  const sources = [];
  const linkRegex = /href="(https:\/\/media\.tokyoinsider\.com:8080\/dl\/[^"]+\.mp4(?:\?[^"]*)?)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html))) {
    const mediaUrl = decodeXml(match[1]);
    if (seen.has(mediaUrl)) continue;
    seen.add(mediaUrl);
    const fileName = cleanHtml(match[2]) || decodeURIComponent(new URL(mediaUrl).pathname.split("/").pop() || "TokyoInsider MP4");
    const quality = firstMatch(fileName, /\b(2160p|1440p|1080p|720p|480p|360p)\b/i) || "MP4";
    sources.push({
      name: fileName,
      quality,
      type: "video/mp4",
      url: proxyTokyoInsiderUrl(mediaUrl),
      isHLS: false,
      tracks,
    });
  }
  sources.sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality));
  return { provider: "tokyoinsider", sources, tracks };
}

async function proxyTokyoInsiderMedia(req, res) {
  const target = validateHttpUrl(req.query.url);
  if (!target || !isAllowedTokyoInsiderMediaUrl(target)) {
    res.status(400).json({ error: "valid TokyoInsider MP4 url is required" });
    return;
  }
  const response = await fetchWithTimeout(target, { headers: tokyoInsiderMediaHeaders(req) });
  if (!response.ok) {
    res.status(response.status).send(await response.text().catch(() => response.statusText));
    return;
  }
  res.status(response.status);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "video/mp4");
  ["content-length", "content-range", "accept-ranges", "cache-control", "last-modified"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) res.setHeader(header, value);
  });
  if (!response.body) {
    res.end();
    return;
  }
  Readable.fromWeb(response.body).pipe(res);
}

function tokyoInsiderMediaHeaders(req) {
  return {
    Accept: "video/mp4,application/octet-stream,*/*",
    Referer: `${TOKYOINSIDER_BASE_URL}/`,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
    ...(req.headers.range ? { Range: req.headers.range } : {}),
  };
}

function proxyTokyoInsiderUrl(url) {
  return `/api/anime/tokyoinsider/proxy?url=${encodeURIComponent(url)}`;
}

function isAllowedTokyoInsiderMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "media.tokyoinsider.com" && parsed.port === "8080" && parsed.pathname.toLowerCase().endsWith(".mp4");
  } catch (error) {
    return false;
  }
}

function qualityRank(value) {
  const number = Number(firstMatch(value, /(\d+)/));
  return Number.isFinite(number) ? number : 0;
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

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : {};

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
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
  return [403, 429, 500, 502, 503, 504].includes(Number(error?.status));
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
  return String(value || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#34;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
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

function validateTokyoInsiderPageUrl(value) {
  try {
    const url = new URL(firstQueryValue(value), TOKYOINSIDER_BASE_URL);
    return url.protocol === "https:" && url.hostname === "www.tokyoinsider.com" && url.pathname.startsWith("/anime/") ? url.toString() : "";
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

function subtitleContextFromRequest(req) {
  return {
    anilistId: cleanQuery(req.query.anilistId || req.query.aniListId),
    title: cleanQuery(req.query.title),
    episode: cleanQuery(req.query.episode || req.query.episodeNumber),
  };
}

async function mergeExternalSubtitleTracks(tracks, context = {}) {
  const baseTracks = normalizeTrackList(tracks);
  const externalTracks = await getJimakuSubtitleTracks(context).catch(() => []);
  if (!externalTracks.length) return baseTracks;

  const seen = new Set(baseTracks.map((track) => String(track.url || "")));
  return [...baseTracks, ...externalTracks.filter((track) => {
    const key = String(track.url || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })];
}

async function getJimakuSubtitleTracks({ anilistId, title, episode } = {}) {
  const entry = await findJimakuEntry({ anilistId, title });
  if (!entry?.id) return [];

  const html = await fetchText(`${JIMAKU_BASE_URL}/entry/${entry.id}`);
  const episodeNumber = Number.parseFloat(episode);
  const files = [];
  const linkRegex = /<a\b[^>]*href="(\/entry\/\d+\/download\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html))) {
    const name = cleanHtml(match[2]);
    if (!/\.(?:ass|ssa|srt|vtt)$/i.test(name)) continue;
    const score = jimakuEpisodeScore(name, episodeNumber);
    if (Number.isFinite(episodeNumber) && score <= 0) continue;
    files.push({ name, score, url: absolutizeUrl(match[1], JIMAKU_BASE_URL) });
  }

  return files
    .sort((a, b) => b.score - a.score || jimakuSubtitleRank(a.name) - jimakuSubtitleRank(b.name))
    .slice(0, 6)
    .map((file) => {
      const language = jimakuSubtitleLanguage(file.name);
      return {
        kind: "subtitles",
        label: `Jimaku ${language.label}`,
        srclang: language.code,
        url: proxyJimakuUrl(file.url),
      };
    });
}

async function findJimakuEntry({ anilistId, title } = {}) {
  const id = Number.parseInt(anilistId, 10);
  const queryTitle = cleanHtml(title);
  if (!id && !queryTitle) return null;

  const html = await fetchText(`${JIMAKU_BASE_URL}/`);
  const entryRegex = /<div\s+class="entry"\s+data-extra="([^"]+)"[\s\S]*?<a\s+href="\/entry\/(\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  let best = null;
  while ((match = entryRegex.exec(html))) {
    const metadata = parseJimakuEntryMetadata(match[1]);
    const entryId = match[2];
    const entryTitle = cleanHtml(metadata.name || match[3]);
    if (id && Number(metadata.anilist_id) === id) return { id: entryId, title: entryTitle };
    if (!id && queryTitle) {
      const score = Math.max(
        titleScore(queryTitle, entryTitle),
        titleScore(queryTitle, metadata.english_name || ""),
        titleScore(queryTitle, metadata.japanese_name || ""),
      );
      if (score > (best?.score || 0)) best = { id: entryId, title: entryTitle, score };
    }
  }

  return best?.score >= 0.86 ? best : null;
}

function parseJimakuEntryMetadata(value) {
  try {
    return JSON.parse(decodeXml(value));
  } catch (error) {
    return {};
  }
}

function jimakuEpisodeScore(name, episodeNumber) {
  if (!Number.isFinite(episodeNumber)) return 1;
  const number = Math.trunc(episodeNumber);
  const padded = String(number).padStart(2, "0");
  const text = String(name || "");
  if (new RegExp(`s\\d{1,2}e0*${number}(?!\\d)`, "i").test(text)) return 5;
  if (new RegExp(`(?:^|[^a-z0-9])e(?:p(?:isode)?)?\\s*0*${number}(?!\\d)`, "i").test(text)) return 4;
  if (new RegExp(`(?:^|[^\\d])${padded}(?:[^\\d]|$)`).test(text)) return 2;
  if (new RegExp(`(?:^|[^\\d])${number}(?:[^\\d]|$)`).test(text)) return 1;
  return 0;
}

function jimakuSubtitleRank(name) {
  const text = String(name || "").toLowerCase();
  if (text.endsWith(".ass") || text.endsWith(".ssa")) return 0;
  if (text.endsWith(".srt")) return 1;
  return 2;
}

function jimakuSubtitleLanguage(name) {
  const text = String(name || "").toLowerCase();
  if (/(?:^|[.\[\]() _-])(en|eng)(?:[.\[\]() _-]|$)/.test(text)) return { code: "en", label: "English" };
  return { code: "ja", label: "Japanese" };
}

async function proxyJimakuSubtitle(req, res) {
  const target = validateHttpUrl(req.query.url);
  if (!target || !isAllowedJimakuUrl(target)) {
    res.status(400).json({ error: "valid Jimaku subtitle url is required" });
    return;
  }

  const response = await fetchWithTimeout(target, { headers: { Accept: "text/plain,*/*", Referer: `${JIMAKU_BASE_URL}/` } });
  if (!response.ok) {
    res.status(response.status).send(await response.text().catch(() => response.statusText));
    return;
  }

  res.status(response.status);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", contentTypeForUrl(target));
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(await response.text());
}

function proxyJimakuUrl(url) {
  return `/api/anime/jimaku/proxy?url=${encodeURIComponent(url)}`;
}

function isAllowedJimakuUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "jimaku.cc" && /^\/entry\/\d+\/download\//.test(parsed.pathname);
  } catch (error) {
    return false;
  }
}

function contentTypeForUrl(url) {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".mp4")) return "video/mp4";
  if (path.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  if (path.endsWith(".ts")) return "video/mp2t";
  if (path.endsWith(".m4s")) return "video/iso.segment";
  if (path.endsWith(".key")) return "application/octet-stream";
  if (path.endsWith(".vtt")) return "text/vtt";
  if (path.endsWith(".srt")) return "application/x-subrip; charset=utf-8";
  if (path.endsWith(".ass") || path.endsWith(".ssa")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

function yearFromDate(value) {
  const year = new Date(value || "").getUTCFullYear();
  return Number.isFinite(year) ? year : null;
}

function parseDurationMinutes(value) {
  const match = /([0-9]+)\s*min/i.exec(String(value || ""));
  return match ? Number(match[1]) : 0;
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
