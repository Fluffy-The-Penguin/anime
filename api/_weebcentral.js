const WEEBCENTRAL_BASE_URL = "https://weebcentral.com";
const REQUEST_TIMEOUT_MS = 20000;

async function searchWeebCentralManga(title) {
  try {
    const html = await fetchText(`${WEEBCENTRAL_BASE_URL}/search/data?${new URLSearchParams([
      ["text", title],
      ["display_mode", "Full Display"],
    ]).toString()}`, {
      headers: {
        Accept: "text/html,*/*;q=0.8",
        "HX-Request": "true",
        "HX-Current-URL": `${WEEBCENTRAL_BASE_URL}/search?text=${encodeURIComponent(title)}`,
        Referer: `${WEEBCENTRAL_BASE_URL}/search?text=${encodeURIComponent(title)}`,
      },
    });
    const results = parseWeebCentralSearchResults(html, title);
    if (results.length) return results;
  } catch (error) {
    // Try the public sitemap when the htmx search endpoint blocks a serverless IP.
  }

  try {
    return await searchWeebCentralSitemap(title);
  } catch (error) {
    return [];
  }
}

function parseWeebCentralSearchResults(html, title) {
  const results = [];
  const seen = new Set();
  const blocks = String(html || "").split(/(?=<article\b[^>]*class="[^"]*bg-base-300)/i);

  for (const block of blocks) {
    const path = decodeXml(firstMatch(block, /href="https:\/\/weebcentral\.com(\/series\/[^"]+)"/i));
    if (!path || seen.has(path)) continue;
    seen.add(path);

    const name = cleanHtml(firstMatch(block, /alt="([^"]*?)\s+cover"/i)) || cleanHtml(firstMatch(block, /<a\s+href="https:\/\/weebcentral\.com\/series\/[^"]+"[^>]*>([\s\S]*?)<\/a>/i));
    const score = titleScore(title, name);
    if (!name || score < 0.15) continue;

    results.push({
      id: `weebcentral:${path}`,
      provider: "weebcentral",
      title: name,
      description: cleanHtml(firstMatch(block, /<strong[^>]*>Tag\(s\):\s*<\/strong>([\s\S]*?)<\/div>/i)),
      status: cleanHtml(firstMatch(block, /<strong>Status:<\/strong>\s*<span>([^<]*)<\/span>/i)) || "unknown",
      year: cleanHtml(firstMatch(block, /<strong>Year:<\/strong>\s*<span>([^<]*)<\/span>/i)),
      cover: decodeXml(firstMatch(block, /<img\s+src="([^"]*)"/i)),
      chapterCount: 0,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

async function searchWeebCentralSitemap(title) {
  const xml = await fetchText(`${WEEBCENTRAL_BASE_URL}/sitemap.xml`);
  const results = [];
  const seen = new Set();
  const pattern = /<loc>https:\/\/weebcentral\.com(\/series\/[^<]+)<\/loc>/gi;
  let match;

  while ((match = pattern.exec(xml))) {
    const path = decodeXml(match[1]);
    if (seen.has(path)) continue;
    const slug = decodeURIComponent(path.split("/").pop() || "").replace(/[-_]+/g, " ");
    const score = titleScore(title, slug);
    if (score < 0.65) continue;
    seen.add(path);
    results.push({
      id: `weebcentral:${path}`,
      provider: "weebcentral",
      title: cleanHtml(slug),
      description: "",
      status: "unknown",
      year: "",
      cover: "",
      chapterCount: 0,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

async function getWeebCentralChapters(path) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  let html = "";
  try {
    html = await fetchText(`${WEEBCENTRAL_BASE_URL}${safePath}`);
  } catch (error) {
    return getWeebCentralChaptersFromRss(safePath);
  }
  const chapters = [];
  const seen = new Set();
  const pattern = /<a\s+href="https:\/\/weebcentral\.com(\/chapters\/[^"]+)"\s+class="[^"]*hover:bg-base-300[^"]*"[\s\S]*?<span\s+class="">\s*([^<]+?)\s*<\/span>[\s\S]*?<time[^>]*datetime="([^"]+)"/gi;
  let match;

  while ((match = pattern.exec(html))) {
    const chapterPath = decodeXml(match[1]);
    if (seen.has(chapterPath)) continue;
    seen.add(chapterPath);
    const title = cleanHtml(match[2]);
    const number = firstMatch(title, /(?:Chapter|Ch\.?|Episode)\s*([\d.]+)/i) || firstMatch(title, /([\d.]+)/) || String(chapters.length + 1);
    const date = cleanHtml(match[3]) || "Date TBA";

    chapters.push({
      id: `weebcentral:${chapterPath}`,
      provider: "weebcentral",
      number,
      title: title || `Chapter ${number}`,
      date: date !== "Date TBA" ? new Date(date).toLocaleDateString("en-US") : date,
      description: title || `Chapter ${number}`,
      pages: 1,
    });
  }

  const firstChapterPath = chapters[chapters.length - 1]?.id?.replace(/^weebcentral:/, "") || firstMatch(html, /href="https:\/\/weebcentral\.com(\/chapters\/[^"]+)"/i);
  const firstChapterId = firstMatch(firstChapterPath, /\/chapters\/([^/]+)/i);
  if (firstChapterId) {
    const seriesBasePath = firstMatch(safePath, /^(\/series\/[^/]+)/i) || safePath.replace(/\/$/, "");
    const selectHtml = await fetchText(`${WEEBCENTRAL_BASE_URL}${seriesBasePath}/chapter-select?current_chapter=${encodeURIComponent(firstChapterId)}`);
    const selectedTitle = cleanHtml(firstMatch(selectHtml, /<button\s+id="selected_chapter"[^>]*>([\s\S]*?)<\/button>/i));
    const selectorChapters = selectedTitle ? [{ path: firstChapterPath, title: selectedTitle }] : [];
    const selectorSeen = new Set(selectorChapters.map((item) => item.path));
    const selectorPattern = /<a\s+href="https:\/\/weebcentral\.com(\/chapters\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let selectorMatch;

    while ((selectorMatch = selectorPattern.exec(selectHtml))) {
      const chapterPath = decodeXml(selectorMatch[1]);
      if (selectorSeen.has(chapterPath)) continue;
      selectorSeen.add(chapterPath);
      selectorChapters.push({ path: chapterPath, title: cleanHtml(selectorMatch[2]) });
    }

    if (selectorChapters.length > chapters.length) {
      return selectorChapters.map((chapter, index) => {
        const number = firstMatch(chapter.title, /(?:Chapter|Ch\.?|Episode)\s*([\d.]+)/i) || firstMatch(chapter.title, /([\d.]+)/) || String(index + 1);
        return {
          id: `weebcentral:${chapter.path}`,
          provider: "weebcentral",
          number,
          title: chapter.title || `Chapter ${number}`,
          date: "Date TBA",
          description: chapter.title || `Chapter ${number}`,
          pages: 1,
        };
      }).filter((chapter) => chapter.number !== "0").sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
    }
  }

  return chapters.filter((chapter) => chapter.number !== "0").sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
}

async function getWeebCentralChaptersFromRss(seriesPath) {
  const seriesId = firstMatch(seriesPath, /^\/series\/([^/]+)/i);
  if (!seriesId) return [];

  const rss = await fetchText(`${WEEBCENTRAL_BASE_URL}/series/${encodeURIComponent(seriesId)}/rss`, {
    headers: { Accept: "application/rss+xml,application/xml,text/xml,*/*" },
  });
  const firstChapterPath = firstMatch(rss, /<link>https:\/\/weebcentral\.com(\/chapters\/[^<]+)<\/link>/i);
  const firstChapterId = firstMatch(firstChapterPath, /\/chapters\/([^/]+)/i);
  if (!firstChapterId) return parseWeebCentralRssChapters(rss);

  const selectHtml = await fetchText(`${WEEBCENTRAL_BASE_URL}/series/${encodeURIComponent(seriesId)}/chapter-select?current_chapter=${encodeURIComponent(firstChapterId)}`, {
    headers: {
      "HX-Request": "true",
      "HX-Current-URL": `${WEEBCENTRAL_BASE_URL}${seriesPath}`,
      Referer: `${WEEBCENTRAL_BASE_URL}${seriesPath}`,
    },
  });
  const selectedTitle = cleanHtml(firstMatch(selectHtml, /<button\s+id="selected_chapter"[^>]*>([\s\S]*?)<\/button>/i));
  const chapters = selectedTitle ? [{ path: firstChapterPath, title: selectedTitle }] : [];
  const seen = new Set(chapters.map((chapter) => chapter.path));
  const pattern = /<a\s+href="https:\/\/weebcentral\.com(\/chapters\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = pattern.exec(selectHtml))) {
    const chapterPath = decodeXml(match[1]);
    if (seen.has(chapterPath)) continue;
    seen.add(chapterPath);
    chapters.push({ path: chapterPath, title: cleanHtml(match[2]) });
  }

  if (!chapters.length) return parseWeebCentralRssChapters(rss);

  return chapters.map((chapter, index) => {
    const number = firstMatch(chapter.title, /(?:Chapter|Ch\.?|Episode)\s*([\d.]+)/i) || firstMatch(chapter.title, /([\d.]+)/) || String(index + 1);
    return {
      id: `weebcentral:${chapter.path}`,
      provider: "weebcentral",
      number,
      title: chapter.title || `Chapter ${number}`,
      date: "Date TBA",
      description: chapter.title || `Chapter ${number}`,
      pages: 1,
    };
  }).filter((chapter) => chapter.number !== "0").sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
}

function parseWeebCentralRssChapters(rss) {
  const chapters = [];
  const pattern = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>https:\/\/weebcentral\.com(\/chapters\/[^<]+)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/gi;
  let match;

  while ((match = pattern.exec(rss))) {
    const title = cleanHtml(match[1]);
    const number = firstMatch(title, /(?:Chapter|Ch\.?|Episode)\s*([\d.]+)/i) || firstMatch(title, /([\d.]+)/) || String(chapters.length + 1);
    chapters.push({
      id: `weebcentral:${decodeXml(match[2])}`,
      provider: "weebcentral",
      number,
      title: title || `Chapter ${number}`,
      date: cleanHtml(match[3]) ? new Date(cleanHtml(match[3])).toLocaleDateString("en-US") : "Date TBA",
      description: title || `Chapter ${number}`,
      pages: 1,
    });
  }

  return chapters.filter((chapter) => chapter.number !== "0").sort((a, b) => Number.parseFloat(a.number) - Number.parseFloat(b.number));
}

async function getWeebCentralPages(path) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const chapterUrl = `${WEEBCENTRAL_BASE_URL}${safePath}`;
  const html = await fetchText(`${chapterUrl}/images?is_prev=False&current_page=1&reading_style=long_strip`, {
    headers: {
      "HX-Request": "true",
      "HX-Current-URL": chapterUrl,
      Referer: chapterUrl,
    },
  });
  const pages = [];
  const seen = new Set();
  const pattern = /https:\/\/[^"'\\<\s]+?\.(?:webp|jpg|jpeg|png|gif)/gi;
  let match;

  while ((match = pattern.exec(html))) {
    const url = decodeXml(match[0]);
    if (seen.has(url)) continue;
    seen.add(url);
    pages.push(url);
  }

  return pages;
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AniTrack/1.0",
        Accept: "application/json,text/html,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      const error = new Error(`${response.status} ${response.statusText}`);
      error.status = response.status;
      error.url = url;
      throw error;
    }
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function cleanHtml(value) {
  return decodeXml(String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function firstMatch(value, pattern) {
  return String(value || "").match(pattern)?.[1] || "";
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

function titleScore(query, candidate) {
  const q = normalizeTitle(query);
  const c = normalizeTitle(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;
  if (c.includes(q) || q.includes(c)) return Math.min(q.length, c.length) / Math.max(q.length, c.length) + 0.45;
  const qTokens = new Set(q.split(" ").filter(Boolean));
  const cTokens = new Set(c.split(" ").filter(Boolean));
  const overlap = [...qTokens].filter((token) => cTokens.has(token)).length;
  return overlap / Math.max(qTokens.size, cTokens.size, 1);
}

function normalizeTitle(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

module.exports = {
  getWeebCentralChapters,
  getWeebCentralPages,
  searchWeebCentralManga,
};
