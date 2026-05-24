const REQUEST_TIMEOUT_MS = 15000;

const SOURCES = {
  pornhwaz: { baseUrl: "https://www.pornhwaz.com", name: "PornhwaZ" },
  hentai20: { baseUrl: "https://hentai20.io", name: "Hentai20" },
  pornhwapro: { baseUrl: "https://pornhwa.pro", name: "Pornhwa Pro" },
  hentai18: { baseUrl: "https://hentai18.net", name: "Hentai18" },
  hentainame: { baseUrl: "https://www.hentai.name", name: "Hentai.name" },
  hentaizap: { baseUrl: "https://hentaizap.com", name: "HentaiZap" },
  hentaifox: { baseUrl: "https://hentaifox.com", name: "HentaiFox" },
  "3hentai": { baseUrl: "https://3hentai.net", name: "3Hentai" },
  hentaiera: { baseUrl: "https://hentaiera.com", name: "HentaiEra" },
  hentaicity: { baseUrl: "https://www.hentaicity.com", name: "HentaiCity" },
};

async function searchAdultMangaSource(provider, title, options = {}) {
  const query = String(title || "").trim();
  if (!query) return [];
  if (provider === "pornhwaz") return searchPornhwaZ(query);
  if (provider === "hentai20") return searchHentai20(query);
  if (provider === "pornhwapro") return searchPornhwaPro(query);
  if (provider === "hentai18") return searchHentai18(query);
  if (provider === "hentainame") return searchHentaiName(query);
  if (provider === "hentaizap") return searchHentaiZap(query, options.page);
  if (provider === "hentaifox") return searchHentaiFox(query, options.page);
  if (provider === "3hentai") return search3Hentai(query, options.page);
  if (provider === "hentaiera") return searchHentaiEra(query, options.page);
  if (provider === "hentaicity") return searchHentaiCity(query);
  return [];
}

async function latestAdultMangaSource(provider, options = {}) {
  if (options.tag) return latestAdultMangaTag(provider, options);
  if (provider === "hentaizap") return latestHentaiZap(options.page);
  if (provider === "hentaifox") return latestHentaiFox(options.page);
  if (provider === "3hentai") return latest3Hentai(options.page);
  if (provider === "hentaiera") return latestHentaiEra(options.page);
  if (provider === "hentaicity") return latestHentaiCity();
  return [];
}

async function latestAdultMangaTag(provider, options = {}) {
  const tag = String(options.tag || "").trim();
  if (!tag) return [];
  if (provider === "3hentai") return search3Hentai(threeHentaiTagQuery(options.category, tag), options.page);
  const source = SOURCES[provider];
  const path = adultGalleryTagPath(options.category, tag, options.page);
  if (!source || !path || !["hentainame", "hentaizap", "hentaifox", "hentaiera"].includes(provider)) return [];
  const html = await fetchText(`${source.baseUrl}${path}`, source.baseUrl, provider === "hentainame" ? simpleUserAgentOptions() : {});
  return parseAdultGallerySearch({ html, query: tag, provider, baseUrl: source.baseUrl, pathPattern: galleryPathPattern(provider) });
}

async function getAdultMangaChapters(provider, id) {
  if (provider === "pornhwaz") return getPornhwaZChapters(id);
  if (provider === "hentai20") return getHentai20Chapters(id);
  if (provider === "pornhwapro") return getPornhwaProChapters(id);
  if (provider === "hentai18") return getHentai18Chapters(id);
  if (provider === "3hentai") return get3HentaiChapters(id);
  if (provider === "hentainame" || provider === "hentaizap" || provider === "hentaifox" || provider === "hentaiera" || provider === "hentaicity") return getGalleryChapters(provider, id);
  return [];
}

async function getAdultMangaPages(provider, id) {
  if (provider === "pornhwaz") return getPagesFromChapter(id, SOURCES.pornhwaz.baseUrl, /https:\/\/cdn\.pornhwaz\.com\/[^"'<>\s]+?\.(?:webp|jpg|jpeg|png)(?:\?[^"'<>\s]*)?/gi);
  if (provider === "hentai20") return getPagesFromChapter(id, SOURCES.hentai20.baseUrl, /https:\/\/img\.hentai1\.io\/[^"'<>\s]+?\.(?:webp|jpg|jpeg|png)(?:\?[^"'<>\s]*)?/gi);
  if (provider === "pornhwapro") return getPagesFromChapter(id, SOURCES.pornhwapro.baseUrl, /https:\/\/[^"'<>\s]*manhwature\.com\/[^"'<>\s]+?\.(?:webp|jpg|jpeg|png)(?:\?[^"'<>\s]*)?/gi);
  if (provider === "hentai18") return getPagesFromChapter(id, SOURCES.hentai18.baseUrl, /https:\/\/cdn\.hentai18\.net\/images\/manga\/[^"'<>\s]+?\.(?:webp|jpg|jpeg|png)(?:\?[^"'<>\s]*)?/gi);
  if (provider === "3hentai") return get3HentaiPages(id);
  if (provider === "hentainame" || provider === "hentaizap" || provider === "hentaifox" || provider === "hentaiera" || provider === "hentaicity") return getGalleryPages(provider, id);
  return [];
}

async function searchPornhwaZ(query) {
  const { baseUrl } = SOURCES.pornhwaz;
  const direct = await directAdultSeriesMatch({ provider: "pornhwaz", query, baseUrl, path: `/webtoon/${slugifyTitle(query)}/` });
  const html = await fetchText(`${baseUrl}/?s=${encodeURIComponent(query).replace(/%20/g, "+")}&post_type=wp-manga`, baseUrl);
  const results = uniqueSeriesMatches({
    html,
    query,
    provider: "pornhwaz",
    baseUrl,
    pattern: /<a\b[^>]*href="(https:\/\/www\.pornhwaz\.com\/webtoon\/[^"#?]+\/?)[^>]*"[^>]*(?:title="([^"]+)")?[^>]*>([\s\S]*?)<\/a>/gi,
    pathPattern: /^\/webtoon\/[^/?#]+\/?$/i,
  });
  return mergeSourceResults(direct ? [direct] : [], results);
}

async function searchHentai20(query) {
  const { baseUrl } = SOURCES.hentai20;
  const direct = await directAdultSeriesMatch({ provider: "hentai20", query, baseUrl, path: `/manga/${slugifyTitle(query)}/` });
  const html = await fetchText(`${baseUrl}/?s=${encodeURIComponent(query).replace(/%20/g, "+")}&post_type=wp-manga`, baseUrl);
  const results = [];
  const seen = new Set();
  const blockRegex = /<div class="bsx">([\s\S]*?)(?=<div class="bsx">|<\/main>|<\/body>)/gi;
  let match;
  while ((match = blockRegex.exec(html))) {
    const block = match[1];
    const href = firstMatch(block, /<a\b[^>]*href="(https:\/\/hentai20\.io\/manga\/[^"#?]+\/?)[^>]*"/i);
    const path = normalizePath(href, baseUrl, /^\/manga\/[^/?#]+\/?$/i);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const title = cleanHtml(firstMatch(block, /title="([^"]+)"/i) || firstMatch(block, /<div class="tt">([\s\S]*?)<\/div>/i));
    const score = titleScore(query, title);
    if (!title || score < 0.15) continue;
    const cover = firstMatch(block, /<img\b[^>]*src="([^"]+)"/i);
    results.push(sourceResult({ provider: "hentai20", path, title, cover: absolutizeUrl(cover, baseUrl), score }));
  }
  return mergeSourceResults(direct ? [direct] : [], results);
}

async function searchPornhwaPro(query) {
  const { baseUrl } = SOURCES.pornhwapro;
  const direct = await directAdultSeriesMatch({ provider: "pornhwapro", query, baseUrl, paths: slugifyTitleVariants(query).map((slug) => `/manhwa/${slug}/`) });
  let html = await fetchText(`${baseUrl}/search/${encodeURIComponent(query).replace(/%20/g, "-")}/`, baseUrl);
  let results = parsePornhwaProSearch(html, query, baseUrl);
  if (!results.length && query.includes(" ")) {
    html = await fetchText(`${baseUrl}/search/${encodeURIComponent(query.split(/\s+/)[0])}/`, baseUrl);
    results = parsePornhwaProSearch(html, query, baseUrl);
  }
  return mergeSourceResults(direct ? [direct] : [], results);
}

function parsePornhwaProSearch(html, query, baseUrl) {
  const results = [];
  const seen = new Set();
  const linkRegex = /<div class="overflow-hidden rounded-lg[\s\S]*?(?=<div class="overflow-hidden rounded-lg|<\/main>|<\/body>)/gi;
  let match;
  while ((match = linkRegex.exec(html))) {
    const block = match[0];
    const path = normalizePath(firstMatch(block, /<a\b[^>]*href="(\/manhwa\/[^"#?]+\/)"/i), baseUrl, /^\/manhwa\/[^/?#]+\/?$/i);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const title = cleanHtml(firstMatch(block, /<img\b[^>]*alt="([^"]+)"/i) || firstMatch(block, /<!--t=[^>]*-->([\s\S]*?)<!---->/i));
    const score = titleScore(query, title);
    if (!title || score < 0.15) continue;
    const cover = firstMatch(block, /(?:data-src|src)="(https?:[^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"/i);
    results.push(sourceResult({ provider: "pornhwapro", path, title, cover: absolutizeUrl(cover, baseUrl), score }));
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 42);
}

async function searchHentai18(query) {
  const { baseUrl } = SOURCES.hentai18;
  const direct = await directAdultSeriesMatch({ provider: "hentai18", query, baseUrl, path: `/read-hentai/${slugifyTitle(query)}` });
  const html = await fetchText(`${baseUrl}/search?s=${encodeURIComponent(query).replace(/%20/g, "+")}`, baseUrl);
  const results = [];
  const seen = new Set();
  const blockRegex = /<li>[\s\S]*?(?=<li>|<\/ul>)/gi;
  let blockMatch;
  while ((blockMatch = blockRegex.exec(html))) {
    const block = blockMatch[0];
    const href = firstMatch(block, /<h3 class="title">\s*<a\b[^>]*href="(https:\/\/hentai18\.net\/read-hentai\/[^"#?]+)"/i);
    const path = normalizePath(href, baseUrl, /^\/read-hentai\/[^/?#]+$/i);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const title = cleanHtml(firstMatch(block, /<h3 class="title">\s*<a\b[^>]*>[\s\S]*?([^<>]+)<\/a>/i));
    const cover = firstMatch(block, /data-original="([^"]+)"/i) || firstMatch(block, /<img\b[^>]*src="([^"]+)"/i);
    const score = titleScore(query, title);
    if (!title || score < 0.15) continue;
    results.push(sourceResult({ provider: "hentai18", path, title, cover: absolutizeUrl(cover, baseUrl), score }));
  }
  return mergeSourceResults(direct ? [direct] : [], results);
}

async function searchHentaiName(query) {
  const { baseUrl } = SOURCES.hentainame;
  const html = await fetchText(`${baseUrl}/search/${encodeURIComponent(slugifyTitle(query))}/`, baseUrl, simpleUserAgentOptions());
  return parseAdultGallerySearch({ html, query, provider: "hentainame", baseUrl, pathPattern: /^\/g\/\d+\/?$/i });
}

async function searchHentaiZap(query, page = 1) {
  const { baseUrl } = SOURCES.hentaizap;
  const html = await fetchText(`${baseUrl}/search/?key=${encodeURIComponent(query)}&page=${pageNumber(page)}`, baseUrl);
  return parseAdultGallerySearch({ html, query, provider: "hentaizap", baseUrl, pathPattern: /^\/gallery\/\d+\/?$/i });
}

async function searchHentaiFox(query, page = 1) {
  const { baseUrl } = SOURCES.hentaifox;
  const html = await fetchText(`${baseUrl}/search/?q=${encodeURIComponent(query)}&page=${pageNumber(page)}`, baseUrl);
  return parseAdultGallerySearch({ html, query, provider: "hentaifox", baseUrl, pathPattern: /^\/gallery\/\d+\/?$/i });
}

async function latestHentaiZap(page = 1) {
  const { baseUrl } = SOURCES.hentaizap;
  const html = await fetchText(`${baseUrl}/search/?lt=1&d=1&en=1&page=${pageNumber(page)}`, baseUrl);
  return parseAdultGallerySearch({ html, query: "", provider: "hentaizap", baseUrl, pathPattern: /^\/gallery\/\d+\/?$/i });
}

async function latestHentaiFox(page = 1) {
  const { baseUrl } = SOURCES.hentaifox;
  const html = await fetchText(pageNumber(page) > 1 ? `${baseUrl}/?page=${pageNumber(page)}` : baseUrl, baseUrl);
  return parseAdultGallerySearch({ html, query: "", provider: "hentaifox", baseUrl, pathPattern: /^\/gallery\/\d+\/?$/i });
}

async function search3Hentai(query, page = 1) {
  const { baseUrl } = SOURCES["3hentai"];
  const html = await fetchText(`${baseUrl}/search?q=${encodeURIComponent(`${query} language:english`)}&page=${pageNumber(page)}`, baseUrl);
  return parse3HentaiSearch(html, query, baseUrl);
}

async function latest3Hentai(page = 1) {
  const { baseUrl } = SOURCES["3hentai"];
  const html = await fetchText(`${baseUrl}/search?q=language%3Aenglish&page=${pageNumber(page)}`, baseUrl);
  return parse3HentaiSearch(html, "", baseUrl);
}

async function searchHentaiEra(query, page = 1) {
  const { baseUrl } = SOURCES.hentaiera;
  const html = await fetchText(`${baseUrl}/search/?key=${encodeURIComponent(query)}&mg=1&dj=1&ws=1&is=1&ac=1&gc=1&en=1&jp=0&es=0&fr=0&kr=0&de=0&ru=0&lt=1&page=${pageNumber(page)}`, baseUrl);
  return parseHentaiEraSearch(html, query, baseUrl);
}

async function latestHentaiEra(page = 1) {
  const { baseUrl } = SOURCES.hentaiera;
  const html = await fetchText(`${baseUrl}/search/?mg=1&dj=1&ws=1&is=1&ac=1&gc=1&en=1&jp=0&es=0&fr=0&kr=0&de=0&ru=0&lt=1&page=${pageNumber(page)}`, baseUrl);
  return parseHentaiEraSearch(html, "", baseUrl);
}

async function searchHentaiCity(query) {
  const { baseUrl } = SOURCES.hentaicity;
  const html = await fetchText(`${baseUrl}/customsearch.php?view=search&search_type=gallery&search=${encodeURIComponent(query)}&main_cat=0`, baseUrl);
  return parseHentaiCitySearch(html, query, baseUrl);
}

async function latestHentaiCity() {
  const { baseUrl } = SOURCES.hentaicity;
  const html = await fetchText(`${baseUrl}/galleries/`, baseUrl);
  return parseHentaiCitySearch(html, "", baseUrl);
}

async function directAdultSeriesMatch({ provider, query, baseUrl, path, paths }) {
  for (const candidatePath of uniqueStrings([path, ...(paths || [])])) {
    if (!candidatePath || /\/\//.test(candidatePath)) continue;
    let html = "";
    try {
      html = await fetchText(`${baseUrl}${candidatePath}`, baseUrl);
    } catch (error) {
      continue;
    }
    if (!html || /<h1>\s*404 Not Found\s*<\/h1>/i.test(html)) continue;
    const rawTitle = cleanHtml(firstMatch(html, /<meta\b[^>]*(?:property|name)="og:title"[^>]*content="([^"]+)"/i) || firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
    const title = titleScore(query, rawTitle) >= 0.6 ? rawTitle : query;
    const cover = firstMatch(html, /<meta\b[^>]*(?:property|name)="og:image"[^>]*content="([^"]+)"/i) || firstMatch(html, /(?:data-src|src)="([^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"/i);
    return sourceResult({ provider, path: candidatePath, title, cover: absolutizeUrl(cover, baseUrl), score: Math.max(0.95, titleScore(query, title)) });
  }
  return null;
}

function mergeSourceResults(preferred, results) {
  const byId = new Map();
  [...preferred, ...results].forEach((result) => {
    if (!result?.id) return;
    const current = byId.get(result.id);
    if (current && current.score >= result.score) return;
    byId.set(result.id, result);
  });
  return [...byId.values()].sort((a, b) => b.score - a.score).slice(0, 10);
}

async function getMadaraChapters({ provider, id, baseUrl, seriesPattern }) {
  const seriesPath = normalizePath(id, baseUrl, seriesPattern);
  if (!seriesPath) return [];
  const html = await fetchText(`${baseUrl}${seriesPath}`, baseUrl);
  return chapterLinksFromHtml({ html, provider, baseUrl, pattern: /href="(https?:\/\/[^"#?]+\/[^"#?]+\/chapter-[^"#?]+\/?|\/[^"#?]+\/chapter-[^"#?]+\/)"[^>]*>([\s\S]*?)<\/a>/gi });
}

async function getPornhwaZChapters(id) {
  const { baseUrl } = SOURCES.pornhwaz;
  const seriesPath = normalizePath(id, baseUrl, /^\/webtoon\/[^/?#]+\/?$/i);
  if (!seriesPath) return [];
  const html = await fetchText(`${baseUrl}${seriesPath}ajax/chapters/?t=1`, `${baseUrl}${seriesPath}`, { method: "POST", headers: { "X-Requested-With": "XMLHttpRequest" } });
  return chapterLinksFromHtml({ html, provider: "pornhwaz", baseUrl, pattern: /href="(https?:\/\/[^"#?]+\/[^"#?]+\/chapter-[^"#?]+\/?|\/[^"#?]+\/chapter-[^"#?]+\/)"[^>]*>([\s\S]*?)<\/a>/gi });
}

async function getHentai20Chapters(id) {
  const { baseUrl } = SOURCES.hentai20;
  const seriesPath = normalizePath(id, baseUrl, /^\/manga\/[^/?#]+\/?$/i);
  if (!seriesPath) return [];
  const html = await fetchText(`${baseUrl}${seriesPath}`, baseUrl);
  return chapterLinksFromHtml({ html, provider: "hentai20", baseUrl, pattern: /href="(https:\/\/hentai20\.io\/[^"#?{}]+chapter-[^"#?{}]+\/)"[^>]*>([\s\S]*?)<\/a>/gi });
}

async function getPornhwaProChapters(id) {
  const { baseUrl } = SOURCES.pornhwapro;
  const seriesPath = normalizePath(id, baseUrl, /^\/manhwa\/[^/?#]+\/?$/i);
  if (!seriesPath) return [];
  const html = await fetchText(`${baseUrl}${seriesPath}`, baseUrl);
  return chapterLinksFromHtml({ html, provider: "pornhwapro", baseUrl, pattern: /href="(\/manhwa\/[^"#?]+\/chapter-[^"#?]+\/)"[^>]*>([\s\S]*?)<\/a>/gi });
}

async function getHentai18Chapters(id) {
  const { baseUrl } = SOURCES.hentai18;
  const seriesPath = normalizePath(id, baseUrl, /^\/read-hentai\/[^/?#]+$/i);
  if (!seriesPath) return [];
  const html = await fetchText(`${baseUrl}${seriesPath}`, baseUrl);
  const fromLinks = chapterLinksFromHtml({ html, provider: "hentai18", baseUrl, pattern: /href="(\/read-hentai\/[^"#?]+chapter-[^"#?]+)"[^>]*title="([^"]+)"/gi });
  if (fromLinks.length) return fromLinks;
  const urls = uniqueMatches(html, /https:\/\/hentai18\.net\/read-hentai\/[^"'<>\s]+?chapter-[^"'<>\s]+/gi);
  return urls.map((url) => {
    const path = normalizePath(url, baseUrl, /^\/read-hentai\/[^/?#]+$/i);
    const number = firstMatch(path, /chapter-([\d.]+)/i) || String(urls.indexOf(url) + 1);
    return { id: `hentai18:${path}`, provider: "hentai18", number, title: `Chapter ${number}`, date: "Date TBA", description: `Chapter ${number}`, pages: 1 };
  }).filter((chapter) => chapter.id !== "hentai18:").sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
}

async function getGalleryChapters(provider, id) {
  const source = SOURCES[provider];
  const path = normalizePath(id, source.baseUrl, galleryPathPattern(provider));
  if (!path) return [];
  const html = await fetchText(`${source.baseUrl}${path}`, source.baseUrl, provider === "hentainame" ? simpleUserAgentOptions() : {});
  const title = cleanHtml(firstMatch(html, /<meta\b[^>]*(?:property|name)="og:title"[^>]*content="([^"]+)"/i) || firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)) || source.name;
  const pages = (await galleryPageImages(provider, html, source.baseUrl, path)).length || 1;
  const metadata = parseAdultGalleryMetadata(html, provider, source.baseUrl);
  return [{ id: `${provider}:${path}`, provider, number: "1", title, date: "Date TBA", description: title, pages, metadata }];
}

async function get3HentaiChapters(id) {
  const { path } = parse3HentaiId(id);
  if (!path) return [];
  try {
    const source = SOURCES["3hentai"];
    const html = await fetchText(`${source.baseUrl}${path}`, source.baseUrl);
    const title = cleanHtml(firstMatch(html, /<meta\b[^>]*(?:property|name)="og:title"[^>]*content="([^"]+)"/i) || firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)) || "Gallery";
    const metadata = parseAdultGalleryMetadata(html, "3hentai", source.baseUrl);
    return [{ id: `3hentai:${id}`, provider: "3hentai", number: "1", title, date: "Date TBA", description: title, pages: 1, metadata }];
  } catch (error) {
    return [{ id: `3hentai:${id}`, provider: "3hentai", number: "1", title: "Gallery", date: "Date TBA", description: "Gallery", pages: 1 }];
  }
}

async function getGalleryPages(provider, id) {
  const source = SOURCES[provider];
  const path = normalizePath(id, source.baseUrl, galleryPathPattern(provider));
  if (!path) return [];
  const html = await fetchText(`${source.baseUrl}${path}`, source.baseUrl, provider === "hentainame" ? simpleUserAgentOptions() : {});
  return galleryPageImages(provider, html, source.baseUrl, path);
}

async function get3HentaiPages(id) {
  const { path, imageBase } = parse3HentaiId(id);
  if (imageBase) return probeSequentialImages(imageBase, "jpg");
  const source = SOURCES["3hentai"];
  const html = await fetchText(`${source.baseUrl}${path}`, source.baseUrl);
  return galleryPageImages("3hentai", html, source.baseUrl, path);
}

async function getPagesFromChapter(id, baseUrl, imagePattern) {
  const chapterPath = normalizePath(id, baseUrl, /^\//i);
  if (!chapterPath) return [];
  const html = await fetchText(`${baseUrl}${chapterPath}`, baseUrl);
  return uniqueMatches(html, imagePattern).filter((url) => !/logo|favicon|avatar|banner|discord|cursor|thumbs|\/resize\//i.test(url));
}

function uniqueSeriesMatches({ html, query, provider, baseUrl, pattern, pathPattern }) {
  const results = [];
  const seen = new Set();
  let match;
  while ((match = pattern.exec(html))) {
    const path = normalizePath(match[1], baseUrl, pathPattern);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const nearby = html.slice(Math.max(0, match.index - 450), Math.min(html.length, match.index + 900));
    const title = cleanHtml(match[2] || firstMatch(nearby, /<h3[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/i) || match[3]);
    const score = titleScore(query, title);
    if (!title || score < 0.15) continue;
    const cover = firstMatch(nearby, /(?:data-src|src)="([^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"/i);
    results.push(sourceResult({ provider, path, title, cover: absolutizeUrl(cover, baseUrl), score }));
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 42);
}

function parseAdultGallerySearch({ html, query, provider, baseUrl, pathPattern }) {
  const results = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*href="([^"]*(?:\/g\/\d+\/|\/gallery\/\d+\/)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const path = normalizePath(match[1], baseUrl, pathPattern);
    if (!path) continue;
    const nearby = html.slice(Math.max(0, match.index - 800), Math.min(html.length, match.index + 1400));
    const title = cleanHtml(firstMatch(match[2], /alt="([^"]+)"/i) || match[2] || firstMatch(nearby, /<h2[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/i) || firstMatch(nearby, /<div class="caption">([\s\S]*?)<\/div>/i));
    if (!isEnglishGalleryBlock(provider, `${nearby} ${match[2]}`, title)) continue;
    const score = Math.max(0.2, titleScore(query, title));
    if (!title || seen.has(path)) continue;
    seen.add(path);
    const cover = firstMatch(nearby, /(?:data-src|src)="([^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"/i);
    const metadata = parseAdultGalleryMetadata(nearby, provider, baseUrl);
    results.push(sourceResult({ provider, path, title, cover: absolutizeUrl(cover, baseUrl), score, metadata }));
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 42);
}

function parse3HentaiSearch(html, query, baseUrl) {
  const results = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*href="([^"]*\/d\/\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const block = match[0];
    const path = normalizePath(match[1], baseUrl, /^\/d\/\d+$/i);
    const cover = firstMatch(block, /(?:data-src|src)="([^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"/i);
    const imageBase = firstMatch(cover, /(https:\/\/s\d+\.3hentai\.(?:net|xyz)\/d\d+)\//i);
    const idPath = imageBase ? `${path}|${imageBase}` : path;
    if (!path || seen.has(idPath)) continue;
    const title = cleanHtml(firstMatch(block, /<div\b[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/div>/i) || firstMatch(block, /alt="([^"]+)"/i));
    if (!title || !isEnglishGalleryBlock("3hentai", block, title)) continue;
    seen.add(idPath);
    const metadata = parseAdultGalleryMetadata(block, "3hentai", baseUrl);
    results.push(sourceResult({ provider: "3hentai", path: idPath, title, cover: absolutizeUrl(cover, baseUrl), score: Math.max(0.2, titleScore(query, title)), metadata }));
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 42);
}

function parse3HentaiId(id) {
  const [rawPath, rawImageBase] = String(id || "").split("|");
  const path = normalizePath(rawPath, SOURCES["3hentai"].baseUrl, /^\/d\/\d+$/i);
  const imageBase = /^https:\/\/s\d+\.3hentai\.(?:net|xyz)\/d\d+$/i.test(rawImageBase || "") ? rawImageBase : "";
  return { path, imageBase };
}

async function probeSequentialImages(imageBase, extension) {
  const pages = [];
  for (let start = 1; start <= 300; start += 20) {
    const batch = await Promise.all([...Array(20)].map((_, index) => imageExists(`${imageBase}/${start + index}.${extension}`)));
    for (let index = 0; index < batch.length; index += 1) {
      const url = `${imageBase}/${start + index}.${extension}`;
      if (!batch[index]) return pages;
      pages.push(url);
    }
  }
  return pages;
}

async function imageExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0 AniTrack/1.0" } });
    return response.ok && /^image\//i.test(response.headers.get("content-type") || "");
  } catch (error) {
    return false;
  }
}

function parseHentaiEraSearch(html, query, baseUrl) {
  const results = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*href="([^"]*\/gallery\/\d+\/)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const block = match[0];
    const path = normalizePath(match[1], baseUrl, /^\/gallery\/\d+\/?$/i);
    if (!path || seen.has(path)) continue;
    const title = cleanHtml(firstMatch(block, /alt="([^"]+)"/i) || match[2]);
    if (!title || !isEnglishGalleryBlock("hentaiera", block, title)) continue;
    seen.add(path);
    const cover = firstMatch(block, /(?:data-src|src)="([^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"/i);
    const metadata = parseAdultGalleryMetadata(block, "hentaiera", baseUrl);
    results.push(sourceResult({ provider: "hentaiera", path, title, cover: absolutizeUrl(cover, baseUrl), score: Math.max(0.2, titleScore(query, title)), metadata }));
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 42);
}

function parseHentaiCitySearch(html, query, baseUrl) {
  const results = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*href="([^"]*(?:\/click\/\d+-\d+)?\/gallery\/[^"?#]+\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const block = match[0];
    const path = normalizePath(match[1], baseUrl, /^\/(?:click\/\d+-\d+\/)?gallery\/[^/?#]+\.html$/i);
    if (!path || seen.has(path)) continue;
    const title = cleanHtml(firstMatch(block, /alt="([^"]+)"/i) || firstMatch(block, /title="([^"]+)"/i) || match[2]);
    if (!title) continue;
    seen.add(path);
    const cover = firstMatch(block, /(?:data-src|src)="([^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"/i);
    const metadata = parseAdultGalleryMetadata(block, "hentaicity", baseUrl);
    results.push(sourceResult({ provider: "hentaicity", path, title, cover: absolutizeUrl(cover, baseUrl), score: Math.max(0.2, titleScore(query, title)), metadata }));
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 42);
}

function galleryPathPattern(provider) {
  if (provider === "3hentai") return /^\/d\/\d+$/i;
  if (provider === "hentaicity") return /^\/(?:click\/\d+-\d+\/)?gallery\/[^/?#]+\.html$/i;
  return provider === "hentainame" ? /^\/g\/\d+\/?$/i : /^\/gallery\/\d+\/?$/i;
}

async function galleryPageImages(provider, html, baseUrl = "", path = "") {
  if (provider === "hentainame") {
    return sortPageImages(uniqueMatches(html, /https:\/\/pics\.hentai\.name\/[^"'<>\s]+?\/\d+_thumb\.webp/gi).map((url) => url.replace(/_thumb\.webp(?:\?[^?]*)?$/i, ".webp")));
  }
  if (provider === "hentaizap") {
    const candidates = uniqueMatches(html, /https:\/\/m\d+\.hentaizap\.com\/[^"'<>\s]+?\/\d+t\.jpg/gi);
    const pages = await Promise.all(candidates.map((url) => hentaizapFullImage(url)));
    return sortPageImages(pages.filter(Boolean));
  }
  if (provider === "hentaifox") {
    const galleryId = firstMatch(path, /\/gallery\/(\d+)\/?/i);
    const pageCount = Number(firstMatch(html, /id="load_pages"\s+value="(\d+)"/i) || firstMatch(html, /Pages:\s*(\d+)/i));
    if (galleryId && pageCount > 10) {
      const imageBase = galleryThumbnailBase(html, /https:\/\/i\d*\.hentaifox\.com\/[^"'<>\s]+?\/\d+t\.jpg/gi);
      if (imageBase) return generatedNumberedImages(imageBase, pageCount, "webp");
      return hentaifoxReaderImages(baseUrl, galleryId, Math.min(pageCount, 12));
    }
    const extension = await hentaifoxImageExtension(baseUrl, path);
    return sortPageImages(uniqueMatches(html, /https:\/\/i\d*\.hentaifox\.com\/[^"'<>\s]+?\/\d+t\.jpg/gi).map((url) => url.replace(/(\d+)t\.jpg(?:\?[^?]*)?$/i, `$1.${extension}`)));
  }
  if (provider === "3hentai") {
    return sortPageImages(uniqueMatches(html, /https:\/\/s\d+\.3hentai\.(?:net|xyz)\/d\d+\/\d+t\.jpg/gi).map((url) => url.replace(/(\d+)t\.jpg(?:\?[^?]*)?$/i, "$1.jpg")));
  }
  if (provider === "hentaiera") {
    const galleryId = firstMatch(path, /\/gallery\/(\d+)\/?/i);
    const pageCount = Number(firstMatch(html, /id="load_pages"\s+value="(\d+)"/i) || firstMatch(html, /Pages:\s*(\d+)/i));
    if (galleryId && pageCount > 12) {
      const imageBase = galleryThumbnailBase(html, /https:\/\/m\d+\.hentaiera\.com\/[^"'<>\s]+?\/\d+t\.jpg/gi);
      if (imageBase) return generatedNumberedImages(imageBase, pageCount, "webp");
      return hentaieraReaderImages(baseUrl, galleryId, Math.min(pageCount, 12));
    }
    return sortPageImages(uniqueMatches(html, /https:\/\/m\d+\.hentaiera\.com\/[^"'<>\s]+?\/\d+t\.jpg/gi).map((url) => url.replace(/(\d+)t\.jpg(?:\?[^?]*)?$/i, "$1.webp")));
  }
  if (provider === "hentaicity") {
    return uniqueStrings(uniqueMatches(html, /https:\/\/cdn\d+\.images\.hentaicity\.com\/galleries\/[^"'<>\s]+?-t\.jpg/gi).map((url) => url.replace(/-t\.jpg(?:\?[^?]*)?$/i, ".jpg")));
  }
  return [];
}

async function hentaizapFullImage(thumbUrl) {
  const base = thumbUrl.replace(/(\d+)t\.jpg(?:\?[^?]*)?$/i, "$1");
  for (const extension of ["webp", "jpg", "png"]) {
    const url = `${base}.${extension}`;
    if (await imageExists(url)) return url;
  }
  return "";
}

function galleryThumbnailBase(html, pattern) {
  const thumb = uniqueMatches(html, pattern)[0] || "";
  return thumb.replace(/\/\d+t\.jpg(?:\?[^?]*)?$/i, "");
}

async function numberedCdnImages(imageBase, pageCount, extensions) {
  if (!imageBase) return [];
  const pages = [];
  const total = Math.min(300, Math.max(1, Number(pageCount || 0)));
  for (let start = 1; start <= total; start += 24) {
    const batch = await Promise.all([...Array(Math.min(24, total - start + 1))].map((_, index) => numberedCdnImage(imageBase, start + index, extensions)));
    pages.push(...batch.filter(Boolean));
  }
  return sortPageImages(pages);
}

async function numberedCdnImage(imageBase, pageNumber, extensions) {
  for (const extension of extensions) {
    const url = `${imageBase}/${pageNumber}.${extension}`;
    if (await imageExists(url)) return url;
  }
  return "";
}

function generatedNumberedImages(imageBase, pageCount, extension = "webp") {
  const total = Math.min(300, Math.max(1, Number(pageCount || 0)));
  const ext = /^(?:webp|jpg|jpeg|png)$/i.test(extension || "") ? extension : "webp";
  return Array.from({ length: total }, (_, index) => `${imageBase}/${index + 1}.${ext}`);
}

async function hentaifoxImageExtension(baseUrl, galleryPath) {
  const galleryId = firstMatch(galleryPath, /\/gallery\/(\d+)\/?/i);
  if (!baseUrl || !galleryId) return "jpg";
  try {
    const html = await fetchText(`${baseUrl}/g/${galleryId}/1/`, baseUrl);
    return firstMatch(html, /https:\/\/i\d*\.hentaifox\.com\/[^"'<>\s]+?\/1\.(webp|jpg|jpeg|png)/i) || "jpg";
  } catch (error) {
    return "jpg";
  }
}

async function hentaieraImageExtension(baseUrl, galleryId) {
  if (!baseUrl || !galleryId) return "webp";
  try {
    const html = await fetchText(`${baseUrl}/view/${galleryId}/1/`, baseUrl);
    return firstMatch(html, /https:\/\/m\d+\.hentaiera\.com\/[^"'<>\s]+?\/1\.(webp|jpg|jpeg|png)/i) || "webp";
  } catch (error) {
    return "webp";
  }
}

async function hentaifoxReaderImages(baseUrl, galleryId, pageCount) {
  const pages = [];
  const total = Math.min(300, Math.max(1, Number(pageCount || 0)));
  for (let start = 1; start <= total; start += 12) {
    const batch = await Promise.all([...Array(Math.min(12, total - start + 1))].map((_, index) => hentaifoxReaderImage(baseUrl, galleryId, start + index)));
    pages.push(...batch.filter(Boolean));
  }
  return sortPageImages(pages);
}

async function hentaifoxReaderImage(baseUrl, galleryId, pageNumber) {
  try {
    const html = await fetchText(`${baseUrl}/g/${galleryId}/${pageNumber}/`, baseUrl);
    return html.match(new RegExp(`https://i\\d*\\.hentaifox\\.com/[^"'<>\\s]+?/${pageNumber}\\.(?:webp|jpg|jpeg|png)`, "i"))?.[0] || "";
  } catch (error) {
    return "";
  }
}

async function hentaieraReaderImages(baseUrl, galleryId, pageCount) {
  const pages = [];
  const total = Math.min(300, Math.max(1, Number(pageCount || 0)));
  for (let start = 1; start <= total; start += 12) {
    const batch = await Promise.all([...Array(Math.min(12, total - start + 1))].map((_, index) => hentaieraReaderImage(baseUrl, galleryId, start + index)));
    pages.push(...batch.filter(Boolean));
  }
  return sortPageImages(pages);
}

async function hentaieraReaderImage(baseUrl, galleryId, pageNumber) {
  try {
    const html = await fetchText(`${baseUrl}/view/${galleryId}/${pageNumber}/`, baseUrl);
    return html.match(new RegExp(`https://m\\d+\\.hentaiera\\.com/[^"'<>\\s]+?/${pageNumber}\\.(?:webp|jpg|jpeg|png)`, "i"))?.[0] || "";
  } catch (error) {
    return "";
  }
}

function sortPageImages(urls) {
  return uniqueStrings(urls).sort((a, b) => pageNumberFromUrl(a) - pageNumberFromUrl(b));
}

function pageNumberFromUrl(url) {
  return Number(firstMatch(url, /\/(\d+)(?:_thumb|t)?\.(?:webp|jpg|jpeg|png)/i)) || 0;
}

function isEnglishGalleryBlock(provider, html, title) {
  const text = `${html || ""} ${title || ""}`;
  if (provider === "hentainame") return /\[\s*english\s*\]/i.test(title || "");
  if (provider === "hentaizap") return /\/language\/english\/|fl_en|flag-gb|fl_gb|\[\s*english\s*\]|data-languages="[^"]*\b3\b/i.test(text);
  if (provider === "hentaifox") return /\/language\/english\/|flag-gb|fl_gb|\[\s*english\s*\]|data-languages="[^"]*\b2\b/i.test(text);
  if (provider === "3hentai") return /flag-eng|\[\s*english\s*\]|language:\s*english/i.test(text);
  if (provider === "hentaiera") return /\[\s*english\s*\]|flag-us|\ben\b/i.test(text);
  return true;
}

function simpleUserAgentOptions() {
  return { headers: { "User-Agent": "Mozilla/5.0 AniTrack/1.0" } };
}

function chapterLinksFromHtml({ html, provider, baseUrl, pattern }) {
  const chapters = [];
  const seen = new Set();
  let match;
  while ((match = pattern.exec(html))) {
    const href = decodeXml(match[1]);
    if (href.includes("{{")) continue;
    const path = normalizePath(href, baseUrl, /^\//i);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const block = html.slice(Math.max(0, match.index - 300), Math.min(html.length, match.index + 700));
    const title = cleanHtml(match[2] || firstMatch(block, /title="([^"]+)"/i));
    const number = firstMatch(`${title} ${path}`, /chapter[-\s]*([\d.]+)/i) || firstMatch(`${title} ${path}`, /ch\.\s*([\d.]+)/i) || String(chapters.length + 1);
    const date = cleanHtml(firstMatch(block, /<span[^>]*class="[^"]*(?:date|post-on|time)[^"]*"[^>]*>([\s\S]*?)<\/span>/i)) || "Date TBA";
    chapters.push({ id: `${provider}:${path}`, provider, number, title: title || `Chapter ${number}`, date, description: title || `Chapter ${number}`, pages: 1 });
  }
  return chapters.filter((chapter) => chapter.number !== "0").sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
}

function sourceResult({ provider, path, title, cover, score, metadata }) {
  const normalizedMetadata = normalizeAdultMetadata(metadata);
  return {
    id: `${provider}:${path}`,
    provider,
    title,
    description: "Adult manga/manhwa source.",
    status: "unknown",
    year: "",
    cover,
    chapterCount: 0,
    score,
    metadata: normalizedMetadata,
    tags: adultMetadataValues(normalizedMetadata),
  };
}

function parseAdultGalleryMetadata(html, provider, baseUrl) {
  const metadata = emptyAdultMetadata();
  const sourceHtml = firstMatch(html, /<div\b[^>]*class=["'][^"']*gallery_right[^"']*["'][^>]*>([\s\S]*?)(?:<input\b[^>]*name=["']gallery_id["']|<div\b[^>]*class=["'][^"']*gallery_bottom|<div\b[^>]*class=["'][^"']*gallery_comments|<\/body>)/i) || String(html || "");
  const pattern = /<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(sourceHtml))) {
    const href = decodeXml(match[2]);
    const category = adultMetadataCategoryFromHref(href, baseUrl);
    if (!category) continue;
    const value = cleanAdultMetadataValue(match[3]) || labelFromAdultMetadataHref(href, baseUrl);
    if (!value || value.length > 60 || /^\d+$/.test(value) || isIgnoredAdultMetadataValue(value)) continue;
    metadata[category].push(value.replace(/^\s*(?:artist|group|parody|character|category|tag|language)s?:\s*/i, ""));
  }
  if (provider === "3hentai") {
    const text = cleanHtml(firstMatch(html, /language:\s*([^<\n]+)/i));
    if (/english/i.test(text)) metadata.languages.push("English");
  }
  return normalizeAdultMetadata(metadata);
}

function adultMetadataCategoryFromHref(href, baseUrl) {
  try {
    const segments = new URL(href, baseUrl).pathname.split("/").map((segment) => segment.trim().toLowerCase()).filter(Boolean);
    for (let index = 0; index < segments.length - 1; index += 1) {
      const key = adultMetadataCategoryKey(segments[index]);
      if (key) return key;
    }
  } catch (error) {
    return "";
  }
  return "";
}

function adultMetadataCategoryKey(value) {
  return ({
    artist: "artists",
    artists: "artists",
    group: "groups",
    groups: "groups",
    circle: "groups",
    circles: "groups",
    parody: "parodies",
    parodies: "parodies",
    series: "parodies",
    character: "characters",
    characters: "characters",
    category: "categories",
    categories: "categories",
    tag: "tags",
    tags: "tags",
    female: "tags",
    male: "tags",
    language: "languages",
    languages: "languages",
  }[String(value || "").toLowerCase()] || "");
}

function labelFromAdultMetadataHref(href, baseUrl) {
  try {
    const segments = new URL(href, baseUrl).pathname.split("/").filter(Boolean);
    return unslugifyAdultMetadata(segments[segments.length - 1] || "");
  } catch (error) {
    return "";
  }
}

function emptyAdultMetadata() {
  return { artists: [], groups: [], parodies: [], characters: [], categories: [], tags: [], languages: [] };
}

function normalizeAdultMetadata(metadata) {
  const source = metadata || {};
  return Object.fromEntries(Object.keys(emptyAdultMetadata()).map((key) => [key, uniqueStringsNormalized(source[key] || [])]));
}

function adultMetadataValues(metadata) {
  return Object.values(normalizeAdultMetadata(metadata)).flat();
}

function cleanAdultMetadataValue(value) {
  return cleanHtml(value).replace(/\s+\d{1,8}$/g, "").replace(/\s*\|\s*/g, " | ").trim();
}

function isIgnoredAdultMetadataValue(value) {
  return /^(?:all|any|popular|recent|latest|random|new|artists?|groups?|parod(?:y|ies)|characters?|categories|tags?|languages?)$/i.test(String(value || "").trim());
}

function adultGalleryTagPath(category, tag, page = 1) {
  const slug = slugifyTitle(tag);
  if (!slug) return "";
  const segment = ({ artists: "artist", artist: "artist", groups: "group", group: "group", parodies: "parody", parody: "parody", characters: "character", character: "character", categories: "category", category: "category", languages: "language", language: "language", tags: "tag", tag: "tag" }[String(category || "tag").toLowerCase()] || "tag");
  const suffix = pageNumber(page) > 1 ? `?page=${pageNumber(page)}` : "";
  return `/${segment}/${slug}/${suffix}`;
}

function threeHentaiTagQuery(category, tag) {
  const key = ({ artists: "artist", artist: "artist", groups: "group", group: "group", parodies: "parody", parody: "parody", characters: "character", character: "character", categories: "category", category: "category", languages: "language", language: "language", tags: "tag", tag: "tag" }[String(category || "tag").toLowerCase()] || "tag");
  return `${key}:${tag}`;
}

function unslugifyAdultMetadata(value) {
  return decodeURIComponent(String(value || "")).replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()).trim();
}

function uniqueStringsNormalized(values) {
  const seen = new Set();
  return (values || []).map((value) => String(value || "").trim()).filter((value) => {
    const key = normalizeTitle(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchText(url, referer, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: referer || "",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function normalizePath(value, baseUrl, pattern) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(decodeXml(raw), baseUrl);
    const path = url.pathname.replace(/\/+$/, "") + (url.pathname.endsWith("/") ? "/" : "");
    return pattern.test(path) ? path : "";
  } catch (error) {
    return "";
  }
}

function cleanHtml(value) {
  return decodeXml(String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

function firstMatch(value, pattern) {
  return String(value || "").match(pattern)?.[1] || "";
}

function absolutizeUrl(value, baseUrl) {
  const url = decodeXml(String(value || "")).trim();
  if (!url || url.startsWith("data:")) return "";
  try {
    return new URL(url, baseUrl).toString();
  } catch (error) {
    return url;
  }
}

function uniqueMatches(value, pattern) {
  const results = [];
  const seen = new Set();
  let match;
  while ((match = pattern.exec(String(value || "")))) {
    const url = decodeXml(match[0]);
    if (seen.has(url)) continue;
    seen.add(url);
    results.push(url);
  }
  return results;
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
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\b(the|a|an|manga|manhwa|manhua|hentai|pornhwa)\b/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyTitle(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function pageNumber(value) {
  const number = Number(value || 1);
  return Math.max(1, Number.isFinite(number) ? Math.floor(number) : 1);
}

function slugifyTitleVariants(value) {
  const text = String(value || "");
  return uniqueStrings([slugifyTitle(text), slugifyTitle(text.replace(/['’]/g, ""))]).filter(Boolean);
}

function uniqueStrings(values) {
  return [...new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean))];
}

module.exports = { searchAdultMangaSource, latestAdultMangaSource, getAdultMangaChapters, getAdultMangaPages };
