const PROJECTSUKI_BASE_URL = "https://projectsuki.com";
const REQUEST_TIMEOUT_MS = 15000;

async function searchProjectSukiManga(title) {
  const query = String(title || "").trim();
  if (!query) return [];

  const html = await fetchText(`${PROJECTSUKI_BASE_URL}/search?q=${encodeURIComponent(query)}`);
  const results = [];
  const seen = new Set();
  const linkRegex = /<h4>\s*<a\b[^>]*href="\/book\/(\d+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h4>/gi;
  let match;

  while ((match = linkRegex.exec(html))) {
    const bookId = match[1];
    if (seen.has(bookId)) continue;
    seen.add(bookId);

    const nearby = html.slice(Math.max(0, match.index - 900), Math.min(html.length, match.index + 1800));
    const name = cleanHtml(match[2]);
    const score = titleScore(query, name);
    if (!name || score < 0.15) continue;

    results.push({
      id: `projectsuki:${bookId}`,
      provider: "projectsuki",
      title: name,
      description: cleanHtml(firstMatch(nearby, /Status:[\s\S]*?<\/div>\s*<div>\s*([\s\S]*?)(?:<a\b|<\/div>)/i)),
      status: cleanHtml(firstMatch(nearby, /Status:\s*([^<]+)/i)) || "unknown",
      year: "",
      cover: absolutizeUrl(firstMatch(nearby, /<img\b[^>]*src="([^"]*\/images\/gallery\/\d+\/thumb[^"]*)"/i), PROJECTSUKI_BASE_URL),
      chapterCount: 0,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

async function getProjectSukiChapters(bookId) {
  const id = String(bookId || "").replace(/^projectsuki:/, "").trim();
  if (!/^\d+$/.test(id)) return [];

  const html = await fetchText(`${PROJECTSUKI_BASE_URL}/book/${id}`);
  const chapters = [];
  const seen = new Set();
  const linkRegex = new RegExp(`<a\\b[^>]*href="(/read/${escapeRegex(id)}/(\\d+)/1)"[^>]*>([\\s\\S]*?)<\\/a>`, "gi");
  let match;

  while ((match = linkRegex.exec(html))) {
    const path = match[1];
    const chapterId = match[2];
    if (seen.has(chapterId)) continue;
    seen.add(chapterId);

    const rowStart = html.lastIndexOf("<tr", match.index);
    const rowEnd = html.indexOf("</tr>", match.index);
    const row = rowStart >= 0 && rowEnd > rowStart ? html.slice(rowStart, rowEnd) : match[0];
    const title = cleanHtml(match[3]);
    const number = firstMatch(title, /Chapter\s*([\d.]+)/i) || firstMatch(title, /([\d.]+)/) || String(chapters.length + 1);
    const date = cleanHtml(firstMatch(row, /itemtype="https:\/\/schema\.org\/dateCreated"[^>]*title='([^']+)'/i) || firstMatch(row, /itemtype="https:\/\/schema\.org\/dateCreated"[^>]*>([\s\S]*?)<\/span>/i)) || "Date TBA";

    chapters.push({
      id: `projectsuki:${path}`,
      provider: "projectsuki",
      number,
      title: title || `Chapter ${number}`,
      date,
      description: title || `Chapter ${number}`,
      pages: 1,
    });
  }

  return chapters.sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
}

async function getProjectSukiPages(chapterPath) {
  const path = normalizeReadPath(chapterPath);
  if (!path) return [];

  const [, bookId, chapterId] = /^\/read\/(\d+)\/(\d+)\/\d+$/i.exec(path) || [];
  if (!bookId || !chapterId) return [];

  const pages = [];
  const seen = new Set();
  for (let page = 1; page <= 120; page += 1) {
    const html = await fetchText(`${PROJECTSUKI_BASE_URL}/read/${bookId}/${chapterId}/${page}`);
    const image = extractReaderImage(html);
    if (!image || seen.has(image)) break;
    seen.add(image);
    pages.push(image);
  }
  return pages;
}

function normalizeReadPath(value) {
  const raw = String(value || "").replace(/^projectsuki:/, "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, PROJECTSUKI_BASE_URL);
    return /^\/read\/\d+\/\d+\/\d+$/i.test(url.pathname) ? url.pathname : "";
  } catch (error) {
    return "";
  }
}

function extractReaderImage(html) {
  const section = String(html || "").slice(String(html || "").indexOf("strip-reader"), String(html || "").indexOf("spinnercontent"));
  return absolutizeUrl(firstMatch(section, /<img\b[^>]*src="([^"]+)"/i), PROJECTSUKI_BASE_URL);
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
        Referer: PROJECTSUKI_BASE_URL,
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

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

module.exports = { searchProjectSukiManga, getProjectSukiChapters, getProjectSukiPages };
