const MANHWAZ_BASE_URL = "https://manhwaz.com";
const REQUEST_TIMEOUT_MS = 15000;

async function searchManhwaZManga(title) {
  const query = String(title || "").trim();
  if (!query) return [];

  const html = await fetchText(`${MANHWAZ_BASE_URL}/search?s=${encodeURIComponent(query).replace(/%20/g, "+")}`);
  const results = [];
  const seen = new Set();
  const blockRegex = /<div class="col-6 col-md-3 col-lg-2[\s\S]*?(?=<div class="col-6 col-md-3 col-lg-2|<div class="pager-fe"|<\/main>)/gi;
  let blockMatch;

  while ((blockMatch = blockRegex.exec(html))) {
    const block = blockMatch[0];
    const href = firstMatch(block, /<a\b[^>]*href="(https:\/\/manhwaz\.com\/webtoon\/[^"#?]+)"[^>]*title="([^"]+)"/i);
    if (!href) continue;
    const path = new URL(decodeXml(href)).pathname;
    if (seen.has(path)) continue;
    seen.add(path);

    const name = cleanHtml(firstMatch(block, /<a\b[^>]*href="https:\/\/manhwaz\.com\/webtoon\/[^"#?]+"[^>]*title="([^"]+)"/i) || firstMatch(block, /<h3[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/i));
    const score = titleScore(query, name);
    if (!name || score < 0.15) continue;

    results.push({
      id: `manhwaz:${path}`,
      provider: "manhwaz",
      title: name,
      description: "",
      status: "unknown",
      year: "",
      cover: absolutizeUrl(firstMatch(block, /<img\b[^>]*src="([^"]+)"/i), MANHWAZ_BASE_URL),
      chapterCount: 0,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

async function getManhwaZChapters(path) {
  const seriesPath = normalizeSeriesPath(path);
  if (!seriesPath) return [];

  const html = await fetchText(`${MANHWAZ_BASE_URL}${seriesPath}`);
  const chapters = [];
  const seen = new Set();
  const linkRegex = new RegExp(`<li class="wp-manga-chapter">([\\s\\S]*?)<\\/li>`, "gi");
  let match;

  while ((match = linkRegex.exec(html))) {
    const block = match[1];
    const href = decodeXml(firstMatch(block, /<a\b[^>]*href="(https:\/\/manhwaz\.com\/webtoon\/[^"#?]+\/chapter-[^"#?]+)"/i));
    if (!href) continue;
    const chapterPath = new URL(href).pathname;
    if (seen.has(chapterPath)) continue;
    seen.add(chapterPath);

    const title = cleanHtml(firstMatch(block, /<a\b[^>]*>([\s\S]*?)<\/a>/i));
    const number = firstMatch(`${title} ${chapterPath}`, /chapter-([\d.]+)/i) || firstMatch(title, /Chapter\s*([\d.]+)/i) || String(chapters.length + 1);
    const date = cleanHtml(firstMatch(block, /<span class="chapter-release-date">[\s\S]*?<i>([\s\S]*?)<\/i>/i)) || "Date TBA";

    chapters.push({
      id: `manhwaz:${chapterPath}`,
      provider: "manhwaz",
      number,
      title: title || `Chapter ${number}`,
      date,
      description: title || `Chapter ${number}`,
      pages: 1,
    });
  }

  return chapters.sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
}

async function getManhwaZPages(chapterPath) {
  const path = normalizeChapterPath(chapterPath);
  if (!path) return [];

  const html = await fetchText(`${MANHWAZ_BASE_URL}${path}`);
  return uniqueMatches(html, /https:\/\/cdn\.manhwaz\.com\/manga\/[^"'<>\s]+?\.(?:webp|jpg|jpeg|png)(?:\?[^"'<>\s]*)?/gi);
}

function normalizeSeriesPath(value) {
  const raw = String(value || "").replace(/^manhwaz:/, "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, MANHWAZ_BASE_URL);
    return /^\/webtoon\/[^/?#]+$/i.test(url.pathname) ? url.pathname : "";
  } catch (error) {
    return "";
  }
}

function normalizeChapterPath(value) {
  const raw = String(value || "").replace(/^manhwaz:/, "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, MANHWAZ_BASE_URL);
    return /^\/webtoon\/[^/?#]+\/chapter-[^/?#]+$/i.test(url.pathname) ? url.pathname : "";
  } catch (error) {
    return "";
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: MANHWAZ_BASE_URL,
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
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
  if (!url) return "";
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
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\b(the|a|an|manga|manhwa|manhua)\b/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = { searchManhwaZManga, getManhwaZChapters, getManhwaZPages };
