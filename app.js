const ANILIST_URL = "/api/anilist";
const STORAGE_KEY = "anitrack-library-v1";
const LEGACY_STORAGE_KEYS = ["anitrack-library-v2"];
const THEME_KEY = "anitrack-theme";
const SETTINGS_KEY = "anitrack-settings-v1";
const DETAIL_CACHE_KEY = "anitrack-last-detail";
const MANGA_CHAPTER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MANGA_PAGE_CACHE_TTL_MS = 60 * 60 * 1000;
const BROWSE_PAGE_SIZE = 28;
const API_BASE_KEY = "anitrack-api-base";
const DEFAULT_API_BASE_URL = "https://anime-api-proxy.aryanpanwar.workers.dev";
const LEGACY_API_BASE_URLS = ["http://localhost:3000", "http://fi10.bot-hosting.net:21204"];
const DEFAULT_SUBTITLE_STYLE = { size: 28, color: "#ffffff", backgroundColor: "#081018", backgroundOpacity: 46, position: "bottom", offset: 58 };
const ANIME_SOURCES = [
  { id: "animedex", name: "AnimeDex", description: "Real anime episode lists with direct HLS streams from public AnimeDex APIs.", badge: "HLS" },
  { id: "anizone", name: "AniZone", description: "Anime episode lists with proxied direct HLS playback when available.", badge: "HLS" },
  { id: "anilibria", name: "AniLibria", description: "Russian/fansub public HLS source. Lower-priority fallback for native playback.", badge: "RU HLS" },
  { id: "tokyoinsider", name: "TokyoInsider", description: "Fallback source for public MP4 download links. MKV files are ignored for browser playback.", badge: "MP4" },
  { id: "aniwaves", name: "Aniwaves", description: "Searches provider matches when raw streams are not available.", badge: "Provider" },
  { id: "hstream", name: "hstream.moe", description: "Adult-only direct playback source shown only when 18+ content is enabled.", badge: "+18", adult: true },
];
const MANGA_SOURCES = [
  { id: "mangadex", name: "MangaDex", description: "Official open manga API. Best for licensed scanlation metadata and stable pages." },
  { id: "asura", name: "Asura Scans", description: "Good for webtoon/manhwa titles hosted by Asura." },
  { id: "mangakatana", name: "MangaKatana", description: "Broad manga/manhwa catalog with many chapter lists." },
  { id: "weebcentral", name: "WeebCentral", description: "Large web manga catalog with fast chapter lists and page images." },
  { id: "flamecomics", name: "Flame Comics", description: "Scanlation source with Flame-hosted webtoon chapters." },
  { id: "rizzcomic", name: "Rizz Comic", description: "WordPress manga/manhwa source with fast chapter pages." },
  { id: "projectsuki", name: "Project Suki", description: "Public manga/manhwa source with direct reader page images." },
  { id: "manhwaz", name: "ManhwaZ", description: "Public manhwa/manhua source with direct CDN page images." },
  { id: "pornhwaz", name: "PornhwaZ", description: "Adult manhwa source with direct CDN page images.", adult: true },
  { id: "hentai20", name: "Hentai20", description: "Adult manga/manhwa source with direct chapter image pages.", adult: true },
  { id: "pornhwapro", name: "Pornhwa Pro", description: "Adult manhwa source with direct CDN page images.", adult: true },
  { id: "hentai18", name: "Hentai18", description: "Adult manga/manhwa source with direct chapter image pages.", adult: true },
  { id: "toonily", name: "Toonily", description: "Large manhwa catalog; availability may depend on upstream anti-bot checks." },
];
const DOUJIN_SOURCES = [
  { id: "hentaifox", name: "HentaiFox" },
  { id: "3hentai", name: "3Hentai" },
  { id: "hentaiera", name: "HentaiEra" },
];
const DOUJIN_TAGS = ["cheating", "ntr", "milf", "netorare", "teacher", "mind break", "vanilla", "big breasts", "cosplay", "incest", "schoolgirl", "ahegao"];
const fallbackImage = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80";

applyStoredTheme();

const page = document.body.dataset.page;
const state = {
  feed: page === "manga" ? "top" : "trending",
  filter: "all",
  browsePage: 1,
  browseQuery: "",
  genres: [],
  adultGenreOnly: false,
  year: "",
  status: "",
  latestPage: 1,
  latestAnimePage: 1,
  latestMangaPage: 1,
  latestItems: [],
  latestAnimeItems: [],
  latestMangaItems: [],
  browseCache: new Map(),
  browsePending: new Map(),
  browseToken: 0,
  browseLoadingMore: false,
  browseHasMore: true,
  doujinQuery: "",
  doujinTags: [],
  doujinToken: 0,
  libraryAdultFilter: "all",
  readerSession: null,
  browseSpotlightItems: [],
  browseSpotlightIndex: 0,
  browseSpotlightTimer: null,
  homePointerStart: null,
  libraryType: "all",
  settings: loadSettings(),
  library: loadLibrary(),
  current: null,
  currentItems: [],
};

const playerRuntime = {
  anime: null,
  episodes: [],
  allSourceEpisodes: [],
  currentEpisode: null,
  currentEpisodeNumber: null,
  currentSourceMatches: [],
  currentSourceIndex: -1,
  autoPlay: true,
  autoNext: false,
  streamToken: 0,
  keyboardHandler: null,
  hls: null,
  dash: null,
  resumeState: null,
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyThemeColor();
  injectChrome();
  updateStats();
  setupMobileNavMode();

  if (page === "home") initHomePage();
  if (page === "anime" || page === "manga") initBrowsePage();
  if (page === "doujin") initDoujinPage();
  if (page === "doujin-preview") initDoujinPreviewPage();
  if (page === "library") initLibraryPage();
  if (page === "details") initDetailsPage();
  if (page === "settings") initSettingsPage();
  if (page === "player") initPlayerPage();
  if (page === "reader") initReaderPage();
}

function setupMobileNavMode() {
  if (page === "reader") {
    document.body.classList.remove("is-scrolled", "mobile-nav-floating");
    return;
  }
  const media = window.matchMedia?.("(max-width: 720px)");
  const update = () => {
    const isMobile = media ? media.matches : window.innerWidth <= 720;
    const isScrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 24;
    document.body.classList.toggle("is-scrolled", isScrolled);
    document.body.classList.toggle("mobile-nav-floating", isMobile && isScrolled);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  media?.addEventListener?.("change", update);
}

function injectChrome() {
  const topbar = document.querySelector(".topbar");
  if (topbar && !topbar.querySelector(".top-actions")) {
    topbar.insertAdjacentHTML(
      "beforeend",
      `<div class="top-actions">
        <button class="icon-btn menu-toggle" data-menu-toggle type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
        ${(page === "anime" || page === "manga" || page === "doujin") ? `<button class="icon-btn nav-search-toggle" data-browse-filter-toggle type="button" aria-label="Show search and filters" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.7 18.4a7.7 7.7 0 1 1 5.4-13.1 7.7 7.7 0 0 1 0 10.8l4.1 4.1-2 2-4.1-4.1a7.6 7.6 0 0 1-3.4.8Zm0-3a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4Z"/></svg>
        </button>` : ""}
        <button class="icon-btn theme-toggle" data-theme-toggle type="button" aria-label="Toggle theme">${themeIcon()}</button>
        <div class="profile-menu">
          <button class="icon-btn profile-btn" data-profile-toggle type="button" aria-label="Open profile settings">AT</button>
          <div class="profile-popover" data-profile-popover>
            <strong>Profile</strong>
            <button class="settings-row" data-library-button type="button">Library</button>
            <button class="settings-row" data-settings-button type="button">Settings</button>
            <label class="settings-toggle"><span>Show 18+ content</span><input data-adult-toggle type="checkbox" ${state.settings.allowAdult ? "checked" : ""}></label>
            <div class="personalize-block">
              <span>Personalize</span>
              <label class="color-field">Theme color <input data-theme-color type="color" value="${escapeAttr(state.settings.themeColor || "#48dbfb")}"></label>
              <button class="settings-row" data-reset-color type="button">Use poster colors</button>
            </div>
          </div>
        </div>
      </div>`
    );
  }

  if (topbar && !document.querySelector(".mobile-bottom-nav")) {
    const nav = topbar.querySelector(".nav");
    if (nav) document.body.insertAdjacentHTML("beforeend", `<nav class="mobile-bottom-nav" aria-label="Mobile navigation">${nav.innerHTML}</nav>`);
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="toast" data-toast role="status" aria-live="polite"></div>`
  );

  if (!document.querySelector(".site-footer")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<footer class="site-footer shell"><strong>AniTrack</strong><p>Anime and manga discovery with local progress tracking. Powered by AniList data.</p></footer>`
    );
  }

  document.querySelector("[data-profile-toggle]").addEventListener("click", toggleProfileMenu);
  document.querySelector("[data-library-button]").addEventListener("click", () => {
    window.location.href = "library.html";
  });
  document.querySelector("[data-settings-button]").addEventListener("click", () => {
    window.location.href = "settings.html";
  });
  document.querySelector("[data-adult-toggle]").addEventListener("change", updateAdultSetting);
  document.querySelector("[data-theme-color]").addEventListener("input", updateThemeColor);
  document.querySelector("[data-reset-color]").addEventListener("click", resetThemeColor);
  document.querySelector("[data-theme-toggle]").addEventListener("click", toggleTheme);
  document.querySelector("[data-menu-toggle]").addEventListener("click", toggleMobileMenu);
  document.querySelector("[data-browse-filter-toggle]")?.addEventListener("click", toggleBrowseFilters);
  syncAdultControls();
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".profile-menu")) closeProfileMenu();
    if (!event.target.closest(".topbar")) closeMobileMenu();
  });
}

function initBrowsePage() {
  const form = document.querySelector("[data-browse-form]");
  const search = document.querySelector("[data-browse-search]");
  const sort = document.querySelector("[data-sort-filter]");
  const genre = document.querySelector("[data-genre-filter]");
  const genreToggle = genre?.querySelector("[data-genre-toggle]");
  const adultGenreInput = genre?.querySelector("[data-adult-genre]");
  const genreInputs = genre ? [...genre.querySelectorAll('input[type="checkbox"]:not([data-adult-genre])')] : [];
  const year = document.querySelector("[data-year-filter]");
  const status = document.querySelector("[data-status-filter]");
  const grid = document.querySelector("[data-grid]");
  const pager = document.querySelector("[data-pager]");
  const sentinel = ensureBrowseSentinel(pager);
  let searchTimer;
  applyBrowseUrlParams(search);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.browseQuery = search.value.trim();
    state.browsePage = 1;
    updateBrowseUrl();
    loadFeed();
  });

  search.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    window.clearTimeout(searchTimer);
    state.browseQuery = search.value.trim();
    state.browsePage = 1;
    updateBrowseUrl();
    loadFeed();
  });

  search.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      state.browseQuery = search.value.trim();
      state.browsePage = 1;
      updateBrowseUrl();
      loadFeed();
    }, 350);
  });

  [sort, year, status].forEach((control) => {
    control.addEventListener("change", () => {
      state.feed = sort.value;
      state.year = year.value;
      state.status = status.value;
      state.browsePage = 1;
      updateBrowseUrl();
      loadFeed();
    });
  });

  genreToggle.addEventListener("click", () => {
    genre.classList.toggle("open");
  });

  if (adultGenreInput) {
    adultGenreInput.checked = Boolean(state.adultGenreOnly);
    adultGenreInput.addEventListener("change", () => {
      if (adultGenreInput.checked && !state.settings.allowAdult) {
        adultGenreInput.checked = false;
        state.adultGenreOnly = false;
        updateGenreToggleLabel();
        showToast("Enable 18+ content in Settings first.");
        return;
      }
      state.adultGenreOnly = adultGenreInput.checked;
      updateGenreToggleLabel();
      state.browsePage = 1;
      updateBrowseUrl();
      loadFeed();
    });
  }

  genreInputs.forEach((input) => input.addEventListener("change", () => {
    const selected = genreInputs.filter((item) => item.checked);
    state.genres = selected.map((item) => item.value);
    updateGenreToggleLabel();
    state.browsePage = 1;
    updateBrowseUrl();
    loadFeed();
  }));

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-genre-filter]")) genre.classList.remove("open");
  });

  document.querySelector("[data-clear-search]").addEventListener("click", () => {
    search.value = "";
    state.browseQuery = "";
    state.browsePage = 1;
    updateBrowseUrl();
    loadFeed();
    search.focus();
  });

  document.querySelector("[data-reset-filters]").addEventListener("click", () => {
    state.feed = page === "manga" ? "top" : "trending";
    state.genres = [];
    state.adultGenreOnly = false;
    if (adultGenreInput) adultGenreInput.checked = false;
    genreInputs.forEach((input) => {
      input.checked = false;
    });
    updateGenreToggleLabel();
    state.year = "";
    state.status = "";
    sort.value = state.feed;
    year.value = "";
    status.value = "";
    state.browsePage = 1;
    updateBrowseUrl();
    loadFeed();
  });

  pager.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page-number]");
    if (pageButton) state.browsePage = Number(pageButton.dataset.pageNumber);
    if (event.target.closest("[data-page-next]")) state.browsePage += 1;
    if (event.target.closest("[data-page-prev]")) state.browsePage = Math.max(1, state.browsePage - 1);
    updateBrowseUrl();
    loadFeed();
  });

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadMoreBrowse();
  }, { rootMargin: "800px 0px" });
  observer.observe(sentinel);

  grid.addEventListener("click", handleCardNavigation);
  updateGenreToggleLabel();

  loadFeed();
}

function initDoujinPage() {
  const form = document.querySelector("[data-doujin-form]");
  const search = document.querySelector("[data-doujin-search]");
  const tags = document.querySelector("[data-doujin-tags]");
  const grid = document.querySelector("[data-doujin-grid]");
  const clear = document.querySelector("[data-clear-search]");

  if (!form || !search || !tags || !grid) return;

  tags.innerHTML = DOUJIN_TAGS.map((tag) => `<button class="chip" data-doujin-tag="${escapeAttr(tag)}" type="button">${escapeHtml(tag)}</button>`).join("");
  applyDoujinUrlParams(search);
  syncDoujinTags();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.doujinQuery = search.value.trim();
    updateDoujinUrl();
    loadDoujinSearch();
  });

  search.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    state.doujinQuery = search.value.trim();
    updateDoujinUrl();
    loadDoujinSearch();
  });

  tags.addEventListener("click", (event) => {
    const button = event.target.closest("[data-doujin-tag]");
    if (!button) return;
    const tag = button.dataset.doujinTag;
    state.doujinTags = state.doujinTags.includes(tag) ? state.doujinTags.filter((item) => item !== tag) : [...state.doujinTags, tag];
    syncDoujinTags();
    updateDoujinUrl();
    loadDoujinSearch();
  });

  clear?.addEventListener("click", () => {
    search.value = "";
    state.doujinQuery = "";
    state.doujinTags = [];
    syncDoujinTags();
    updateDoujinUrl();
    loadDoujinSearch();
    search.focus();
  });

  grid.addEventListener("click", openDoujinPreview);
  loadDoujinSearch();
}

function applyDoujinUrlParams(searchInput) {
  const params = new URLSearchParams(window.location.search);
  state.doujinQuery = params.get("search") || "";
  state.doujinTags = uniqueStrings((params.get("tags") || "").split(",")).filter((tag) => DOUJIN_TAGS.includes(tag));
  searchInput.value = state.doujinQuery;
}

function updateDoujinUrl() {
  const params = new URLSearchParams();
  if (state.doujinQuery) params.set("search", state.doujinQuery);
  if (state.doujinTags.length) params.set("tags", state.doujinTags.join(","));
  const query = params.toString();
  history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
}

function syncDoujinTags() {
  document.querySelectorAll("[data-doujin-tag]").forEach((button) => {
    button.classList.toggle("active", state.doujinTags.includes(button.dataset.doujinTag));
  });
}

async function loadDoujinSearch() {
  const grid = document.querySelector("[data-doujin-grid]");
  const heading = document.querySelector("[data-heading]");
  const status = document.querySelector("[data-doujin-status]");
  if (!grid) return;

  if (!state.settings.allowAdult) {
    if (heading) heading.textContent = "Doujin locked";
    if (status) status.textContent = "Enable 18+ content from the profile menu to unlock English doujinshi search.";
    renderEmpty(grid, "18+ content is disabled.");
    return;
  }

  const query = doujinSearchQuery();
  if (!query) {
    if (heading) heading.textContent = "English Doujinshi";
    if (status) status.textContent = "Loading latest English doujinshi...";
  }

  const token = ++state.doujinToken;
  if (query && heading) heading.textContent = `English doujinshi for "${query}"`;
  if (query && status) status.textContent = "Searching English-only sources...";
  setLoading(grid, 12);

  try {
    const providers = doujinProviderIds();
    const queryParam = query ? `title=${encodeURIComponent(query)}&` : "latest=1&";
    const results = await fetchApiJson(`/api/manga/search?${queryParam}providers=${encodeURIComponent(providers.join(","))}`);
    if (token !== state.doujinToken) return;
    const items = bestDoujinResults(results, providers);
    if (status) status.textContent = `${items.length} ${query ? "English result" : "latest English doujinshi"}${items.length === 1 ? "" : "s"} from ${providers.length} sources`;
    renderDoujinCards(grid, items);
  } catch (error) {
    if (token !== state.doujinToken) return;
    if (status) status.textContent = "Search failed";
    renderEmpty(grid, "Could not load doujinshi results right now.");
  }
}

function doujinSearchQuery() {
  return uniqueStrings([state.doujinQuery, ...state.doujinTags]).join(" ").trim();
}

function doujinProviderIds() {
  return DOUJIN_SOURCES.map((source) => source.id);
}

function bestDoujinResults(results, providers) {
  const byId = new Map();
  (Array.isArray(results) ? results : []).forEach((result) => {
    if (!result?.id || !providers.includes(result.provider)) return;
    const score = Number(result.score || 0);
    if (score < 0.15) return;
    const current = byId.get(result.id);
    if (!current || score > Number(current.score || 0)) byId.set(result.id, result);
  });
  return [...byId.values()].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
}

function renderDoujinCards(container, items) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No English doujinshi found for this search.");

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const card = create("button", "browse-card doujin-card");
    card.type = "button";
    card.dataset.doujin = JSON.stringify(item);
    card.innerHTML = `
      <img src="${escapeAttr(item.cover || fallbackImage)}" alt="${escapeAttr(item.title)} cover" loading="lazy">
      <h3>${escapeHtml(item.title)}</h3>
      <div class="browse-meta"><span>${escapeHtml(providerLabel(item.provider))}</span><i></i><span>English</span></div>
    `;
    fragment.append(card);
  });
  container.append(fragment);
}

function openDoujinPreview(event) {
  const card = event.target.closest("[data-doujin]");
  if (!card) return;
  const source = JSON.parse(card.dataset.doujin);
  const manga = doujinMangaFromSource(source);
  sessionStorage.setItem("doujin-preview-manga", JSON.stringify(manga));
  window.location.href = `doujin-preview.html?id=${encodeURIComponent(source.id)}`;
}

function doujinMangaFromSource(source) {
  return {
    id: `doujin-${source.id}`,
    apiId: source.id,
    type: "manga",
    displayType: "Doujinshi",
    title: source.title || providerLabel(source.provider),
    englishTitle: source.title || "",
    romajiTitle: "",
    nativeTitle: "",
    alternativeTitles: [source.title || ""].filter(Boolean),
    description: source.description || "English doujinshi gallery.",
    image: source.cover || fallbackImage,
    banner: source.cover || "",
    accent: colorFromString(source.title || source.id),
    score: "N/A",
    year: "TBA",
    total: 1,
    unit: "chapter",
    genres: ["Doujinshi", "English", "Adult"],
    format: "Doujinshi",
    statusText: "Unknown",
    provider: source.provider,
    providerId: source.id,
    providerTitle: source.title || providerLabel(source.provider),
    preloadedSources: [source],
    isAdult: true,
  };
}

async function initDoujinPreviewPage() {
  const root = document.querySelector("[data-doujin-preview]");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  if (!root || !state.settings.allowAdult) {
    if (root) renderEmpty(root, "Enable 18+ content to preview doujinshi.");
    return;
  }

  let manga = null;
  try {
    manga = JSON.parse(sessionStorage.getItem("doujin-preview-manga") || "null");
  } catch (error) {
    manga = null;
  }
  if (!manga || (id && manga.apiId !== id)) {
    const provider = String(id).split(":")[0];
    manga = doujinMangaFromSource({ id, provider, title: providerLabel(provider), cover: fallbackImage });
  }
  state.current = { ...manga, ...state.library[manga.id] };
  document.title = `AniTrack | ${manga.title}`;
  renderDoujinPreview(root, manga, [], true);

  try {
    const chapters = await fetchApiJson(`/api/manga/chapters?mangaId=${encodeURIComponent(manga.apiId)}`);
    const chapter = chapters[0] || { id: manga.apiId, provider: manga.provider, number: "1", title: manga.title };
    const data = await fetchMangaPagesCached(chapter.id || manga.apiId);
    renderDoujinPreview(root, manga, data.pages || [], false, chapter);
  } catch (error) {
    renderDoujinPreview(root, manga, [], false);
    showToast("Could not load preview pages.");
  }
}

function renderDoujinPreview(root, manga, pages, loading = false, chapter = null) {
  const tracked = state.library[manga.id];
  root.innerHTML = `
    <section class="doujin-preview-hero panel">
      <img class="doujin-preview-cover" src="${escapeAttr(manga.image || fallbackImage)}" alt="${escapeAttr(manga.title)} cover">
      <div class="doujin-preview-copy">
        <span class="eyebrow">${escapeHtml(providerLabel(manga.provider))} / English Doujinshi</span>
        <h1>${escapeHtml(manga.title)}</h1>
        <p class="muted">${escapeHtml(manga.description || "Preview pages before you start reading.")}</p>
        <div class="doujin-preview-meta">
          <span>Pages: ${loading ? "Loading" : pages.length || "Unavailable"}</span>
          <span>Language: English</span>
          <span>Category: Doujinshi</span>
        </div>
        <div class="doujin-preview-actions">
          <button class="btn" data-doujin-read-page="0" type="button">Read online</button>
          <button class="btn secondary" data-doujin-save type="button">${tracked ? "Saved" : "Add to Library"}</button>
          <a class="btn secondary" href="doujin.html">Back to Doujin</a>
        </div>
      </div>
    </section>
    <section class="panel doujin-preview-panel">
      <div class="section-head compact">
        <div>
          <span class="eyebrow">Page preview</span>
          <h2>${loading ? "Loading pages" : `${pages.length} pages`}</h2>
        </div>
      </div>
      <div class="doujin-preview-grid" data-doujin-preview-grid>
        ${loading ? Array.from({ length: 12 }, () => '<div class="skeleton-card"></div>').join("") : pages.map((url, index) => `
          <button class="doujin-page-thumb" data-doujin-read-page="${index}" type="button" aria-label="Read from page ${index + 1}">
            <img src="${escapeAttr(url)}" alt="${escapeAttr(manga.title)} page ${index + 1}" loading="lazy">
            <span>${index + 1}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;

  root.querySelector("[data-doujin-save]")?.addEventListener("click", () => saveDoujinToLibrary(manga));
  root.querySelectorAll("[data-doujin-read-page]").forEach((button) => {
    button.addEventListener("click", () => openDoujinReaderFromPreview(manga, chapter, Number(button.dataset.doujinReadPage || 0)));
  });
}

function saveDoujinToLibrary(manga) {
  const saved = { ...manga, status: state.library[manga.id]?.status || "reading", progress: state.library[manga.id]?.progress || 0, rating: state.library[manga.id]?.rating || "", notes: state.library[manga.id]?.notes || "", updatedAt: Date.now(), isAdult: true };
  state.library[saved.id] = saved;
  state.current = saved;
  persistLibrary();
  showToast("Saved to your library.");
  const button = document.querySelector("[data-doujin-save]");
  if (button) button.textContent = "Saved";
}

function openDoujinReaderFromPreview(manga, chapter, pageIndex) {
  sessionStorage.setItem("reader-manga", JSON.stringify(manga));
  sessionStorage.setItem("reader-start-page", JSON.stringify({
    mangaKey: mangaSourceKey(manga),
    providerId: manga.apiId,
    chapterId: chapter?.id || manga.apiId,
    pageIndex: Math.max(0, pageIndex),
  }));
  window.location.href = `manga-reader.html?type=doujin&id=${encodeURIComponent(manga.apiId)}&page=${Math.max(1, pageIndex + 1)}`;
}

function initHomePage() {
  const featuredRail = document.querySelector("[data-home-featured]");
  const animeGrid = document.querySelector("[data-home-anime]");
  const mangaGrid = document.querySelector("[data-home-manga]");
  const latestAnime = document.querySelector("[data-home-latest-anime]");
  const latestManga = document.querySelector("[data-home-latest-manga]");
  const rankingList = document.querySelector("[data-home-ranking]");
  const editorPick = document.querySelector("[data-home-editor]");
  featuredRail.addEventListener("click", handleCardNavigation);
  animeGrid.addEventListener("click", handleCardNavigation);
  mangaGrid.addEventListener("click", handleCardNavigation);
  latestAnime.addEventListener("click", handleCardNavigation);
  latestManga.addEventListener("click", handleCardNavigation);
  rankingList.addEventListener("click", handleCardNavigation);
  editorPick.addEventListener("click", handleCardNavigation);
  document.addEventListener("pointerdown", handleHomePointerDown, true);
  document.addEventListener("pointerup", handleHomePointerNavigation, true);
  document.querySelectorAll("[data-rail-control]").forEach((button) => {
    button.addEventListener("click", () => loadHomeUpdateRail(button.dataset.railControl, button.dataset.direction));
  });
  window.addEventListener("resize", syncHomePanelHeights);
  loadHomeSections();
}

function initLibraryPage() {
  const filters = document.querySelector("[data-library-filters]");
  const typeFilters = document.querySelector("[data-library-type-filters]");
  const adultFilter = document.querySelector("[data-library-adult-filter]");
  const lists = document.querySelectorAll("[data-library-list]");
  const params = new URLSearchParams(window.location.search);
  state.libraryType = ["anime", "manga"].includes(params.get("type")) ? params.get("type") : "all";
  state.libraryAdultFilter = ["all", "adult", "normal"].includes(params.get("adult")) ? params.get("adult") : "all";
  if (adultFilter) adultFilter.value = state.libraryAdultFilter;

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    setActive(filters, button);
    state.filter = button.dataset.filter;
    renderLibrary();
  });

  typeFilters?.addEventListener("click", (event) => {
    const link = event.target.closest("[data-library-type]");
    if (!link) return;
    event.preventDefault();
    state.libraryType = link.dataset.libraryType;
    renderLibrary();
  });

  adultFilter?.addEventListener("change", () => {
    state.libraryAdultFilter = adultFilter.value;
    renderLibrary();
  });

  lists.forEach((list) => {
    list.addEventListener("click", (event) => {
      const row = event.target.closest("[data-id]");
      if (!row) return;
      const item = state.library[row.dataset.id];
      if (isDoujinLibraryItem(item)) {
        sessionStorage.setItem("doujin-preview-manga", JSON.stringify(item));
        window.location.href = `doujin-preview.html?id=${encodeURIComponent(item.apiId || item.providerId)}`;
        return;
      }
      goToDetails(item);
    });
  });

  renderLibrary();
}

function syncHomePanelHeights() {
  if (page !== "home") return;
  const updates = document.querySelector(".updates-panel");
  const ranking = document.querySelector(".ranking-panel");
  if (!updates || !ranking) return;

  if (window.innerWidth <= 720) {
    ranking.style.height = "";
    ranking.style.maxHeight = "";
    return;
  }

  const height = Math.round(updates.getBoundingClientRect().height);
  ranking.style.height = `${height}px`;
  ranking.style.maxHeight = `${height}px`;
}

async function loadHomeSections() {
  const featuredRail = document.querySelector("[data-home-featured]");
  const animeGrid = document.querySelector("[data-home-anime]");
  const mangaGrid = document.querySelector("[data-home-manga]");
  const latestAnime = document.querySelector("[data-home-latest-anime]");
  const latestManga = document.querySelector("[data-home-latest-manga]");
  const rankingList = document.querySelector("[data-home-ranking]");
  const editorPick = document.querySelector("[data-home-editor]");
  setRailLoading(featuredRail, 8);
  setLoading(animeGrid, 4);
  setLoading(mangaGrid, 4);
  setRailLoading(latestAnime, 3);
  setRailLoading(latestManga, 3);
  setListLoading(rankingList, 4);

  const [animeResult, mangaResult, rankingResult] = await Promise.allSettled([
    fetchAnimeFeed("trending"),
    fetchMangaFeed("top"),
    fetchAnimeFeed("popular"),
  ]);
  const animeItems = animeResult.status === "fulfilled" ? animeResult.value.slice(0, 4) : samples.filter((item) => item.type === "anime");
  const mangaItems = mangaResult.status === "fulfilled" ? mangaResult.value.slice(0, 4) : samples.filter((item) => item.type === "manga");
  const rankingItems = rankingResult.status === "fulfilled" ? rankingResult.value.slice(0, 4) : animeItems;
  const featuredItems = mergeItems([...(animeResult.status === "fulfilled" ? animeResult.value : []), ...(mangaResult.status === "fulfilled" ? mangaResult.value : [])]).slice(0, 12);

  state.latestItems = [];
  state.latestAnimeItems = [];
  state.latestMangaItems = [];
  state.latestPage = 1;
  state.currentItems = mergeItems([...featuredItems, ...animeItems, ...mangaItems, ...rankingItems]);
  renderPosterRail(featuredRail, featuredItems.length ? featuredItems : [...animeItems, ...mangaItems]);
  renderCards(animeGrid, animeItems);
  renderCards(mangaGrid, mangaItems);
  renderRankingList(rankingList, rankingItems);
  renderEditorPick(editorPick, mangaItems[0] || animeItems[0]);
  syncHomePanelHeights();
  window.setTimeout(syncHomePanelHeights, 250);
  window.setTimeout(loadInitialHomeUpdates, 350);
}

async function loadInitialHomeUpdates() {
  if (page !== "home") return;
  const latestAnime = document.querySelector("[data-home-latest-anime]");
  const latestManga = document.querySelector("[data-home-latest-manga]");
  const [latestResult, latestMangaResult] = await Promise.allSettled([
    fetchAnimeLatest(state.latestAnimePage),
    fetchMangaLatest(state.latestMangaPage),
  ]);
  const latestAnimeItems = latestResult.status === "fulfilled" ? latestResult.value.slice(0, 8) : [];
  const latestMangaItems = latestMangaResult.status === "fulfilled" ? latestMangaResult.value.slice(0, 8) : [];
  state.latestAnimeItems = latestAnimeItems;
  state.latestMangaItems = latestMangaItems;
  state.latestItems = [...latestAnimeItems, ...latestMangaItems];
  state.currentItems = mergeItems([...state.currentItems, ...latestAnimeItems, ...latestMangaItems]);
  renderStaticRail(latestAnime, latestAnimeItems);
  renderStaticRail(latestManga, latestMangaItems);
  syncHomePanelHeights();
}

async function initDetailsPage() {
  const root = document.querySelector("[data-details-root]");
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const apiId = params.get("id");
  const apiSource = params.get("source") || "";
  const cache = loadDetailCache();
  const key = type && apiId ? `${type}-${apiId}` : cache?.id;
  const cachedItem = key ? state.library[key] || (cache?.id === key ? cache : null) : null;

  if (!type || !apiId) {
    renderDetailsError(root, "No title selected. Use Search, Anime, Manga, or Library to open a detail page.");
    return;
  }

  if (cachedItem) renderDetails(root, cachedItem, true);

  try {
    const sourceHint = apiSource || cachedItem?.apiSource || "";
    const freshItem = type === "anime" ? await fetchAnimeDetails(apiId, sourceHint) : await fetchMangaDetails(apiId, sourceHint);
    state.current = mergeFreshDetail(freshItem, state.library[freshItem.id]);
    renderDetails(root, state.current);
  } catch (error) {
    if (cachedItem) {
      state.current = cachedItem;
      showToast("Live details could not refresh. Showing saved data.");
      return;
    }
    renderDetailsError(root, "Details could not load right now.");
  }
}

async function loadFeed() {
  const grid = document.querySelector("[data-grid]");
  const heading = document.querySelector("[data-heading]");
  const sentinel = document.querySelector("[data-browse-sentinel]");
  const token = ++state.browseToken;
  const pageNumber = state.browsePage;
  const cacheKey = browseCacheKey(pageNumber);
  state.browseHasMore = true;
  state.browseLoadingMore = false;
  if (sentinel) sentinel.textContent = "Loading titles...";
  setLoading(grid, BROWSE_PAGE_SIZE);

  try {
    state.currentItems = state.browseCache.get(cacheKey) || await fetchBrowseItems(pageNumber);
    state.browseCache.set(cacheKey, state.currentItems);
    if (token !== state.browseToken) return;
    state.browseHasMore = state.currentItems.length >= BROWSE_PAGE_SIZE;
    heading.textContent = headingText();
    renderBrowseSpotlight(state.browseQuery ? [] : state.currentItems.slice(0, 10));
    renderBrowseCards(grid, state.currentItems);
    updateBrowsePager();
    preloadAdjacentBrowsePages();
    updateBrowseSentinel();
  } catch (error) {
    if (token !== state.browseToken) return;
    state.currentItems = samples.filter((item) => item.type === page);
    state.browseHasMore = false;
    renderBrowseSpotlight(state.browseQuery ? [] : state.currentItems.slice(0, 10));
    renderBrowseCards(grid, state.currentItems);
    updateBrowsePager();
    updateBrowseSentinel();
    showToast("Live data could not load. Showing sample titles.");
  }
}

async function loadMoreBrowse() {
  if (state.browseLoadingMore || !state.browseHasMore) return;
  const grid = document.querySelector("[data-grid]");
  const token = state.browseToken;
  const nextPage = state.browsePage + 1;
  const cacheKey = browseCacheKey(nextPage);
  state.browseLoadingMore = true;
  updateBrowseSentinel("Loading more titles...");

  try {
    const items = state.browseCache.get(cacheKey) || await fetchBrowseItems(nextPage);
    state.browseCache.set(cacheKey, items);
    if (token !== state.browseToken) return;

    if (!items.length) {
      state.browseHasMore = false;
      return;
    }

    state.browsePage = nextPage;
    updateBrowseUrl();
    state.currentItems = mergeItems([...state.currentItems, ...items]);
    renderBrowseCards(grid, items, true);
    state.browseHasMore = items.length >= BROWSE_PAGE_SIZE;
    updateBrowsePager();
    preloadAdjacentBrowsePages();
  } catch (error) {
    showToast("Could not load more titles. Try again in a moment.");
  } finally {
    if (token === state.browseToken) {
      state.browseLoadingMore = false;
      updateBrowseSentinel();
    }
  }
}

function fetchBrowseItems(pageNumber) {
  if (state.browseQuery) return page === "anime" ? searchAnime(state.browseQuery, pageNumber) : searchManga(state.browseQuery, pageNumber);
  return page === "anime" ? fetchAnimeFeed(state.feed, pageNumber) : fetchMangaFeed(state.feed, pageNumber);
}

function applyBrowseUrlParams(searchInput) {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("search") || "";
  const pageNumber = Number(params.get("page") || 1);
  if (query) {
    state.browseQuery = query;
    searchInput.value = query;
  }
  if (pageNumber > 0) state.browsePage = pageNumber;
  state.adultGenreOnly = params.get("adult") === "1" && state.settings.allowAdult;
}

function updateBrowseUrl() {
  const params = new URLSearchParams(window.location.search);
  if (state.browseQuery) params.set("search", state.browseQuery);
  else params.delete("search");
  if (state.browsePage > 1) params.set("page", String(state.browsePage));
  else params.delete("page");
  if (state.adultGenreOnly) params.set("adult", "1");
  else params.delete("adult");
  const query = params.toString();
  history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
}

function preloadAdjacentBrowsePages() {
  [state.browsePage - 1, state.browsePage + 1].filter((pageNumber) => pageNumber > 0).forEach((pageNumber) => {
    const key = browseCacheKey(pageNumber);
    if (state.browseCache.has(key) || state.browsePending.has(key)) return;

    const pending = fetchBrowseItems(pageNumber)
      .then((items) => state.browseCache.set(key, items))
      .catch(() => null)
      .finally(() => state.browsePending.delete(key));
    state.browsePending.set(key, pending);
  });
}

function browseCacheKey(pageNumber) {
  return JSON.stringify({
    type: page,
    page: pageNumber,
    feed: state.feed,
    query: state.browseQuery,
    genres: state.genres,
    adultGenreOnly: state.adultGenreOnly,
    year: state.year,
    status: state.status,
    adult: state.settings.allowAdult,
  });
}

async function handleOverlaySearch(event) {
  event.preventDefault();
  const input = document.querySelector("[data-overlay-search-input]");
  const type = document.querySelector("[data-overlay-search-type]").value;
  const query = input.value.trim();

  if (!query) return showToast("Type a title to search.");
  window.location.href = `${type}.html?search=${encodeURIComponent(query)}`;
}

async function fetchAnimeFeed(feed, pageNumber = 1) {
  const sort = { trending: "TRENDING_DESC", top: "SCORE_DESC", popular: "POPULARITY_DESC" }[feed] || "TRENDING_DESC";
  const filter = animeFilterArgs(["type: ANIME", "sort: $sort"]);
  const defs = animeQueryDefs(["$page: Int", "$sort: [MediaSort]"]);
  const variables = { page: pageNumber, sort: [sort] };
  if (state.genres.length) variables.genres = state.genres;
  if (state.year) variables.year = Number(state.year);
  if (state.status) variables.status = state.status;

  const data = await anilistQuery(
    `query (${defs}) {
      Page(page: $page, perPage: ${BROWSE_PAGE_SIZE}) {
        media(${filter}) {
          id idMal title { romaji english native } description(asHtml: false) episodes averageScore seasonYear genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    variables
  );
  return data.Page.media.map(mapAniList);
}

async function fetchAnimeLatest(pageNumber = 1) {
  const filter = animeFilterArgs(["type: ANIME", "sort: UPDATED_AT_DESC"], false);
  const data = await anilistQuery(
    `query ($page: Int) {
      Page(page: $page, perPage: 12) {
        media(${filter}) {
          id idMal title { romaji english native } description(asHtml: false) episodes averageScore seasonYear genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    { page: pageNumber }
  );
  return data.Page.media.map(mapAniList);
}

async function fetchAnimeDetails(apiId, apiSource = "") {
  const filter = animeFilterArgs(["id: $id", "type: ANIME"], false);
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(${filter}) {
        id idMal title { romaji english native } synonyms description(asHtml: false) episodes duration averageScore popularity seasonYear status format genres bannerImage
        coverImage { extraLarge large color }
        studios(isMain: true) { nodes { name } }
        streamingEpisodes { title thumbnail site }
      }
    }`,
    { id: Number(apiId), source: apiSource }
  );
  return mapAniList(data.Media);
}

async function searchAnime(query, pageNumber = 1) {
  const filter = animeFilterArgs(["search: $search", "type: ANIME"]);
  const defs = animeQueryDefs(["$page: Int", "$search: String"]);
  const variables = { page: pageNumber, search: query };
  if (state.genres.length) variables.genres = state.genres;
  if (state.year) variables.year = Number(state.year);
  if (state.status) variables.status = state.status;

  const data = await anilistQuery(
    `query (${defs}) {
      Page(page: $page, perPage: ${BROWSE_PAGE_SIZE}) {
        media(${filter}) {
          id idMal title { romaji english native } description(asHtml: false) episodes averageScore seasonYear genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    variables
  );
  return data.Page.media.map(mapAniList);
}

async function fetchMangaFeed(feed, pageNumber = 1) {
  const sort = { top: "SCORE_DESC", popular: "POPULARITY_DESC", publishing: "UPDATED_AT_DESC" }[feed] || "SCORE_DESC";
  const filter = animeFilterArgs(["type: MANGA", "sort: $sort"]);
  const defs = animeQueryDefs(["$page: Int", "$sort: [MediaSort]"]);
  const variables = { page: pageNumber, sort: [sort] };
  if (state.genres.length) variables.genres = state.genres;
  if (state.year) variables.year = Number(state.year);
  if (state.status) variables.status = state.status;

  const data = await anilistQuery(
    `query (${defs}) {
      Page(page: $page, perPage: ${BROWSE_PAGE_SIZE}) {
        media(${filter}) {
          id title { romaji english native } synonyms description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    variables
  );
  return data.Page.media.map(mapAniListManga);
}

async function fetchMangaLatest(pageNumber = 1) {
  const filter = animeFilterArgs(["type: MANGA", "sort: UPDATED_AT_DESC"], false);
  const data = await anilistQuery(
    `query ($page: Int) {
      Page(page: $page, perPage: 12) {
        media(${filter}) {
          id title { romaji english native } synonyms description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    { page: pageNumber }
  );
  return data.Page.media.map(mapAniListManga);
}

async function fetchMangaDetails(apiId, apiSource = "") {
  const filter = animeFilterArgs(["id: $id", "type: MANGA"], false);
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(${filter}) {
        id title { romaji english native } synonyms description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage
        coverImage { extraLarge large color }
        staff(perPage: 1) { nodes { name { full } } }
      }
    }`,
    { id: Number(apiId), source: apiSource }
  );
  return mapAniListManga(data.Media);
}

async function searchManga(query, pageNumber = 1) {
  const filter = animeFilterArgs(["search: $search", "type: MANGA"]);
  const defs = animeQueryDefs(["$page: Int", "$search: String"]);
  const variables = { page: pageNumber, search: query };
  if (state.genres.length) variables.genres = state.genres;
  if (state.year) variables.year = Number(state.year);
  if (state.status) variables.status = state.status;

  const data = await anilistQuery(
    `query (${defs}) {
      Page(page: $page, perPage: ${BROWSE_PAGE_SIZE}) {
        media(${filter}) {
          id title { romaji english native } synonyms description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    variables
  );
  return data.Page.media.map(mapAniListManga);
}

async function anilistQuery(query, variables) {
  const response = await fetch(apiRequestUrl(ANILIST_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  assertOk(response);
  const payload = await response.json();
  if (payload.errors) throw new Error(payload.errors.map((error) => error.message).join(", "));
  return payload.data;
}

function assertOk(response) {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}

function mapAniList(item) {
  const apiSource = item.dataSource === "jikan" || (item.idMal && Number(item.id) === Number(item.idMal)) ? "jikan" : "anilist";
  const englishTitle = item.title.english || "";
  const romajiTitle = item.title.romaji || "";
  const nativeTitle = item.title.native || "";
  const title = englishTitle || romajiTitle || "Untitled";
  const alternativeTitles = uniqueStrings([englishTitle, ...(item.synonyms || []), romajiTitle, nativeTitle]).filter((name) => normalizeSearchText(name) !== normalizeSearchText(title));
  return {
    id: `anime-${item.id}`,
    apiId: item.id,
    apiSource,
    malId: item.idMal || "",
    anilistId: apiSource === "anilist" ? item.id : "",
    source: apiSource === "jikan" ? "Jikan" : "AniList",
    type: "anime",
    displayType: item.format || "Anime",
    title,
    englishTitle,
    romajiTitle,
    nativeTitle,
    alternativeTitles,
    description: clean(item.description) || "No synopsis available.",
    image: item.coverImage.extraLarge || item.coverImage.large || fallbackImage,
    banner: item.bannerImage || "",
    accent: item.coverImage.color || colorFromString(title || String(item.id)),
    score: item.averageScore ? `${item.averageScore}%` : "N/A",
    year: item.seasonYear || "TBA",
    total: item.episodes || 0,
    unit: "eps",
    genres: item.genres?.slice(0, 4) || [],
    format: item.format || "Anime",
    statusText: item.status || "Unknown",
    extra: [item.duration ? `${item.duration} min` : "", item.popularity ? `${item.popularity.toLocaleString()} popular` : "", item.studios?.nodes?.[0]?.name || ""].filter(Boolean),
    episodesList: item.streamingEpisodes?.map((episode, index) => ({
      title: episode.title || `Episode ${index + 1}`,
      time: episode.site || "Episode",
      image: episode.thumbnail || "",
    })) || [],
  };
}

function mapAniListManga(item) {
  const apiSource = item.dataSource === "jikan" || (item.idMal && Number(item.id) === Number(item.idMal)) ? "jikan" : "anilist";
  const englishTitle = item.title.english || "";
  const romajiTitle = item.title.romaji || "";
  const nativeTitle = item.title.native || "";
  const title = englishTitle || romajiTitle || nativeTitle || "Untitled";
  const alternativeTitles = uniqueStrings([englishTitle, ...(item.synonyms || []), romajiTitle, nativeTitle]).filter((name) => normalizeSearchText(name) !== normalizeSearchText(title));
  return {
    id: `manga-${item.id}`,
    apiId: item.id,
    apiSource,
    anilistId: apiSource === "anilist" ? item.id : "",
    source: apiSource === "jikan" ? "Jikan" : "AniList",
    type: "manga",
    displayType: item.format || "Manga",
    title,
    englishTitle,
    romajiTitle,
    nativeTitle,
    alternativeTitles,
    description: clean(item.description) || "No synopsis available.",
    image: item.coverImage.extraLarge || item.coverImage.large || fallbackImage,
    banner: item.bannerImage || "",
    accent: item.coverImage.color || colorFromString(title),
    score: item.averageScore ? `${item.averageScore}%` : "N/A",
    year: item.seasonYear || "TBA",
    total: item.chapters || 0,
    unit: "ch",
    genres: item.genres?.slice(0, 4) || [],
    format: item.format || "Manga",
    statusText: item.status || "Unknown",
    extra: [item.volumes ? `${item.volumes} volumes` : "", item.popularity ? `${item.popularity.toLocaleString()} popular` : "", item.staff?.nodes?.[0]?.name?.full || ""].filter(Boolean),
  };
}

function renderCards(container, items) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No titles found.");

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const tracked = state.library[item.id];
    const card = create("a", "card");
    setMediaDataset(card, item);
    card.addEventListener("click", () => goToDetails(item));
    card.innerHTML = `
      <div class="poster-frame">
        <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
        <div class="card-top"><span class="tag">${escapeHtml(mediaLabel(item))}</span><span class="tag score-tag">${escapeHtml(item.score)}</span></div>
      </div>
      <div class="card-body">
        <div>
          <span class="card-source">${escapeHtml(item.source)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(shortText(item.description, 105))}</p>
          <div class="meta">${metaHtml([item.year, item.total ? `${item.total} ${item.unit}` : item.format, ...(item.genres || []).slice(0, 2)])}</div>
        </div>
        <div class="card-actions">
          <span class="btn secondary details-button">View details</span>
          ${tracked ? `<span class="progress-pill">${statusLabel(tracked.status)} ${tracked.progress || 0}${item.total ? `/${item.total}` : ""}</span>` : ""}
        </div>
      </div>
    `;
    fragment.append(card);
  });
  container.append(fragment);
}

function renderBrowseCards(container, items, append = false) {
  if (!append) container.innerHTML = "";
  if (!items.length) return append ? null : renderEmpty(container, "No titles found.");

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const card = create("a", "browse-card");
    setMediaDataset(card, item);
    card.innerHTML = `
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <h3>${escapeHtml(item.title)}</h3>
      <div class="browse-meta"><span>${escapeHtml(item.year)}</span><i></i><span>${escapeHtml(item.format)}</span></div>
    `;
    fragment.append(card);
  });
  container.append(fragment);
}

function renderBrowseSpotlight(items) {
  const grid = document.querySelector("[data-grid]");
  if (!grid) return;
  let spotlight = document.querySelector("[data-browse-spotlight]");
  if (!spotlight) {
    spotlight = create("section", "browse-spotlight");
    spotlight.dataset.browseSpotlight = "";
    grid.before(spotlight);
  }

  state.browseSpotlightItems = Array.isArray(items) ? items.filter(Boolean) : [];
  state.browseSpotlightIndex = 0;
  window.clearInterval(state.browseSpotlightTimer);

  if (!state.browseSpotlightItems.length) {
    spotlight.innerHTML = "";
    spotlight.hidden = true;
    return;
  }

  spotlight.hidden = false;
  renderBrowseSpotlightSlide();
  state.browseSpotlightTimer = window.setInterval(() => shiftBrowseSpotlight(1), 4500);
}

function shiftBrowseSpotlight(delta) {
  if (!state.browseSpotlightItems.length) return;
  state.browseSpotlightIndex = (state.browseSpotlightIndex + delta + state.browseSpotlightItems.length) % state.browseSpotlightItems.length;
  renderBrowseSpotlightSlide();
}

function renderBrowseSpotlightSlide() {
  const spotlight = document.querySelector("[data-browse-spotlight]");
  const item = state.browseSpotlightItems[state.browseSpotlightIndex];
  if (!spotlight || !item) return;

  spotlight.classList.add("is-switching");
  setMediaDataset(spotlight, item);
  spotlight.innerHTML = `
    <img src="${escapeAttr(item.banner || item.image)}" alt="${escapeAttr(item.title)} artwork" loading="lazy">
    <div class="browse-spotlight-copy">
      <span>${escapeHtml(mediaLabel(item))}</span>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(shortText(item.description, 230))}</p>
      <div class="browse-spotlight-meta">
        <span>${escapeHtml(item.total ? `${item.total} ${item.unit}` : item.format)}</span>
        <span>☆ ${escapeHtml(item.score)}</span>
        <span>${escapeHtml(item.year)}</span>
      </div>
    </div>
    <button class="browse-spotlight-control prev" data-spotlight-prev type="button" aria-label="Previous featured title">‹</button>
    <button class="browse-spotlight-control next" data-spotlight-next type="button" aria-label="Next featured title">›</button>
    <span class="browse-spotlight-count">${state.browseSpotlightIndex + 1} of ${state.browseSpotlightItems.length}</span>
  `;
  spotlight.onclick = handleCardNavigation;
  spotlight.querySelector("[data-spotlight-prev]").addEventListener("click", (event) => {
    event.stopPropagation();
    shiftBrowseSpotlight(-1);
  });
  spotlight.querySelector("[data-spotlight-next]").addEventListener("click", (event) => {
    event.stopPropagation();
    shiftBrowseSpotlight(1);
  });
  window.requestAnimationFrame(() => spotlight.classList.remove("is-switching"));
}

function renderPosterRail(container, items) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No featured titles available.");

  const fragment = document.createDocumentFragment();
  const railItems = [...items, ...items, ...items];
  railItems.forEach((item, index) => {
    const card = create("a", "rail-card");
    setMediaDataset(card, item);
    card.addEventListener("click", () => goToDetails(item));
    card.innerHTML = `
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <span class="rail-score">${escapeHtml(item.score)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      ${index === items.length ? `<span class="rail-featured">Featured</span>` : ""}
    `;
    fragment.append(card);
  });
  container.append(fragment);
  setupPosterRail(container, items.length);
}

function setupPosterRail(container, originalCount) {
  window.clearInterval(container.railTimer);
  window.cancelAnimationFrame(container.railFrame);
  if (container.railCleanup) container.railCleanup();
  if (!container.querySelector(".rail-card")) return;

  const getStep = () => {
    const first = container.querySelector(".rail-card");
    const styles = window.getComputedStyle(container);
    const gap = parseFloat(styles.columnGap || styles.gap || 0);
    return first ? first.getBoundingClientRect().width + gap : 0;
  };

  const getLoopWidth = () => {
    const cards = [...container.querySelectorAll(".rail-card")];
    return cards[originalCount] ? cards[originalCount].offsetLeft - cards[0].offsetLeft : 0;
  };

  const markCentered = () => {
    const cards = [...container.querySelectorAll(".rail-card")];
    const railBox = container.getBoundingClientRect();
    const centerX = railBox.left + railBox.width / 2;
    const center = cards.reduce((closest, card) => {
      const cardBox = card.getBoundingClientRect();
      const closestBox = closest.getBoundingClientRect();
      const cardCenter = cardBox.left + cardBox.width / 2;
      const closestCenter = closestBox.left + closestBox.width / 2;
      return Math.abs(cardCenter - centerX) < Math.abs(closestCenter - centerX) ? card : closest;
    }, cards[0]);

    cards.forEach((card) => card.classList.remove("is-active"));
    center?.classList.add("is-active");
  };

  const rotate = () => {
    const step = getStep();
    if (!step) return;
    container.scrollBy({ left: step, behavior: "smooth" });
  };

  const stopAuto = () => window.clearInterval(container.railTimer);
  const startAuto = () => {
    stopAuto();
    container.railTimer = window.setInterval(rotate, 3000);
  };

  const centerInitialCard = () => {
    const cards = [...container.querySelectorAll(".rail-card")];
    const middle = cards[originalCount + Math.floor(originalCount / 2)];
    if (!middle) return;
    container.scrollLeft = middle.offsetLeft - (container.clientWidth - middle.offsetWidth) / 2;
    markCentered();
  };

  const onScroll = () => {
    window.cancelAnimationFrame(container.railFrame);
    container.railFrame = window.requestAnimationFrame(() => {
      const loopWidth = getLoopWidth();
      if (loopWidth) {
        if (container.scrollLeft >= loopWidth * 2) container.scrollLeft -= loopWidth;
        if (container.scrollLeft < loopWidth * 0.5) container.scrollLeft += loopWidth;
      }
      markCentered();
    });
  };

  let isPointerDown = false;
  let didDrag = false;
  let suppressClick = false;
  let startX = 0;
  let startScroll = 0;

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    stopAuto();
    isPointerDown = true;
    didDrag = false;
    suppressClick = false;
    startX = event.clientX;
    startScroll = container.scrollLeft;
    container.classList.add("is-grabbing");
    container.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!isPointerDown) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 4) didDrag = true;
    if (didDrag) {
      event.preventDefault();
      container.scrollLeft = startScroll - delta;
    }
  };

  const onPointerUp = (event) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    container.classList.remove("is-grabbing");
    container.releasePointerCapture?.(event.pointerId);
    if (didDrag) {
      suppressClick = true;
      window.setTimeout(() => {
        suppressClick = false;
        didDrag = false;
      }, 150);
    }
    window.clearTimeout(container.railRestartTimer);
    container.railRestartTimer = window.setTimeout(startAuto, 4500);
  };

  const onClick = (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  };

  window.requestAnimationFrame(centerInitialCard);
  startAuto();
  container.addEventListener("scroll", onScroll);
  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerup", onPointerUp);
  container.addEventListener("pointercancel", onPointerUp);
  container.addEventListener("click", onClick, true);
  container.railCleanup = () => {
    container.removeEventListener("scroll", onScroll);
    container.removeEventListener("pointerdown", onPointerDown);
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerup", onPointerUp);
    container.removeEventListener("pointercancel", onPointerUp);
    container.removeEventListener("click", onClick, true);
    window.clearTimeout(container.railRestartTimer);
  };
}

function renderLatestPage() {
  const container = document.querySelector("[data-home-latest]");
  const label = document.querySelector("[data-latest-label]");
  const prev = document.querySelector("[data-latest-prev]");
  const next = document.querySelector("[data-latest-next]");
  if (!container) return;

  const pageSize = 6;
  const maxPage = Math.max(1, Math.ceil(state.latestItems.length / pageSize));
  state.latestPage = Math.min(state.latestPage, maxPage);
  const start = (state.latestPage - 1) * pageSize;
  renderCards(container, state.latestItems.slice(start, start + pageSize));
  label.textContent = `Page ${state.latestPage} / ${maxPage}`;
  prev.disabled = state.latestPage <= 1;
  next.disabled = state.latestPage >= maxPage;
}

function renderStaticRail(container, items) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No updates available right now.");

  appendStaticRailItems(container, items);
  setupDraggableRail(container);
  setupLatestRailAutoLoad(container);
}

function createStaticRailCard(item) {
  const card = create("a", "static-rail-card");
  setMediaDataset(card, item);
  card.innerHTML = `
    <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
    <span>${escapeHtml(mediaLabel(item))}</span>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${item.type === "anime" ? "Episode" : "Chapter"} ${escapeHtml(item.total || "?")} · ${escapeHtml(item.score)}</p>
  `;
  card.addEventListener("click", (event) => {
    event.stopPropagation();
    goToDetails(item);
  });
  return card;
}

function appendStaticRailItems(container, items) {
  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.append(createStaticRailCard(item)));
  container.append(fragment);
}

async function loadHomeUpdateRail(id, direction) {
  const rail = document.getElementById(id);
  if (!rail) return;

  if (direction === "prev") {
    rail.scrollBy({ left: -Math.round(rail.clientWidth * 0.82), behavior: "smooth" });
    return;
  }

  const isMangaRail = id.includes("manga");
  const pageKey = isMangaRail ? "latestMangaPage" : "latestAnimePage";
  const itemsKey = isMangaRail ? "latestMangaItems" : "latestAnimeItems";
  const nextPage = state[pageKey] + 1;
  const previousItems = [...state[itemsKey]];
  if (rail.dataset.loadingMore === "true") return;

  rail.dataset.loadingMore = "true";
  state[pageKey] = nextPage;
  const loader = create("div", "rail-loading rail-loading-inline");
  loader.setAttribute("aria-label", "Loading more updates");
  rail.append(loader);

  try {
    const items = isMangaRail ? await fetchMangaLatest(nextPage) : await fetchAnimeLatest(nextPage);
    const existingIds = new Set(state[itemsKey].map((item) => item.id));
    const freshItems = items.filter((item) => !existingIds.has(item.id));
    loader.remove();
    state[itemsKey] = mergeItems([...state[itemsKey], ...items]);
    if (freshItems.length) appendStaticRailItems(rail, freshItems);
    setupLatestRailAutoLoad(rail);
    state.currentItems = mergeItems([...state.currentItems, ...items]);
  } catch (error) {
    state[pageKey] = Math.max(1, state[pageKey] - 1);
    loader.remove();
    renderStaticRail(rail, previousItems);
    showToast("Could not load the next update page. Try again in a moment.");
  } finally {
    rail.dataset.loadingMore = "false";
  }
}

function setupDraggableRail(container) {
  if (container.dragCleanup) container.dragCleanup();

  let isPointerDown = false;
  let didDrag = false;
  let suppressClick = false;
  let startX = 0;
  let startScroll = 0;

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    isPointerDown = true;
    didDrag = false;
    suppressClick = false;
    startX = event.clientX;
    startScroll = container.scrollLeft;
    container.classList.add("is-grabbing");
    container.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!isPointerDown) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 4) didDrag = true;
    if (didDrag) {
      event.preventDefault();
      container.scrollLeft = startScroll - delta;
    }
  };

  const onPointerUp = (event) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    container.classList.remove("is-grabbing");
    container.releasePointerCapture?.(event.pointerId);
    if (!didDrag) return;
    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
      didDrag = false;
    }, 150);
  };

  const onClick = (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const onScroll = () => {
    if (!container.id?.startsWith("home-latest-")) return;
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 260) {
      loadHomeUpdateRail(container.id, "next");
    }
  };

  const onDragStart = (event) => event.preventDefault();

  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerup", onPointerUp);
  container.addEventListener("pointercancel", onPointerUp);
  container.addEventListener("click", onClick, true);
  container.addEventListener("scroll", onScroll);
  container.addEventListener("dragstart", onDragStart);
  container.dragCleanup = () => {
    container.removeEventListener("pointerdown", onPointerDown);
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerup", onPointerUp);
    container.removeEventListener("pointercancel", onPointerUp);
    container.removeEventListener("click", onClick, true);
    container.removeEventListener("scroll", onScroll);
    container.removeEventListener("dragstart", onDragStart);
  };
}

function setupLatestRailAutoLoad(container) {
  if (!container.id?.startsWith("home-latest-")) return;
  if (container.latestObserver) container.latestObserver.disconnect();

  const lastCard = container.querySelector(".static-rail-card:last-child");
  if (!lastCard) return;

  container.latestObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadHomeUpdateRail(container.id, "next");
  }, { root: container, rootMargin: "0px 360px 0px 0px" });
  container.latestObserver.observe(lastCard);
}

function handleCardNavigation(event) {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  const item = state.currentItems.find((entry) => entry.id === card.dataset.id) || itemFromDataset(card);
  goToDetails(item);
}

function handleHomePointerDown(event) {
  const card = event.target.closest("[data-id][data-type][data-api-id]");
  if (!card || event.target.closest("[data-rail-control], input, select, textarea")) {
    state.homePointerStart = null;
    return;
  }

  const movingRail = card.closest("[data-home-featured]");
  if (movingRail?.railTimer) window.clearInterval(movingRail.railTimer);

  state.homePointerStart = {
    card,
    id: card.dataset.id,
    x: event.clientX,
    y: event.clientY,
  };
}

function handleHomePointerNavigation(event) {
  const start = state.homePointerStart;
  state.homePointerStart = null;
  if (!start) return;

  if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  const item = state.currentItems.find((entry) => entry.id === start.id) || itemFromDataset(start.card);
  goToDetails(item);
}

function setMediaDataset(element, item) {
  element.dataset.id = item.id;
  element.dataset.type = item.type;
  element.dataset.apiId = item.apiId || item.id.split("-").pop();
  element.dataset.title = item.title || "";
  element.dataset.image = item.image || "";
  if (element.tagName === "A") element.href = detailUrl(item);
}

function itemFromDataset(element) {
  if (!element?.dataset.type || !element?.dataset.apiId) return null;
  return {
    id: element.dataset.id || `${element.dataset.type}-${element.dataset.apiId}`,
    apiId: element.dataset.apiId,
    type: element.dataset.type,
    title: element.dataset.title || "Selected title",
    image: element.dataset.image || fallbackImage,
  };
}

function renderSearchResults(container, items) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No results found.");

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const row = create("a", "search-result");
    setMediaDataset(row, item);
    row.innerHTML = `
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <div class="search-copy"><span class="card-source">${escapeHtml(item.source)}</span><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(shortText(item.description, 135))}</p><div class="meta">${metaHtml([mediaLabel(item), item.year, item.score])}</div></div>
      <span class="search-action">View</span>
    `;
    row.addEventListener("click", () => goToDetails(item));
    fragment.append(row);
  });
  container.append(fragment);
}

function renderUpdateList(container, items) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No updates available right now.");

  const fragment = document.createDocumentFragment();
  items.forEach((item, index) => {
    const row = create("a", "update-item");
    setMediaDataset(row, item);
    row.innerHTML = `
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <div class="chapter-stack"><span>${item.type === "anime" ? "Episode" : "Chapter"} ${item.total || index + 1}</span><small>${item.year} · ${escapeHtml(item.format)}</small></div>
      </div>
      <strong>${escapeHtml(item.score)}</strong>
    `;
    fragment.append(row);
  });
  container.append(fragment);
}

function renderRankingList(container, items, startIndex = 0) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No ranking data available right now.");

  const fragment = document.createDocumentFragment();
  items.forEach((item, index) => {
    const row = create("a", "ranking-item");
    setMediaDataset(row, item);
    row.addEventListener("click", () => goToDetails(item));
    row.innerHTML = `
      <span class="rank-number">${startIndex + index + 1}</span>
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml((item.genres || []).slice(0, 3).join(", ") || item.format)}</p></div>
      <strong>${escapeHtml(item.score)}</strong>
    `;
    fragment.append(row);
  });
  container.append(fragment);
}

function renderEditorPick(container, item) {
  container.innerHTML = "";
  if (!item) return;
  const card = create("a", "editor-card");
  setMediaDataset(card, item);
  card.addEventListener("click", () => goToDetails(item));
  card.innerHTML = `
    <img src="${escapeAttr(item.banner || item.image)}" alt="${escapeAttr(item.title)} artwork" loading="lazy">
    <div><span>Editor's Pick</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(shortText(item.description, 110))}</p></div>
  `;
  container.append(card);
}

function renderLibrary() {
  const animeList = document.querySelector('[data-library-list="anime"]');
  const mangaList = document.querySelector('[data-library-list="manga"]');
  const animeGroup = document.querySelector('[data-library-group="anime"]');
  const mangaGroup = document.querySelector('[data-library-group="manga"]');
  if (!animeList || !mangaList) return;

  const allItems = Object.values(state.library).sort((a, b) => b.updatedAt - a.updatedAt);
  const statusItems = state.filter === "all" ? allItems : allItems.filter((item) => item.status === state.filter);
  const items = statusItems.filter((item) => {
    if (state.libraryAdultFilter === "adult") return isAdultLibraryItem(item);
    if (state.libraryAdultFilter === "normal") return !isAdultLibraryItem(item);
    return true;
  });
  const animeItems = items.filter((item) => item.type === "anime");
  const mangaItems = items.filter((item) => item.type === "manga");

  document.querySelectorAll("[data-library-type]").forEach((item) => item.classList.toggle("active", item.dataset.libraryType === state.libraryType));
  animeGroup.hidden = state.libraryType === "manga";
  mangaGroup.hidden = state.libraryType === "anime";

  renderLibraryGroup(animeList, animeItems, allItems.length ? "No anime match this filter." : "No anime tracked yet. Add titles from the Anime page.");
  renderLibraryGroup(mangaList, mangaItems, allItems.length ? "No manga match this filter." : "No manga tracked yet. Add titles from the Manga page.");
  setText("[data-anime-count]", `${animeItems.length} ${animeItems.length === 1 ? "title" : "titles"}`);
  setText("[data-manga-count]", `${mangaItems.length} ${mangaItems.length === 1 ? "title" : "titles"}`);
  setText("[data-library-summary]", `${allItems.filter((item) => item.type === "anime").length} anime / ${allItems.filter((item) => item.type === "manga").length} manga saved locally`);
  setText("[data-library-total-count]", String(allItems.length));
  setText("[data-library-adult-count]", String(allItems.filter(isAdultLibraryItem).length));
  setText("[data-library-normal-count]", String(allItems.filter((item) => !isAdultLibraryItem(item)).length));

  updateStats();
}

function isAdultLibraryItem(item) {
  return Boolean(item?.isAdult)
    || /doujinshi|adult|hentai|pornhwa/i.test(`${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")}`)
    || isAdultMangaProvider(item?.provider)
    || isAdultMangaProvider(String(item?.providerId || item?.apiId || "").split(":")[0]);
}

function isDoujinLibraryItem(item) {
  return /doujinshi/i.test(`${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")}`)
    || DOUJIN_SOURCES.some((source) => String(item?.apiId || item?.providerId || "").startsWith(`${source.id}:`));
}

function renderLibraryGroup(container, items, emptyMessage) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, emptyMessage);

  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.append(renderLibraryItem(item)));
  container.append(fragment);
}

function renderLibraryItem(item) {
  const total = item.total || 0;
  const percent = total ? Math.min(100, Math.round(((item.progress || 0) / total) * 100)) : 0;
  const progressText = `${item.progress || 0}${total ? ` / ${total}` : ""} ${item.unit}`;
  const row = create("a", `library-item ${isAdultLibraryItem(item) ? "adult" : "normal"}`);
  setMediaDataset(row, item);
  row.innerHTML = `
    <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
    <div>
      <h3>${escapeHtml(item.title)}</h3>
      <div class="meta">${metaHtml([statusLabel(item.status), mediaLabel(item), isAdultLibraryItem(item) ? "18+" : "Normal", progressText, item.rating !== "" ? `Rated ${item.rating}/10` : "Unrated"])}</div>
      <div class="progress-bar"><span style="width:${percent}%"></span></div>
    </div>
    <div class="library-side"><strong>${percent}%</strong><div class="muted">${escapeHtml(statusLabel(item.status))}</div></div>
  `;
  return row;
}

function renderDetails(root, item, isTemporary = false) {
  const tracked = state.library[item.id];
  const active = { ...item, ...tracked };
  const progress = Number(active.progress || 0);
  const total = Number(active.total || 0);
  const progressPercent = total ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  const accent = normalizeColor(state.settings.themeColor || active.accent || colorFromString(active.title));
  const accentRgb = hexToRgb(accent);
  const chapters = active.type === "manga" ? buildChapterRows(active) : [];
  const countLabel = active.total ? `${active.total} ${active.type === "anime" ? "episodes" : "chapters"}` : active.type === "anime" ? "Episodes TBA" : "Chapters TBA";
  const audience = (active.extra || []).find((value) => /popular|members/i.test(value)) || "Library ready";
  const backdrop = active.banner || "";
  state.current = active;
  document.title = `AniTrack | ${active.title}`;

  root.innerHTML = `
    <section class="detail-pro" style="--detail-bg: ${backdrop ? `url('${escapeAttr(backdrop)}')` : "none"}; --detail-accent: ${accent}; --detail-accent-rgb: ${accentRgb};">
      <div class="detail-backdrop">
        ${backdrop ? `<img src="${escapeAttr(backdrop)}" alt="${escapeAttr(active.title)} backdrop">` : ""}
      </div>
      <div class="detail-pro-top">
        <aside class="detail-cover-stack">
          <img class="detail-pro-cover" src="${escapeAttr(active.image)}" alt="${escapeAttr(active.title)} poster">
        </aside>
        <main class="detail-pro-main">
          <div class="detail-title-block">
            <span class="detail-source">${escapeHtml(mediaLabel(active))}${isTemporary ? " / saved copy" : ""}</span>
            <h1>${escapeHtml(active.title)} <span class="detail-api-badge">${escapeHtml(active.source || (active.apiSource === "jikan" ? "Jikan" : "AniList"))}</span></h1>
            ${active.nativeTitle ? `<p class="detail-native">${escapeHtml(active.nativeTitle)}</p>` : ""}
          </div>
          <div class="detail-meta-line">
            <span>${escapeHtml(active.format || mediaLabel(active))}</span>
            <span>${escapeHtml(countLabel)}</span>
            <span>${escapeHtml(active.statusText)}</span>
            <span>${escapeHtml(active.year)}</span>
            <span>☆ ${escapeHtml(active.score)}</span>
            <span>${escapeHtml(audience)}</span>
          </div>
          <div class="detail-genre-line">${(active.genres || []).map((genre) => `<span>${escapeHtml(genre)}</span>`).join("")}</div>
          <div class="detail-description"><p>${escapeHtml(active.description)}</p></div>
          <section class="detail-library-inline" aria-label="Library controls">
            ${active.type === "anime" ? `<button class="btn" data-watch-button type="button" style="background: linear-gradient(135deg, var(--blue), var(--mint)); color: #06101a;">▶ Watch Now</button>` : ""}
            ${active.type === "manga" ? `<button class="btn" data-read-button type="button" style="background: linear-gradient(135deg, var(--mint), var(--blue)); color: #06101a;">Read Now</button>` : ""}
            <div class="detail-library-popover-wrap">
              <button class="btn detail-library-toggle" data-library-editor-toggle type="button" aria-expanded="false">${tracked ? "Edit Library" : "Add to Library"}</button>
              <div class="detail-library-popover" data-library-editor hidden>
                <div class="detail-tracker-head">
                  <div>
                    <span class="detail-source">Library</span>
                    <strong>${tracked ? "Saved to your library" : "Add tracking details"}</strong>
                  </div>
                  <div class="detail-progress-ring"><span>${progressPercent}%</span></div>
                </div>
                <div class="detail-track-grid">
                  <label>Status <select data-track-status>${statusOptions(active.type)}</select></label>
                  <label>Progress <div class="detail-progress-control"><button data-minus-progress type="button">−</button><input data-track-progress type="number" min="0" ${total ? `max="${escapeAttr(total)}"` : ""} step="1" value="${Number(active.progress || 0)}" aria-label="Progress"><span>/ ${escapeHtml(total || "?")}</span><button data-plus-progress type="button">+</button></div></label>
                  <label>Rating <input data-track-rating class="detail-rating" type="number" min="0" max="10" step="0.5" value="${escapeAttr(active.rating ?? "")}" placeholder="0-10" aria-label="Rating out of 10"></label>
                </div>
                <textarea data-track-notes class="detail-notes" placeholder="Private notes...">${escapeHtml(active.notes || "")}</textarea>
                <div class="details-progress-card detail-progress-card">
                  <div><span class="muted">Your progress</span><strong>${progress}${total ? ` / ${total}` : ""} ${escapeHtml(active.unit)}</strong></div>
                  <div class="progress-bar"><span style="width:${progressPercent}%"></span></div>
                </div>
                <div class="detail-primary-actions">
                  <button class="btn detail-save" data-save-track type="button">Confirm</button>
                  <button class="detail-remove" data-remove-track type="button" ${tracked ? "" : "hidden"}>Remove</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      ${active.type === "anime" ? `<section class="detail-episodes detail-anime-episodes">
          <div class="detail-episode-head">
            <h2>Episodes</h2>
            <label class="detail-source-picker">Source <select data-detail-anime-source><option>Loading sources...</option></select></label>
            <span data-detail-anime-source-count>Loading episodes...</span>
            <label>Find source as <input data-detail-anime-query type="search" placeholder="Custom source title" autocomplete="off"></label>
          </div>
          <div class="detail-list-filter">All matching source episodes and entries</div>
          <div class="chapter-list detail-chapter-list detail-anime-episode-list" data-detail-anime-episode-list><div class="empty">Choose a source to load real episodes.</div></div>
        </section>` : ""}
      ${active.type === "manga" ? `<section class="detail-episodes">
          <div class="detail-episode-head">
            <h2>Chapters</h2>
          <label class="detail-source-picker">Source <select data-detail-manga-source><option>Loading sources...</option></select></label>
          <span data-detail-manga-source-count>Loading chapters...</span>
          <button type="button">Hide Watched Chapters</button>
          <span>${chapters.length ? "1" : "0"} / 1</span>
          <label>⌕ <input type="search" placeholder="Manually search for manga..." aria-label="Filter chapters"></label>
        </div>
        <form class="detail-source-search" data-detail-source-search>
          <label>Find source as <input data-detail-source-query type="search" placeholder="Custom site title, e.g. Reveries of the Moonlight" autocomplete="off"></label>
          <button class="btn secondary" type="submit">Add Source</button>
          <span data-detail-source-search-status></span>
        </form>
        <div class="detail-list-filter">All ⌕ <span>|</span> ${escapeHtml(active.title)}</div>
        <div class="detail-chapter-list detail-manga-card-grid" data-detail-chapter-list>${chapters.map((chapter, index) => detailMangaChapterCardHtml(chapter, active, index)).join("")}</div>
      </section>` : ""}
    </section>
  `;

  root.querySelector("[data-track-status]").value = active.status || (active.type === "anime" ? "watching" : "reading");
  const editorToggle = root.querySelector("[data-library-editor-toggle]");
  const editorPanel = root.querySelector("[data-library-editor]");
  editorToggle?.addEventListener("click", () => {
    const isHidden = editorPanel.hidden;
    editorPanel.hidden = !isHidden;
    editorToggle.setAttribute("aria-expanded", String(isHidden));
  });
  root.querySelector("[data-save-track]").addEventListener("click", () => saveCurrent());
  root.querySelector("[data-watch-button]")?.addEventListener("click", () => {
    const selectedEpisode = root.querySelector("[data-detail-watch-episode]");
    if (selectedEpisode) {
      selectedEpisode.click();
      return;
    }
    openPlayerForAnime(active, buildEpisodes(active)[0] || null, "anilist");
  });
  root.querySelector("[data-read-button]")?.addEventListener("click", () => {
    sessionStorage.setItem("reader-manga", JSON.stringify(active));
    window.location.href = `manga-reader.html?type=${active.type}&id=${active.apiId}`;
  });
  if (active.type === "anime") initAnimeDetailSources(root, active);
  if (active.type === "manga") initMangaDetailSources(root, active);
  root.querySelector("[data-minus-progress]").addEventListener("click", () => {
    const progress = root.querySelector("[data-track-progress]");
    progress.value = clampProgressValue(Number(progress.value || 0) - 1, state.current);
    saveCurrent(true);
  });
  root.querySelectorAll("[data-plus-progress]").forEach((button) => button.addEventListener("click", () => {
    const progress = root.querySelector("[data-track-progress]");
    progress.value = clampProgressValue(Number(progress.value || 0) + 1, state.current);
    saveCurrent(true);
  }));
  root.querySelector("[data-remove-track]").addEventListener("click", removeCurrent);
}

function renderDetailsError(root, message) {
  root.innerHTML = `<div class="details-loading panel"><h2>Details unavailable</h2><p class="muted">${escapeHtml(message)}</p><a class="btn" href="anime.html">Browse Anime</a></div>`;
}

function mergeFreshDetail(freshItem, trackedItem) {
  if (!trackedItem) return freshItem;
  return {
    ...trackedItem,
    ...freshItem,
    status: trackedItem.status || freshItem.status,
    progress: trackedItem.progress ?? 0,
    rating: trackedItem.rating ?? "",
    notes: trackedItem.notes ?? "",
    updatedAt: trackedItem.updatedAt || freshItem.updatedAt,
  };
}

async function initMangaDetailSources(root, manga) {
  const sourceSelect = root.querySelector("[data-detail-manga-source]");
  const sourceCount = root.querySelector("[data-detail-manga-source-count]");
  const chapterList = root.querySelector("[data-detail-chapter-list]");
  const sourceSearchForm = root.querySelector("[data-detail-source-search]");
  const sourceSearchInput = root.querySelector("[data-detail-source-query]");
  const sourceSearchStatus = root.querySelector("[data-detail-source-search-status]");
  if (!sourceSelect || !sourceCount || !chapterList) return;

  try {
    const enabledProviders = enabledMangaProviderIds();
    const sourceResults = enabledProviders.map((provider) => ({
      optionId: provider,
      provider,
      title: providerLabel(provider),
      chapters: null,
      chapterCount: 0,
      searched: false,
    }));
    const savedSource = localStorage.getItem(mangaSourceKey(manga));
    if (sourceSearchInput) sourceSearchInput.value = localStorage.getItem(mangaSourceCustomQueryKey(manga)) || "";

    const renderOptions = () => {
      if (!sourceResults.length) {
        sourceSelect.innerHTML = '<option value="">No sources</option>';
        sourceSelect.disabled = true;
        return;
      }
      sourceSelect.disabled = false;
      sourceSelect.innerHTML = sourceResults.map((item) => {
        const count = Array.isArray(item.chapters) ? item.chapters.length : item.chapterCount || null;
        const label = item.id ? mangaSourceOptionLabel(item, count) : `${providerLabel(item.provider)}: ${item.searched ? "No match" : "Search on select"}`;
        return `<option value="${escapeAttr(item.optionId)}">${escapeHtml(label)}</option>`;
      }).join("");
    };

    const resolveSource = async (source, customTitle = "") => {
      if (source.id && !customTitle) return source;
      if (customTitle) {
        source.id = "";
        source.chapters = null;
        source.chapterCount = 0;
      }
      const match = await searchMangaProviderMatch(manga, source.provider, customTitle);
      source.searched = true;
      if (!match) {
        source.chapters = [];
        source.chapterCount = 0;
        return source;
      }
      Object.assign(source, sourceResultWithCache(match, manga), { optionId: source.provider, searched: true });
      return source;
    };

    const renderSource = async () => {
      const source = sourceResults.find((item) => item.optionId === sourceSelect.value) || sourceResults[0];
      if (!source) {
        renderOptions();
        sourceCount.textContent = "0 chapters";
        chapterList.innerHTML = '<div class="empty">No enabled manga sources. Enable sources in Settings.</div>';
        return;
      }
      localStorage.setItem(`${mangaSourceKey(manga)}:provider`, source.provider);
      renderOptions();
      sourceSelect.value = source.optionId;

      if (!source.id && !source.searched) {
        sourceCount.textContent = `Searching ${providerLabel(source.provider)}...`;
        chapterList.innerHTML = `<div class="empty">Looking for this manga on ${escapeHtml(providerLabel(source.provider))} using AniList titles and synonyms...</div>`;
        await resolveSource(source, sourceSearchInput?.value.trim() || "");
        renderOptions();
        sourceSelect.value = source.optionId;
      }

      if (!source.id) {
        sourceCount.textContent = "0 chapters";
        chapterList.innerHTML = `<div class="empty">No match found on ${escapeHtml(providerLabel(source.provider))}. Try a custom source title above.</div>`;
        return;
      }

      localStorage.setItem(mangaSourceKey(manga), source.id);

      if (!Array.isArray(source.chapters)) {
        sourceCount.textContent = source.chapterCount ? `${source.chapterCount} chapters / loading list...` : "Loading chapters...";
        chapterList.innerHTML = '<div class="empty">Loading chapters from this source...</div>';
        try {
          source.chapters = await fetchMangaChaptersCached(source, manga);
        } catch (error) {
          source.chapters = [];
        }
        source.chapterCount = source.chapters.length;
        renderOptions();
        sourceSelect.value = source.optionId;
      }

      sourceCount.textContent = `${source.chapters.length} chapter${source.chapters.length === 1 ? "" : "s"}`;
      renderMangaDetailChapterList(chapterList, manga, source);
    };

    sourceSelect.addEventListener("change", renderSource);
    sourceSearchForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const query = sourceSearchInput?.value.trim() || "";
      if (!query) return showToast("Type the title used by the source site.");
      localStorage.setItem(mangaSourceCustomQueryKey(manga), query);
      if (sourceSearchStatus) sourceSearchStatus.textContent = `Searching ${providerLabel(sourceSelect.value)}...`;
      try {
        const source = sourceResults.find((item) => item.optionId === sourceSelect.value) || sourceResults[0];
        if (!source) return;
        await resolveSource(source, query);
        renderOptions();
        sourceSelect.value = source.optionId;
        if (sourceSearchStatus) sourceSearchStatus.textContent = source.id ? `Found on ${providerLabel(source.provider)}` : "No match found";
        await renderSource();
      } catch (error) {
        if (sourceSearchStatus) sourceSearchStatus.textContent = "Search failed";
      }
    });
    renderOptions();
    const savedProvider = localStorage.getItem(`${mangaSourceKey(manga)}:provider`) || firstProviderFromSourceId(savedSource);
    if (savedProvider && sourceResults.some((source) => source.optionId === savedProvider)) sourceSelect.value = savedProvider;
    await renderSource();
  } catch (error) {
    sourceSelect.innerHTML = '<option value="">Source unavailable</option>';
    sourceCount.textContent = "Could not load chapters";
  }
}

async function initAnimeDetailSources(root, anime) {
  const sourceSelect = root.querySelector("[data-detail-anime-source]");
  const sourceCount = root.querySelector("[data-detail-anime-source-count]");
  const episodeList = root.querySelector("[data-detail-anime-episode-list]");
  const sourceQuery = root.querySelector("[data-detail-anime-query]");
  if (!sourceSelect || !sourceCount || !episodeList) return;

  const sources = [];
  if (animeSourceEnabled("animedex")) sources.push({ id: "animedex", name: "AnimeDex" });
  if (animeSourceEnabled("anizone")) sources.push({ id: "anizone", name: "AniZone" });
  if (animeSourceEnabled("anilibria")) sources.push({ id: "anilibria", name: "AniLibria" });
  if (animeSourceEnabled("tokyoinsider")) sources.push({ id: "tokyoinsider", name: "TokyoInsider" });
  if (animeSourceEnabled("hstream") && state.settings.allowAdult) sources.push({ id: "hstream", name: "hstream.moe" });

  const savedSource = localStorage.getItem(animeSourceKey(anime)) || "";
  const customTitle = localStorage.getItem(animeSourceCustomQueryKey(anime)) || "";
  if (sourceQuery) sourceQuery.value = customTitle;

  sourceSelect.innerHTML = sources.length ? sources.map((source) => `<option value="${escapeAttr(source.id)}">${escapeHtml(source.name)}</option>`).join("") : '<option value="">No enabled sources</option>';
  if (sources.some((source) => source.id === savedSource)) sourceSelect.value = savedSource;

  const sourceStates = new Map(sources.map((source) => [source.id, { ...source, status: "idle", episodes: [], matches: [], activeSourceId: source.id, activeLabel: source.name }]));

  const renderOptions = () => {
    if (!sources.length) {
      sourceSelect.innerHTML = '<option value="">No enabled sources</option>';
      sourceSelect.disabled = true;
      return;
    }
    sourceSelect.disabled = false;
    const selected = sourceSelect.value;
    sourceSelect.innerHTML = sources.map((source) => {
      const state = sourceStates.get(source.id);
      const suffix = state?.status === "loading" ? " - loading" : state?.status === "loaded" ? ` - ${state.episodes.length}` : state?.status === "empty" ? " - none" : state?.status === "error" ? " - failed" : "";
      return `<option value="${escapeAttr(source.id)}">${escapeHtml(source.name + suffix)}</option>`;
    }).join("");
    if (sources.some((source) => source.id === selected)) sourceSelect.value = selected;
  };

  const renderSelectedSource = () => {
    const sourceId = sourceSelect.value || sources[0]?.id || "";
    const state = sourceStates.get(sourceId);
    localStorage.setItem(animeSourceKey(anime), sourceId);
    if (!state) {
      sourceCount.textContent = "No anime sources enabled";
      episodeList.innerHTML = '<div class="empty">Enable AnimeDex or AniZone in Settings to load real episodes.</div>';
      return;
    }

    if (state.status === "loaded" && state.episodes.length) {
      const fallback = state.activeSourceId !== sourceId ? " (fallback)" : "";
      sourceCount.textContent = `${state.episodes.length} ${state.activeLabel} episode${state.episodes.length === 1 ? "" : "s"}${fallback}`;
      renderAnimeDetailEpisodeList(episodeList, { ...anime, providerMatch: state.match }, state.activeSourceId, state.episodes, state.matches);
      return;
    }

    if (state.status === "loading") {
      sourceCount.textContent = `Loading ${state.name}...`;
      episodeList.innerHTML = `<div class="empty">Fetching ${escapeHtml(state.name)} episodes in the background...</div>`;
      return;
    }

    if (state.status === "error") {
      sourceCount.textContent = "Source unavailable";
      episodeList.innerHTML = `<div class="empty">${escapeHtml(state.name)} could not load right now. Try another source or a custom title.</div>`;
      return;
    }

    if (state.status === "empty") {
      sourceCount.textContent = "0 episodes";
      episodeList.innerHTML = `<div class="empty">No ${escapeHtml(state.name)} episodes found. Try a custom source title above or another source.</div>`;
      return;
    }

    sourceCount.textContent = `Queued ${state.name}`;
    episodeList.innerHTML = `<div class="empty">${escapeHtml(state.name)} is queued for loading...</div>`;
  };

  const resolveSource = async (source) => {
    if (!source) return null;
    const state = sourceStates.get(source.id);
    if (!state || state.status === "loading" || state.status === "loaded") return state;
    state.status = "loading";
    renderOptions();
    if (sourceSelect.value === source.id) renderSelectedSource();

    try {
      if (source.id === "hstream") {
        state.matches = await searchAdultAnime({ ...anime, sourceQuery: sourceQuery?.value.trim() || "" });
        state.episodes = hstreamMatchesToEpisodes(state.matches);
        state.activeLabel = "hstream";
      } else if (["animedex", "anizone", "anilibria", "tokyoinsider"].includes(source.id)) {
        let activeSourceId = source.id;
        let match = await searchAnimeProviderMatch(anime, source.id, sourceQuery?.value.trim() || "");
        if (!match && source.id === "animedex" && animeSourceEnabled("anizone")) {
          activeSourceId = "anizone";
          match = await searchAnimeProviderMatch(anime, "anizone", sourceQuery?.value.trim() || "");
        }
        if (match) {
          state.match = match;
          state.activeSourceId = activeSourceId;
          state.activeLabel = animeSourceLabel(activeSourceId);
          state.episodes = await fetchAnimeProviderEpisodes(match);
        }
      } else {
        state.episodes = [];
      }
      state.status = state.episodes.length ? "loaded" : "empty";
    } catch (error) {
      state.status = "error";
      state.episodes = [];
    }

    renderOptions();
    if (sourceSelect.value === source.id) renderSelectedSource();
    return state;
  };

  const prefetchSources = () => sources.forEach((source) => resolveSource(source));
  const preferredSource = preferredAnimeDetailSource(sources, savedSource);
  sourceSelect.value = preferredSource;

  sourceSelect.addEventListener("change", () => {
    renderSelectedSource();
    resolveSource(sources.find((source) => source.id === sourceSelect.value));
  });
  sourceQuery?.addEventListener("change", () => {
    localStorage.setItem(animeSourceCustomQueryKey(anime), sourceQuery.value.trim());
    sourceStates.forEach((state) => {
      state.status = "idle";
      state.episodes = [];
      state.matches = [];
      state.match = null;
      state.activeSourceId = state.id;
      state.activeLabel = state.name;
    });
    renderOptions();
    renderSelectedSource();
    prefetchSources();
  });

  renderOptions();
  sourceSelect.value = preferredSource;
  renderSelectedSource();
  prefetchSources();
}

function hstreamMatchesToEpisodes(matches) {
  return matches.map((match, index) => ({
    number: extractEpisodeNumberFromText(match.title) || index + 1,
    title: match.title || `hstream match ${index + 1}`,
    airDate: match.quality || "hstream.moe",
    image: match.image || fallbackImage,
    description: "Direct browser-playable hstream source.",
    source: "hstream",
    sourceUrl: match.url,
    sourceMatch: match,
  }));
}

async function searchAnimeProviderMatch(anime, provider, customTitle = "") {
  const titles = customTitle ? uniqueStrings([customTitle, ...animeTitleCandidates(anime)]) : animeTitleCandidates(anime);
  const endpoint = provider === "animedex" ? "animedex" : provider === "tokyoinsider" ? "tokyoinsider" : provider === "anilibria" ? "anilibria" : "anizone";
  const results = await Promise.allSettled(titles.map((title, searchIndex) =>
    fetchApiJson(`/api/anime/${endpoint}/search?title=${encodeURIComponent(title)}`)
      .then((matches) => matches.map((match) => ({ ...match, searchTitle: title, searchIndex })))
  ));
  const matches = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  return matches
    .map((match) => {
      const providerScore = Number(match.score) || 0;
      const matchScore = sourceTitleScore(titles, match.title);
      const sequencePenalty = animeSequenceMismatchPenalty(anime, titles, match);
      const identityBoost = animeProviderIdentityMatches(anime, match) ? 0.35 : 0;
      return { ...match, providerScore, matchScore, sequencePenalty, score: Math.max(providerScore, matchScore) + identityBoost - sequencePenalty };
    })
    .filter((match) => match.score >= 0.2 && (match.matchScore >= 0.15 || match.providerScore >= 0.2))
    .sort((a, b) => (b.score - a.score) || (b.matchScore - a.matchScore) || (b.providerScore - a.providerScore) || ((a.searchIndex || 0) - (b.searchIndex || 0)))[0] || null;
}

function animeProviderIdentityMatches(anime, match) {
  const animeIds = [anime?.apiId, anime?.id].map((id) => String(id || "")).filter(Boolean);
  return Boolean(match?.anilistId && animeIds.includes(String(match.anilistId)));
}

function animeSequenceMismatchPenalty(anime, titles, match) {
  if (animeProviderIdentityMatches(anime, match)) return 0;
  const requested = bestAnimeSequenceInfo([...titles, anime?.title, anime?.englishTitle, anime?.romajiTitle]);
  if (!requested?.number || requested.number <= 1) return 0;
  const candidate = bestAnimeSequenceInfo([match?.title, match?.nativeTitle]);
  if (!candidate?.number) return 0.9;
  return candidate.number === requested.number ? 0 : 0.9;
}

function bestAnimeSequenceInfo(titles) {
  return titles.reduce((best, title) => {
    const info = animeSequenceInfo(title);
    return (info?.number || 0) > (best?.number || 0) ? info : best;
  }, null);
}

function animeSequenceInfo(title) {
  const value = normalizeSearchText(title);
  if (!value) return null;
  const wordNumber = { second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6 };
  const patterns = [
    /\b(?:season|part|cour)\s*(\d+)\b/,
    /\b(\d+)\s*(?:st|nd|rd|th)?\s*(?:season|part|cour)\b/,
    /\bs\s*(\d+)\b/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(value);
    if (match) return { number: Number(match[1]) };
  }
  for (const [word, number] of Object.entries(wordNumber)) {
    if (new RegExp(`\\b${word}\\s+(?:season|part|cour)\\b`).test(value)) return { number };
  }
  return null;
}

async function fetchAnimeProviderEpisodes(match) {
  if (match.provider === "animedex") {
    const episodes = await fetchApiJson(`/api/anime/animedex/episodes?animeId=${encodeURIComponent(match.id)}&anilistId=${encodeURIComponent(match.anilistId || "")}`);
    return episodes.map((episode) => animeProviderEpisodeRow(episode, match));
  }
  if (match.provider === "anizone") {
    const episodes = await fetchApiJson(`/api/anime/anizone/episodes?animeId=${encodeURIComponent(match.id)}`);
    return episodes.map((episode) => animeProviderEpisodeRow(episode, match));
  }
  if (match.provider === "anilibria") {
    const episodes = await fetchApiJson(`/api/anime/anilibria/episodes?animeId=${encodeURIComponent(match.id)}`);
    return episodes.map((episode) => animeProviderEpisodeRow(episode, match));
  }
  if (match.provider === "tokyoinsider") {
    const episodes = await fetchApiJson(`/api/anime/tokyoinsider/episodes?animeId=${encodeURIComponent(match.id)}`);
    return episodes.map((episode) => animeProviderEpisodeRow(episode, match));
  }
  return [];
}

function animeProviderEpisodeRow(episode, match) {
  return {
    number: episode.number || extractEpisodeNumberFromText(episode.title) || "",
    title: episode.title || `Episode ${episode.number || "?"}`,
    airDate: episode.date || episode.airDate || episode.audio || match.provider,
    image: episode.image || match.image || fallbackImage,
    description: episode.description || `${providerLabel(match.provider)} episode source.`,
    source: match.provider,
    providerId: match.id,
    providerTitle: match.title,
    episodeId: episode.id,
    episodeUrl: episode.url,
    audio: episode.audio || "",
  };
}

function renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches = [], pageNumber = 1) {
  if (!episodes.length) {
    container.innerHTML = '<div class="empty">No real episodes returned by this source.</div>';
    return;
  }

  const audioOptions = animeEpisodeAudioOptions(episodes);
  const selectedAudio = sourceId === "animedex" && audioOptions.length > 1 ? selectedAnimeEpisodeAudio(anime, episodes) : "";
  const visibleEpisodes = (selectedAudio ? episodes.filter((episode) => episodeAudioKey(episode) === selectedAudio) : [...episodes]).sort(compareEpisodesDesc);
  const pageSize = 40;
  const totalPages = Math.max(1, Math.ceil(visibleEpisodes.length / pageSize));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);
  const pageEpisodes = visibleEpisodes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  container.innerHTML = `
    ${sourceId === "animedex" && audioOptions.length > 1 ? `
      <div class="detail-list-filter" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
        <span>${visibleEpisodes.length} ${episodeAudioLabel(selectedAudio)} episode${visibleEpisodes.length === 1 ? "" : "s"}</span>
        <div style="display: inline-flex; gap: 6px; flex-wrap: wrap;">
          ${audioOptions.map((audio) => `<button class="btn secondary" data-detail-anime-audio="${escapeAttr(audio)}" type="button" style="padding: 6px 10px; min-height: auto; ${audio === selectedAudio ? "border-color: var(--blue); color: var(--blue);" : ""}">${escapeHtml(episodeAudioLabel(audio))}</button>`).join("")}
        </div>
      </div>
    ` : ""}
    <div class="detail-scroll-list">
      ${pageEpisodes.map((episode, index) => {
        const absoluteIndex = (currentPage - 1) * pageSize + index;
        const episodeIndex = episodes.indexOf(episode);
        return `
          <button type="button" class="chapter-row detail-chapter-row detail-anime-episode-row" data-detail-watch-episode data-episode-index="${episodeIndex}">
            <div class="detail-chapter-text">
              <strong>${escapeHtml(episode.number || absoluteIndex + 1)}</strong>
              <span>${escapeHtml(episode.title || `Episode ${episode.number || absoluteIndex + 1}`)}</span>
            </div>
          </button>
        `;
      }).join("")}
    </div>
    ${totalPages > 1 ? `
      <div class="detail-chapter-pagination">
        <button class="btn secondary" data-detail-anime-prev type="button" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>
        <span>Page ${currentPage} / ${totalPages}</span>
        <button class="btn secondary" data-detail-anime-next type="button" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>
      </div>
    ` : ""}
  `;

  container.querySelectorAll("[data-detail-watch-episode]").forEach((button) => {
    button.addEventListener("click", () => {
      const episode = episodes[Number(button.dataset.episodeIndex)];
      openPlayerForAnime(anime, episode, sourceId, sourceId === "hstream" ? sourceMatches : episodes);
    });
  });

  container.querySelectorAll("[data-detail-anime-audio]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(animeAudioPreferenceKey(anime), button.dataset.detailAnimeAudio || "");
      renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches, 1);
    });
  });

  container.querySelector("[data-detail-anime-prev]")?.addEventListener("click", () => renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches, currentPage - 1));
  container.querySelector("[data-detail-anime-next]")?.addEventListener("click", () => renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches, currentPage + 1));
}

function compareEpisodesDesc(a, b) {
  const left = Number.parseFloat(a?.number);
  const right = Number.parseFloat(b?.number);
  if (Number.isFinite(left) && Number.isFinite(right)) return right - left;
  return String(b?.number || b?.title || "").localeCompare(String(a?.number || a?.title || ""), undefined, { numeric: true });
}

function animeEpisodeAudioOptions(episodes) {
  return uniqueStrings(episodes.map((episode) => episodeAudioKey(episode)).filter(Boolean));
}

function selectedAnimeEpisodeAudio(anime, episodes) {
  const options = animeEpisodeAudioOptions(episodes);
  const saved = localStorage.getItem(animeAudioPreferenceKey(anime)) || "";
  return options.includes(saved) ? saved : options[0] || "";
}

function animeAudioPreferenceKey(anime) {
  return `anime-audio:${anime.id || anime.apiId || "unknown"}`;
}

function episodeAudioKey(episode) {
  return String(episode?.audio || "").trim().toLowerCase();
}

function episodeAudioLabel(audio) {
  const value = String(audio || "").trim().toLowerCase();
  if (value === "sub") return "Sub";
  if (value === "dub") return "Dub";
  return value ? value.replace(/^./, (char) => char.toUpperCase()) : "";
}

function openPlayerForAnime(anime, episode = null, sourceId = "anilist", sourceMatches = []) {
  sessionStorage.setItem("player-anime", JSON.stringify(anime));
  sessionStorage.setItem("player-start-episode", JSON.stringify({ episode, sourceId }));
  if (sourceMatches.length) sessionStorage.setItem("player-source-matches", JSON.stringify(sourceMatches));
  else sessionStorage.removeItem("player-source-matches");
  const episodeQuery = episode?.number ? `&episode=${encodeURIComponent(episode.number)}` : "";
  const sourceQuery = sourceId ? `&source=${encodeURIComponent(sourceId)}` : "";
  const apiSourceQuery = anime.apiSource ? `&apiSource=${encodeURIComponent(anime.apiSource)}` : "";
  window.location.href = `player.html?type=${anime.type}&id=${anime.apiId}${episodeQuery}${sourceQuery}${apiSourceQuery}`;
}

function animeSourceKey(anime) {
  return `anime-source:${anime.id || anime.apiId}`;
}

function animeSourceCustomQueryKey(anime) {
  return `${animeSourceKey(anime)}:custom-title`;
}

function preferredAnimeDetailSource(sources, savedSource = "") {
  const ids = sources.map((source) => source.id);
  if (savedSource && ids.includes(savedSource)) return savedSource;
  const preferred = state.settings.defaultAnimeSource || "animedex";
  if (ids.includes(preferred)) return preferred;
  return ["animedex", "anizone", "anilibria", "tokyoinsider", "hstream"].find((id) => ids.includes(id)) || ids[0] || "";
}

function extractEpisodeNumberFromText(text) {
  const match = String(text || "").match(/(?:episode|ep|e)\s*0*(\d+(?:\.\d+)?)/i) || String(text || "").match(/[-\s](\d+(?:\.\d+)?)\s*$/);
  return match ? match[1] : "";
}

function sourceResultWithCache(match, manga) {
  const cached = readCachedMangaChapters(match.id);
  return {
    ...match,
    optionId: match.provider,
    chapters: cached ? cached.map((chapter) => ({ ...chapter, image: manga.image })) : null,
    chapterCount: cached?.length || Number(match.chapterCount || 0),
  };
}

async function searchMangaProviderMatch(manga, provider, customTitle = "") {
  const searchTitles = customTitle ? uniqueStrings([customTitle, ...mangaSourceSearchTitles(manga)]) : mangaSourceSearchTitles(manga);
  const results = await Promise.allSettled(searchTitles.map((title) =>
    fetchApiJson(`/api/manga/search?title=${encodeURIComponent(title)}&providers=${encodeURIComponent(provider)}`)
      .then((matches) => matches.map((match) => ({ ...match, searchTitle: title })))
  ));
  const matches = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  return bestMangaSourceMatches(matches, searchTitles, [provider])[0] || null;
}

function firstProviderFromSourceId(sourceId) {
  const provider = String(sourceId || "").split(":")[0];
  return enabledMangaProviderIds().includes(provider) ? provider : "";
}

async function fetchMangaChaptersCached(source, manga) {
  const cached = readCachedMangaChapters(source.id);
  if (cached) return cached.map((chapter) => ({ ...chapter, image: manga.image }));

  const chapters = await fetchApiJson(`/api/manga/chapters?mangaId=${encodeURIComponent(source.id)}`);
  writeCachedMangaChapters(source.id, chapters);
  return chapters.map((chapter) => ({ ...chapter, image: manga.image }));
}

function readCachedMangaChapters(sourceId) {
  try {
    const cached = JSON.parse(localStorage.getItem(mangaChapterCacheKey(sourceId)) || "null");
    if (!cached || Date.now() - cached.time > MANGA_CHAPTER_CACHE_TTL_MS || !Array.isArray(cached.chapters)) return null;
    return cached.chapters;
  } catch (error) {
    return null;
  }
}

function writeCachedMangaChapters(sourceId, chapters) {
  try {
    localStorage.setItem(mangaChapterCacheKey(sourceId), JSON.stringify({ time: Date.now(), chapters }));
  } catch (error) {
    // Cache is optional; continue if browser storage is full or blocked.
  }
}

function mangaChapterCacheKey(sourceId) {
  return `manga-chapters-v2:${sourceId}`;
}

function renderMangaDetailChapterList(container, manga, source, pageNumber = 1) {
  if (!source.chapters.length) {
    container.innerHTML = '<div class="empty">No chapters returned by this source.</div>';
    return;
  }

  const chapters = [...source.chapters].sort(compareChaptersDesc);
  const pageSize = 40;
  const totalPages = Math.max(1, Math.ceil(chapters.length / pageSize));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);
  const pageChapters = chapters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  container.classList.add("detail-manga-card-grid");
  container.innerHTML = `
    ${pageChapters.map((chapter) => `
    <button type="button" class="detail-manga-chapter-card" data-detail-read-chapter data-chapter-data="${escapeAttr(JSON.stringify(chapter))}">
      ${detailMangaChapterCardInnerHtml(chapter, manga)}
    </button>
    `).join("")}
    ${totalPages > 1 ? `
      <div class="detail-chapter-pagination">
        <button class="btn secondary" data-detail-chapter-prev type="button" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>
        <span>Page ${currentPage} / ${totalPages}</span>
        <button class="btn secondary" data-detail-chapter-next type="button" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>
      </div>
    ` : ""}
  `;

  container.querySelectorAll("[data-detail-read-chapter]").forEach((button) => {
    button.addEventListener("click", () => {
      const chapter = JSON.parse(button.dataset.chapterData);
      const readerManga = { ...manga, provider: source.provider, providerId: source.id, providerTitle: source.title };
      sessionStorage.setItem("reader-manga", JSON.stringify(readerManga));
      sessionStorage.setItem("reader-start-chapter", JSON.stringify({
        mangaKey: mangaSourceKey(manga),
        providerId: source.id,
        chapterId: chapter.id,
        chapterNumber: String(chapter.number || ""),
      }));
      localStorage.setItem(mangaSourceKey(manga), source.id);
      const apiSourceQuery = manga.apiSource ? `&apiSource=${encodeURIComponent(manga.apiSource)}` : "";
      window.location.href = `manga-reader.html?type=${manga.type}&id=${manga.apiId}${apiSourceQuery}`;
    });
  });

  container.querySelector("[data-detail-chapter-prev]")?.addEventListener("click", () => renderMangaDetailChapterList(container, manga, source, currentPage - 1));
  container.querySelector("[data-detail-chapter-next]")?.addEventListener("click", () => renderMangaDetailChapterList(container, manga, source, currentPage + 1));
}

function detailMangaChapterCardHtml(chapter, manga, index = 0) {
  return `<button type="button" class="detail-manga-chapter-card">${detailMangaChapterCardInnerHtml({ ...chapter, number: chapter.number || index + 1 }, manga)}</button>`;
}

function detailMangaChapterCardInnerHtml(chapter, manga) {
  const number = chapter.number || "?";
  const title = chapter.title || `Chapter ${number}`;
  const image = chapter.image || manga.image || manga.banner || fallbackImage;
  return `
    <img src="${escapeAttr(image)}" alt="${escapeAttr(title)} thumbnail" loading="lazy">
    <span class="detail-manga-chapter-chip">Ch ${escapeHtml(number)}</span>
    <strong>${escapeHtml(title)}</strong>
    <small>${escapeHtml(chapter.date || chapter.time || "Date TBA")}</small>
  `;
}

function compareChaptersDesc(a, b) {
  const left = Number.parseFloat(a.number);
  const right = Number.parseFloat(b.number);
  if (Number.isFinite(left) && Number.isFinite(right)) return right - left;
  return String(b.number || b.title || "").localeCompare(String(a.number || a.title || ""), undefined, { numeric: true });
}

function saveCurrent(silent = false) {
  if (!state.current) return;
  const progressInput = document.querySelector("[data-track-progress]");
  const ratingElement = document.querySelector("[data-track-rating]");
  const progress = clampProgressValue(Number(progressInput?.value || 0), state.current);
  const ratingInput = ratingElement?.value || "";
  const ratingValue = Number(ratingInput);
  const rating = ratingInput === "" || !Number.isFinite(ratingValue) ? "" : Math.min(10, Math.max(0, Math.round(ratingValue * 2) / 2));
  if (progressInput) progressInput.value = progress;
  if (ratingElement) ratingElement.value = rating;
  const saved = {
    ...state.current,
    status: document.querySelector("[data-track-status]")?.value || state.current.status,
    progress,
    rating,
    notes: document.querySelector("[data-track-notes]")?.value.trim() || "",
    updatedAt: Date.now(),
  };

  state.library[saved.id] = saved;
  state.current = saved;
  if (!persistLibrary()) {
    showToast("Could not save. Browser storage may be blocked.");
    return;
  }
  updateStats();
  document.querySelector("[data-remove-track]")?.removeAttribute("hidden");
  if (page === "details") renderDetails(document.querySelector("[data-details-root]"), saved);
  if (page === "library") renderLibrary();
  if (!silent) showToast("Saved to your library.");
}

function clampProgressValue(value, item = state.current) {
  const number = Number.isFinite(value) ? Math.floor(value) : 0;
  const total = Number(item?.total || 0);
  const max = Number.isFinite(total) && total > 0 ? total : Number.MAX_SAFE_INTEGER;
  return Math.min(max, Math.max(0, number));
}

function removeCurrent() {
  if (!state.current) return;
  delete state.library[state.current.id];
  if (!persistLibrary()) {
    showToast("Could not remove. Browser storage may be blocked.");
    return;
  }
  updateStats();
  showToast("Removed from your library.");
  if (page === "details") renderDetails(document.querySelector("[data-details-root]"), state.current);
  if (page === "library") renderLibrary();
}

function goToDetails(item) {
  if (!item) return;
  try {
    sessionStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(item));
  } catch (error) {
    // Navigation should still work if browser storage is unavailable.
  }
  window.location.href = detailUrl(item);
}

function detailUrl(item) {
  const source = item.apiSource ? `&source=${encodeURIComponent(item.apiSource)}` : "";
  return `details.html?type=${encodeURIComponent(item.type)}&id=${encodeURIComponent(item.apiId || item.id.split("-").pop())}${source}`;
}

function shortText(text, maxLength) {
  const value = clean(text);
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

function openSearchOverlay() {
  const overlay = document.querySelector("[data-search-overlay]");
  const type = document.querySelector("[data-overlay-search-type]");
  overlay.classList.add("show");
  type.value = page === "manga" ? "manga" : "anime";
  window.setTimeout(() => document.querySelector("[data-overlay-search-input]").focus(), 0);
}

function closeSearchOverlay() {
  document.querySelector("[data-search-overlay]")?.classList.remove("show");
}

function toggleProfileMenu(event) {
  event.stopPropagation();
  document.querySelector("[data-profile-popover]")?.classList.toggle("show");
}

function closeProfileMenu() {
  document.querySelector("[data-profile-popover]")?.classList.remove("show");
}

function toggleMobileMenu(event) {
  event.stopPropagation();
  const expanded = document.body.classList.toggle("mobile-menu-open");
  event.currentTarget.setAttribute("aria-expanded", String(expanded));
}

function closeMobileMenu() {
  document.body.classList.remove("mobile-menu-open");
  document.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");
}

function toggleBrowseFilters(event) {
  if (page !== "anime" && page !== "manga" && page !== "doujin") {
    return;
  }

  event.stopPropagation();
  const isOpen = document.body.classList.toggle("browse-filters-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) window.setTimeout(() => document.querySelector("[data-browse-search]")?.focus(), 0);
}

function updateAdultSetting(event) {
  setAdultContentEnabled(event.target.checked);
}

function setAdultContentEnabled(enabled, options = {}) {
  const { reload = true, toast = true } = options;
  state.settings.allowAdult = Boolean(enabled);
  persistSettings();
  syncAdultControls();
  updateGenreToggleLabel();
  if (page === "settings") {
    loadAnimeSourcesNew();
    loadMangaExtensionsNew();
  }
  if (toast) showToast(state.settings.allowAdult ? "18+ content enabled." : "18+ content disabled.");
  if (!reload) return;
  if (page === "anime" || page === "manga") updateBrowseUrl();
  if (page === "home") loadHomeSections();
  if (page === "anime" || page === "manga") loadFeed();
  if (page === "doujin") loadDoujinSearch();
}

function syncAdultControls() {
  if (!state.settings.allowAdult) state.adultGenreOnly = false;
  document.querySelectorAll("[data-adult-toggle]").forEach((input) => {
    input.checked = Boolean(state.settings.allowAdult);
  });
  document.querySelectorAll("[data-adult-genre]").forEach((input) => {
    input.checked = Boolean(state.adultGenreOnly);
  });
  document.querySelectorAll("[data-adult-nav]").forEach((link) => {
    link.hidden = !state.settings.allowAdult;
  });
}

function updateThemeColor(event) {
  state.settings.themeColor = event.target.value;
  applyThemeColor();
  persistSettings();
  showToast("Theme color updated.");
  if (page === "details" && state.current) renderDetails(document.querySelector("[data-details-root]"), state.current);
}

function resetThemeColor() {
  state.settings.themeColor = "";
  applyThemeColor();
  persistSettings();
  document.querySelector("[data-theme-color]").value = "#48dbfb";
  showToast("Using poster colors.");
  if (page === "details" && state.current) renderDetails(document.querySelector("[data-details-root]"), state.current);
}

function applyThemeColor() {
  const root = document.documentElement;
  if (!state.settings.themeColor) {
    root.style.removeProperty("--blue");
    root.style.removeProperty("--pink");
    root.style.removeProperty("--theme-primary");
    root.style.removeProperty("--theme-secondary");
    root.style.removeProperty("--theme-primary-rgb");
    root.style.removeProperty("--theme-secondary-rgb");
    root.style.removeProperty("--theme-on-primary");
    return;
  }

  const primary = normalizeColor(state.settings.themeColor);
  const secondary = rotateHexHue(primary, 92);
  root.style.setProperty("--blue", primary);
  root.style.setProperty("--pink", secondary);
  root.style.setProperty("--theme-primary", primary);
  root.style.setProperty("--theme-secondary", secondary);
  root.style.setProperty("--theme-primary-rgb", hexToRgb(primary));
  root.style.setProperty("--theme-secondary-rgb", hexToRgb(secondary));
  root.style.setProperty("--theme-on-primary", contrastText(primary));
}

function toggleSearchOverlay() {
  document.querySelector("[data-search-overlay]").classList.contains("show") ? closeSearchOverlay() : openSearchOverlay();
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  document.querySelector("[data-theme-toggle]").innerHTML = themeIcon();
}

function applyStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const fallback = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = saved || fallback;
}

function adultFilter() {
  return state.settings.allowAdult ? null : false;
}

function animeFilterArgs(baseArgs, includeBrowseFilters = true) {
  const args = [...baseArgs];
  if (includeBrowseFilters && state.adultGenreOnly && state.settings.allowAdult) args.push("isAdult: true");
  else if (!state.settings.allowAdult) args.push("isAdult: false");
  if (includeBrowseFilters && state.genres.length) args.push("genre_in: $genres");
  if (includeBrowseFilters && state.year) args.push("seasonYear: $year");
  if (includeBrowseFilters && state.status) args.push("status: $status");
  return args.join(", ");
}

function animeQueryDefs(baseDefs) {
  const defs = [...baseDefs];
  if (state.genres.length) defs.push("$genres: [String]");
  if (state.year) defs.push("$year: Int");
  if (state.status) defs.push("$status: MediaStatus");
  return defs.join(", ");
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const defaults = defaultSettings();
    const settings = {
      ...defaults,
      ...saved,
      animeSources: { ...defaults.animeSources, ...(saved.animeSources || {}) },
      mangaSources: { ...defaults.mangaSources, ...(saved.mangaSources || {}) },
      subtitleStyle: { ...defaults.subtitleStyle, ...(saved.subtitleStyle || {}) },
    };
    settings.apiBaseUrl = normalizeApiBaseUrl(settings.apiBaseUrl || localStorage.getItem(API_BASE_KEY) || DEFAULT_API_BASE_URL);
    return settings;
  } catch (error) {
    return defaultSettings();
  }
}

function defaultSettings() {
  return {
    allowAdult: false,
    animeSources: defaultAnimeSources(),
    mangaSources: defaultMangaSources(),
    preferredQuality: "auto",
    subtitleLanguage: "english",
    autoPlay: true,
    autoPlayNext: false,
    defaultAnimeSource: "animedex",
    playerSpeed: "1",
    subtitleStyle: defaultSubtitleStyle(),
  };
}

function defaultSubtitleStyle() {
  return { ...DEFAULT_SUBTITLE_STYLE };
}

function defaultAnimeSources() {
  return Object.fromEntries(ANIME_SOURCES.map((source) => [source.id, true]));
}

function animeSourceEnabled(id) {
  const enabled = { ...defaultAnimeSources(), ...(state.settings.animeSources || {}) };
  return enabled[id] !== false;
}

function defaultMangaSources() {
  return Object.fromEntries(MANGA_SOURCES.map((source) => [source.id, true]));
}

function enabledMangaProviderIds() {
  const enabled = { ...defaultMangaSources(), ...(state.settings.mangaSources || {}) };
  return MANGA_SOURCES.filter((source) => enabled[source.id] && (!source.adult || state.settings.allowAdult)).map((source) => source.id);
}

function persistSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function themeIcon() {
  if (document.documentElement.dataset.theme === "light") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.7A8.5 8.5 0 0 1 9.3 3a7 7 0 1 0 11.7 11.7Z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 5a1 1 0 0 1-1-1v-1.3a1 1 0 1 1 2 0V21a1 1 0 0 1-1 1Zm0-17.7a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1.3a1 1 0 0 1-1 1ZM4.2 20.8a1 1 0 0 1-.7-1.7l.9-.9a1 1 0 1 1 1.4 1.4l-.9.9a1 1 0 0 1-.7.3Zm14.7-14.7a1 1 0 0 1-.7-1.7l.9-.9a1 1 0 1 1 1.4 1.4l-.9.9a1 1 0 0 1-.7.3ZM21 13h-1.3a1 1 0 1 1 0-2H21a1 1 0 1 1 0 2ZM4.3 13H3a1 1 0 1 1 0-2h1.3a1 1 0 1 1 0 2Zm15.5 7.8a1 1 0 0 1-.7-.3l-.9-.9a1 1 0 1 1 1.4-1.4l.9.9a1 1 0 0 1-.7 1.7ZM5.1 6.1a1 1 0 0 1-.7-.3l-.9-.9A1 1 0 1 1 4.9 3.5l.9.9a1 1 0 0 1-.7 1.7Z"/></svg>`;
}

function updateStats() {
  const items = Object.values(state.library);
  const active = items.filter((item) => item.status === "watching" || item.status === "reading").length;
  const done = items.filter((item) => item.status === "completed").length;
  const ratings = items.map((item) => Number(item.rating)).filter(Boolean);
  const avg = ratings.length ? (ratings.reduce((sum, score) => sum + score, 0) / ratings.length).toFixed(1) : "--";
  setText("[data-stat-total]", items.length);
  setText("[data-stat-active]", active);
  setText("[data-stat-done]", done);
  setText("[data-stat-score]", avg);
}

function headingText() {
  if (state.browseQuery) return `Results for "${state.browseQuery}"`;
  if (page === "anime") return { trending: "Trending Anime", top: "Top Rated Anime", popular: "Popular Anime" }[state.feed];
  return { top: "Top Manga", popular: "Popular Manga", publishing: "Publishing Manga" }[state.feed];
}

function updateBrowsePager() {
  setText("[data-page-label]", `Loaded through page ${state.browsePage}`);
  const numbers = document.querySelector("[data-page-numbers]");
  if (numbers) {
    const start = Math.max(1, Math.min(state.browsePage - 2, 5));
    const pages = Array.from({ length: 5 }, (_, index) => start + index);
    numbers.innerHTML = pages.map((pageNumber) => `<button class="page-number ${pageNumber === state.browsePage ? "active" : ""}" data-page-number="${pageNumber}" type="button">${pageNumber}</button>`).join("");
  }
  document.querySelectorAll("[data-page-prev]").forEach((button) => {
    button.disabled = state.browsePage <= 1;
  });
}

function ensureBrowseSentinel(pager) {
  let sentinel = document.querySelector("[data-browse-sentinel]");
  if (!sentinel) {
    sentinel = create("div", "browse-sentinel");
    sentinel.dataset.browseSentinel = "";
    sentinel.setAttribute("aria-live", "polite");
    pager.before(sentinel);
  }
  return sentinel;
}

function updateBrowseSentinel(message) {
  const sentinel = document.querySelector("[data-browse-sentinel]");
  if (!sentinel) return;
  sentinel.textContent = message || (state.browseHasMore ? "Scroll for more titles" : "End of results");
  sentinel.classList.toggle("done", !state.browseHasMore);
}

function updateGenreToggleLabel() {
  const toggle = document.querySelector("[data-genre-toggle]");
  if (!toggle) return;

  const count = state.genres.length + (state.adultGenreOnly ? 1 : 0);

  if (!count) {
    toggle.textContent = "Any genre";
    return;
  }

  if (state.adultGenreOnly && !state.genres.length) {
    toggle.textContent = "Adult +18";
    return;
  }

  toggle.textContent = state.genres.length === 1 && !state.adultGenreOnly ? state.genres[0] : `${count} filters selected`;
}

function mediaLabel(item) {
  return String(item.displayType || item.format || item.type || "Title").toUpperCase();
}

function statusOptions(type) {
  const options = type === "manga"
    ? [["reading", "Reading"], ["planning", "Planning"], ["completed", "Completed"], ["dropped", "Dropped"]]
    : [["watching", "Watching"], ["planning", "Planning"], ["completed", "Completed"], ["dropped", "Dropped"]];
  return options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

function detailFact(label, value) {
  return `<div class="detail-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Unknown")}</strong></div>`;
}

function seriesStat(label, value) {
  return `<div class="series-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Unknown")}</strong></div>`;
}

function buildChapterRows(item) {
  if (item.type === "anime" && item.episodesList?.length) {
    return item.episodesList.map((episode, index) => ({
      title: episode.title || `Episode ${index + 1}`,
      time: episode.time || "Episode",
      image: episode.image || item.banner || item.image || fallbackImage,
    }));
  }

  const total = Number(item.total || 0);
  const count = total ? Math.min(total, 24) : 12;
  return Array.from({ length: count }, (_, index) => {
    const number = total ? total - index : count - index;
    return {
      title: `${item.type === "anime" ? "Episode" : "Chapter"} ${number}`,
      time: index === 0 ? "Latest" : index < 4 ? `${index + 1} days ago` : `${index} weeks ago`,
      image: item.type === "manga" ? item.image || item.banner || fallbackImage : item.banner || item.image || fallbackImage,
    };
  });
}

function colorFromString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, 76, 58);
}

function hslToHex(hue, saturation, lightness) {
  saturation /= 100;
  lightness /= 100;
  const k = (n) => (n + hue / 30) % 12;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const f = (n) => lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)].map((channel) => Math.round(255 * channel).toString(16).padStart(2, "0")).join("")}`;
}

function rotateHexHue(hex, degrees) {
  const [red, green, blue] = normalizeColor(hex).replace("#", "").match(/../g).map((value) => parseInt(value, 16) / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    if (max === green) hue = (blue - red) / delta + 2;
    if (max === blue) hue = (red - green) / delta + 4;
    hue *= 60;
  }

  return hslToHex((hue + degrees + 360) % 360, Math.round(saturation * 100), Math.round(lightness * 100));
}

function normalizeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : colorFromString(String(value));
}

function hexToRgb(hex) {
  const value = normalizeColor(hex).replace("#", "");
  return `${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}`;
}

function contrastText(hex) {
  const value = normalizeColor(hex).replace("#", "");
  const channels = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return luminance > 0.42 ? "#06101a" : "#f8fafc";
}

function setLoading(container, count) {
  container.innerHTML = "";
  for (let index = 0; index < count; index += 1) container.append(create("div", "loading"));
}

function setListLoading(container, count) {
  container.innerHTML = "";
  for (let index = 0; index < count; index += 1) container.append(create("div", "list-loading"));
}

function setRailLoading(container, count) {
  container.innerHTML = "";
  for (let index = 0; index < count; index += 1) container.append(create("div", "rail-loading"));
}

function renderEmpty(container, message) {
  container.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function setActive(parent, activeButton) {
  parent.querySelectorAll(".chip").forEach((button) => button.classList.remove("active"));
  activeButton.classList.add("active");
}

function mergeItems(items) {
  return [...new Map(items.filter(Boolean).map((item) => [item.id, item])).values()];
}

function loadLibrary() {
  const merged = {};

  for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    try {
      Object.assign(merged, JSON.parse(localStorage.getItem(key)) || {});
    } catch (error) {
      // Ignore malformed or unavailable storage entries.
    }
  }

  return merged;
}

function persistLibrary() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.library));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.setItem(key, JSON.stringify(state.library)));
    return true;
  } catch (error) {
    return false;
  }
}

function loadDetailCache() {
  try {
    return JSON.parse(sessionStorage.getItem(DETAIL_CACHE_KEY));
  } catch (error) {
    return null;
  }
}

function clean(text) {
  return (text || "").replace(/<br\s*\/?>(\s*)/gi, " ").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function statusLabel(status) {
  return ({ watching: "Watching", reading: "Reading", planning: "Planning", completed: "Completed", dropped: "Dropped" }[status] || "Tracked");
}

function metaHtml(values) {
  return values.filter(Boolean).slice(0, 6).map((value) => `<span>${escapeHtml(String(value))}</span>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value || "").replace(/'/g, "&#39;");
}

function create(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
}

function showToast(message) {
  const toast = document.querySelector("[data-toast]");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function apiBaseUrl() {
  const value = state.settings.apiBaseUrl || localStorage.getItem(API_BASE_KEY) || window.ANITRACK_API_BASE_URL || DEFAULT_API_BASE_URL;
  const normalized = normalizeApiBaseUrl(value);
  if (normalized !== value) {
    state.settings.apiBaseUrl = normalized;
    localStorage.setItem(API_BASE_KEY, normalized);
  }
  return normalized;
}

function normalizeApiBaseUrl(value) {
  const normalized = String(value || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, "");
  return LEGACY_API_BASE_URLS.includes(normalized) ? DEFAULT_API_BASE_URL : normalized;
}

async function fetchApiJson(path) {
  let response;
  try {
    response = await fetch(apiRequestUrl(path));
  } catch (error) {
    if (!isMangaApiPath(path)) throw error;
    response = await fetch(path);
  }
  if (!response.ok && isMangaApiPath(path) && !isSameOriginApiUrl(response.url)) {
    response = await fetch(path);
  }
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const data = await response.json();
  if (isEmptyMangaApiResult(path, data) && !isSameOriginApiUrl(response.url)) {
    const fallback = await fetch(path);
    if (fallback.ok) {
      const fallbackData = await fallback.json();
      if (!isEmptyMangaApiResult(path, fallbackData)) return fallbackData;
    }
  }
  return data;
}

function apiRequestUrl(path) {
  const route = String(path || "");
  if (route.startsWith("/api/anime/")) return route;
  if (shouldUseSameOriginMangaApi(route)) return route;
  return `${apiBaseUrl()}${route}`;
}

function shouldUseSameOriginMangaApi(path) {
  try {
    const url = new URL(path, window.location.origin);
    if (!url.pathname.startsWith("/api/manga/")) return false;
    const providers = (url.searchParams.get("providers") || "").split(",");
    const chapterId = url.searchParams.get("chapterId") || "";
    const doujinProviders = DOUJIN_SOURCES.map((source) => source.id);
    return providers.some((provider) => doujinProviders.includes(provider))
      || doujinProviders.some((provider) => chapterId.startsWith(`${provider}:`));
  } catch (error) {
    return false;
  }
}

function isMangaApiPath(path) {
  return String(path || "").startsWith("/api/manga/");
}

function isSameOriginApiUrl(url) {
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch (error) {
    return true;
  }
}

function isEmptyMangaApiResult(path, data) {
  if (!isMangaApiPath(path)) return false;
  if (Array.isArray(data)) return data.length === 0;
  if (data && Array.isArray(data.pages)) return data.pages.length === 0;
  return false;
}

async function initSettingsPage() {
  const settingsRoot = document.querySelector(".settings-layout") || document;
  const nav = settingsRoot.querySelector(".settings-nav");
  const navButtons = [...settingsRoot.querySelectorAll(".settings-nav-btn[data-section]")];
  const sections = [...settingsRoot.querySelectorAll("[data-section-content]")];

  const showSettingsSection = (sectionName) => {
    navButtons.forEach((button) => button.classList.toggle("active", button.dataset.section === sectionName));
    sections.forEach((section) => section.classList.toggle("active", section.dataset.sectionContent === sectionName));

    if (sectionName === "anime-sources") loadAnimeSourcesNew();
    if (sectionName === "extensions-manga") loadMangaExtensionsNew();
  };

  nav?.addEventListener("click", (event) => {
    const button = event.target.closest(".settings-nav-btn[data-section]");
    if (!button) return;
    event.preventDefault();
    showSettingsSection(button.dataset.section);
  });

  // Theme options
  const themeButtons = document.querySelectorAll("[data-theme-opt]");
  const currentTheme = document.documentElement.dataset.theme || "dark";
  themeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeOpt === currentTheme);
    btn.addEventListener("click", () => {
      const theme = btn.dataset.themeOpt;
      if (theme === "auto") {
        const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
        document.documentElement.dataset.theme = prefersLight ? "light" : "dark";
      } else {
        document.documentElement.dataset.theme = theme;
      }
      localStorage.setItem(THEME_KEY, theme);
      themeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      showToast(`Theme changed`);
    });
  });

  // Color picker
  const colorPicker = document.querySelector("[data-color-picker]");
  colorPicker.value = state.settings.themeColor || "#48dbfb";
  colorPicker.addEventListener("input", (e) => {
    state.settings.themeColor = e.target.value;
    applyThemeColor();
    persistSettings();
  });

  document.querySelector("[data-reset-color-btn]").addEventListener("click", () => {
    state.settings.themeColor = "";
    colorPicker.value = "#48dbfb";
    applyThemeColor();
    persistSettings();
    showToast("Using default colors");
  });

  // Content preferences
  const adultToggle = settingsRoot.querySelector("[data-section-content='content'] [data-adult-toggle]");
  adultToggle.checked = state.settings.allowAdult || false;
  adultToggle.addEventListener("change", (e) => {
    setAdultContentEnabled(e.target.checked, { reload: false });
  });

  document.querySelector("[data-library-view-select]").value = state.settings.defaultLibraryView || "watching";
  document.querySelector("[data-library-view-select]").addEventListener("change", (e) => {
    state.settings.defaultLibraryView = e.target.value;
    persistSettings();
  });

  document.querySelector("[data-episode-preview-select]").value = state.settings.episodePreview || "hover";
  document.querySelector("[data-episode-preview-select]").addEventListener("change", (e) => {
    state.settings.episodePreview = e.target.value;
    persistSettings();
  });

  // Streaming preferences
  document.querySelector("[data-quality-select]").value = state.settings.preferredQuality || "auto";
  document.querySelector("[data-quality-select]").addEventListener("change", (e) => {
    state.settings.preferredQuality = e.target.value;
    persistSettings();
  });

  document.querySelector("[data-subtitle-select]").value = state.settings.subtitleLanguage || "english";
  document.querySelector("[data-subtitle-select]").addEventListener("change", (e) => {
    state.settings.subtitleLanguage = e.target.value;
    persistSettings();
  });

  initSubtitleStyleSettings();

  const autoPlayToggle = document.querySelector("[data-player-autoplay-toggle]");
  if (autoPlayToggle) {
    autoPlayToggle.checked = state.settings.autoPlay !== false;
    autoPlayToggle.addEventListener("change", (e) => {
      state.settings.autoPlay = e.target.checked;
      persistSettings();
    });
  }

  const defaultAnimeSource = document.querySelector("[data-default-anime-source]");
  if (defaultAnimeSource) {
    if (![...defaultAnimeSource.options].some((option) => option.value === state.settings.defaultAnimeSource)) {
      state.settings.defaultAnimeSource = "animedex";
      persistSettings();
    }
    defaultAnimeSource.value = state.settings.defaultAnimeSource || "animedex";
    defaultAnimeSource.addEventListener("change", (e) => {
      state.settings.defaultAnimeSource = e.target.value;
      persistSettings();
      showToast(`Default anime source set to ${animeSourceLabel(e.target.value)}`);
    });
  }

  document.querySelector("[data-autoplay-toggle]").checked = state.settings.autoPlayNext || false;
  document.querySelector("[data-autoplay-toggle]").addEventListener("change", (e) => {
    state.settings.autoPlayNext = e.target.checked;
    persistSettings();
  });

  const apiInput = document.querySelector("[data-api-base-url]");
  apiInput.value = apiBaseUrl();
  apiInput.addEventListener("change", (e) => {
    state.settings.apiBaseUrl = normalizeApiBaseUrl(e.target.value);
    apiInput.value = state.settings.apiBaseUrl;
    localStorage.setItem(API_BASE_KEY, state.settings.apiBaseUrl);
    persistSettings();
    showToast("Backend API URL saved");
  });

  document.querySelector("[data-api-test-btn]").addEventListener("click", async () => {
    state.settings.apiBaseUrl = normalizeApiBaseUrl(apiInput.value);
    apiInput.value = state.settings.apiBaseUrl;
    localStorage.setItem(API_BASE_KEY, state.settings.apiBaseUrl);
    persistSettings();
    try {
      const health = await fetchApiJson("/health");
      showToast(health.ok ? "Backend connected" : "Backend responded unexpectedly");
    } catch (error) {
      showToast("Backend connection failed");
    }
  });

  // Data management
  document.querySelector("[data-export-btn]").addEventListener("click", exportLibrary);
  document.querySelector("[data-import-btn]").addEventListener("click", () => {
    const input = create("input", "");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", importLibrary);
    input.click();
  });
  document.querySelector("[data-clear-btn]").addEventListener("click", () => {
    if (confirm("Clear all data? This cannot be undone.")) {
      localStorage.clear();
      state.library = {};
      showToast("All data cleared");
      setTimeout(() => location.href = "index.html", 1000);
    }
  });

  loadAnimeSourcesNew();
}

function initSubtitleStyleSettings() {
  const size = document.querySelector("[data-subtitle-size]");
  const sizeValue = document.querySelector("[data-subtitle-size-value]");
  const color = document.querySelector("[data-subtitle-color]");
  const background = document.querySelector("[data-subtitle-background]");
  const opacity = document.querySelector("[data-subtitle-opacity]");
  const opacityValue = document.querySelector("[data-subtitle-opacity-value]");
  const position = document.querySelector("[data-subtitle-position]");
  const offset = document.querySelector("[data-subtitle-offset]");
  const offsetValue = document.querySelector("[data-subtitle-offset-value]");
  const reset = document.querySelector("[data-reset-subtitles]");
  if (!size || !color || !background || !opacity || !position || !offset || !reset) return;

  const sync = () => {
    const style = { ...defaultSubtitleStyle(), ...(state.settings.subtitleStyle || {}) };
    size.value = style.size;
    color.value = style.color;
    background.value = style.backgroundColor;
    opacity.value = style.backgroundOpacity;
    position.value = style.position || "bottom";
    offset.value = style.offset;
    if (sizeValue) sizeValue.textContent = `${style.size}px`;
    if (opacityValue) opacityValue.textContent = `${style.backgroundOpacity}%`;
    if (offsetValue) offsetValue.textContent = `${style.offset}px`;
  };

  const save = () => {
    state.settings.subtitleStyle = {
      size: Number(size.value),
      color: color.value,
      backgroundColor: background.value,
      backgroundOpacity: Number(opacity.value),
      position: position.value,
      offset: Number(offset.value),
    };
    if (sizeValue) sizeValue.textContent = `${state.settings.subtitleStyle.size}px`;
    if (opacityValue) opacityValue.textContent = `${state.settings.subtitleStyle.backgroundOpacity}%`;
    if (offsetValue) offsetValue.textContent = `${state.settings.subtitleStyle.offset}px`;
    persistSettings();
  };

  [size, color, background, opacity, offset].forEach((control) => control.addEventListener("input", save));
  position.addEventListener("change", save);
  reset.addEventListener("click", () => {
    state.settings.subtitleStyle = defaultSubtitleStyle();
    persistSettings();
    sync();
    showToast("Subtitle style reset.");
  });
  sync();
}

async function loadAnimeSourcesNew() {
  const container = document.querySelector("[data-anime-sources]");
  if (!container) return;

  const enabled = { ...defaultAnimeSources(), ...(state.settings.animeSources || {}) };
  container.innerHTML = ANIME_SOURCES.filter((source) => !source.adult || state.settings.allowAdult).map((source) => `
    <div class="extension-card source-setting-card${source.adult ? " adult-source-card" : ""}">
      <div class="source-setting-head">
        <div>
          <h4>${escapeHtml(source.name)}${source.adult ? ' <span class="extension-nsfw">+18</span>' : ""}</h4>
          <p>${escapeHtml(source.description)}</p>
        </div>
        <input type="checkbox" class="extension-toggle" data-anime-source-toggle="${escapeAttr(source.id)}" aria-label="Enable ${escapeAttr(source.name)}" ${enabled[source.id] ? "checked" : ""}>
      </div>
      <div class="extension-footer">
        <span class="extension-version">${escapeHtml(source.badge)}</span>
        ${source.adult ? '<span class="source-note">Requires 18+ content enabled</span>' : ""}
      </div>
    </div>
  `).join("");

  container.querySelectorAll("[data-anime-source-toggle]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      state.settings.animeSources = { ...defaultAnimeSources(), ...(state.settings.animeSources || {}) };
      state.settings.animeSources[toggle.dataset.animeSourceToggle] = toggle.checked;
      if (toggle.dataset.animeSourceToggle === "hstream" && toggle.checked && !state.settings.allowAdult) {
        showToast("hstream appears after 18+ content is enabled.");
      } else {
        showToast(`${toggle.checked ? "Enabled" : "Disabled"} ${animeSourceLabel(toggle.dataset.animeSourceToggle)}`);
      }
      persistSettings();
    });
  });
}

async function loadMangaExtensionsNew() {
  const container = document.querySelector("[data-manga-extensions]");
  if (!container) return;

  const enabled = { ...defaultMangaSources(), ...(state.settings.mangaSources || {}) };
  container.innerHTML = MANGA_SOURCES.filter((source) => !source.adult || state.settings.allowAdult).map((source) => `
    <div class="extension-card">
      <h4>${escapeHtml(source.name)}</h4>
      <p>${escapeHtml(source.description)}</p>
      <div class="extension-footer">
        <span class="extension-version">${source.adult ? "Adult source" : "Real source"}</span>
        ${source.adult ? '<span class="source-note">Requires 18+ content enabled</span>' : ""}
        <input type="checkbox" class="extension-toggle" data-manga-provider-toggle="${escapeAttr(source.id)}" aria-label="Enable ${escapeAttr(source.name)}" ${enabled[source.id] ? "checked" : ""}>
      </div>
    </div>
  `).join("");

  container.querySelectorAll("[data-manga-provider-toggle]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      state.settings.mangaSources = { ...defaultMangaSources(), ...(state.settings.mangaSources || {}) };
      state.settings.mangaSources[toggle.dataset.mangaProviderToggle] = toggle.checked;
      persistSettings();
      showToast(`${toggle.checked ? "Enabled" : "Disabled"} ${providerLabel(toggle.dataset.mangaProviderToggle)}`);
    });
  });
}

function renderExtensionsGrid(container, extensions) {
  const catalog = JSON.parse(localStorage.getItem("extension-catalog") || "{}");
  extensions.forEach((ext) => {
    catalog[String(ext.id)] = ext;
  });
  localStorage.setItem("extension-catalog", JSON.stringify(catalog));

  const pageSize = 30;
  let currentPage = 1;
  const langs = [...new Set(extensions.map((ext) => ext.lang || "unknown"))].sort((a, b) => a.localeCompare(b));

  container.innerHTML = `
    <div class="extensions-browser">
      <div class="extensions-toolbar">
        <input data-extension-search type="search" placeholder="Search ${escapeAttr(extensions[0]?.type || "")} extensions..." aria-label="Search extensions">
        <select data-extension-lang aria-label="Filter extension language">
          <option value="">All languages</option>
          ${langs.map((lang) => `<option value="${escapeAttr(lang)}">${escapeHtml(lang)}</option>`).join("")}
        </select>
        <label class="extensions-nsfw-toggle"><input data-extension-nsfw type="checkbox"> Include NSFW</label>
      </div>
      <div class="extensions-summary" data-extension-summary></div>
      <div class="extensions-grid" data-extension-results></div>
      <div class="extensions-pagination">
        <button class="btn secondary" data-extension-prev type="button">Previous</button>
        <span data-extension-page></span>
        <button class="btn secondary" data-extension-next type="button">Next</button>
      </div>
    </div>
  `;

  const searchInput = container.querySelector("[data-extension-search]");
  const langSelect = container.querySelector("[data-extension-lang]");
  const nsfwToggle = container.querySelector("[data-extension-nsfw]");
  const results = container.querySelector("[data-extension-results]");
  const summary = container.querySelector("[data-extension-summary]");
  const pageLabel = container.querySelector("[data-extension-page]");
  const prevButton = container.querySelector("[data-extension-prev]");
  const nextButton = container.querySelector("[data-extension-next]");

  const renderPage = () => {
    const query = searchInput.value.trim().toLowerCase();
    const lang = langSelect.value;
    const includeNsfw = nsfwToggle.checked;
    const filtered = extensions.filter((ext) => {
      const haystack = `${ext.name} ${ext.description} ${ext.lang}`.toLowerCase();
      return (!query || haystack.includes(query)) && (!lang || ext.lang === lang) && (includeNsfw || !ext.nsfw);
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    summary.textContent = `${filtered.length} of ${extensions.length} extensions`;
    pageLabel.textContent = `Page ${currentPage} / ${totalPages}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    results.innerHTML = pageItems.length ? pageItems.map(extensionCardHtml).join("") : '<div class="loading-state">No extensions match your filters</div>';
    bindExtensionToggles(results);
  };

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderPage();
  });
  langSelect.addEventListener("change", () => {
    currentPage = 1;
    renderPage();
  });
  nsfwToggle.addEventListener("change", () => {
    currentPage = 1;
    renderPage();
  });
  prevButton.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    renderPage();
  });
  nextButton.addEventListener("click", () => {
    currentPage += 1;
    renderPage();
  });

  renderPage();
}

function extensionCardHtml(ext) {
  return `
    <div class="extension-card">
      <h4>${escapeHtml(ext.name)}${ext.nsfw ? ' <span class="extension-nsfw">NSFW</span>' : ""}</h4>
      <p>${escapeHtml(ext.description)}</p>
      <div class="extension-footer">
        <span class="extension-version">${escapeHtml(ext.lang || "unknown")} / v${escapeHtml(ext.version)}</span>
        ${ext.url ? `<a class="btn secondary" href="${escapeAttr(ext.url)}" target="_blank" rel="noreferrer" style="min-height: 32px; padding: 6px 10px; font-size: 12px;">Open</a>` : ""}
        <input type="checkbox" class="extension-toggle" data-ext-id="${escapeAttr(ext.id)}" aria-label="Enable ${escapeAttr(ext.name)}">
      </div>
    </div>
  `;
}

function bindExtensionToggles(root) {
  root.querySelectorAll(".extension-toggle").forEach((toggle) => {
    const enabled = JSON.parse(localStorage.getItem("enabled-extensions") || "{}");
    toggle.checked = enabled[toggle.dataset.extId] || false;

    toggle.addEventListener("change", () => {
      const enabled = JSON.parse(localStorage.getItem("enabled-extensions") || "{}");
      enabled[toggle.dataset.extId] = toggle.checked;
      localStorage.setItem("enabled-extensions", JSON.stringify(enabled));
    });
  });
}

function enabledExtensionLinks(type) {
  if (type === "anime") return [];
  const enabled = JSON.parse(localStorage.getItem("enabled-extensions") || "{}");
  const catalog = JSON.parse(localStorage.getItem("extension-catalog") || "{}");
  return Object.values(catalog).filter((ext) => ext.type === type && enabled[String(ext.id)] && ext.url);
}

function extensionSourceCards(type) {
  if (type === "manga") return "";
  const links = enabledExtensionLinks(type);
  if (!links.length) return "";

  return `
    <div class="extension-source-list" style="display: grid; gap: 8px; margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px; font-size: 14px;">Enabled extension sources</h4>
      ${links.map((ext) => `
        <div class="source-item">
          <div class="source-info">
            <h4>${escapeHtml(ext.name)}</h4>
            <p>${escapeHtml(ext.description || "Extension source")}</p>
          </div>
          <button class="source-open-extension" data-extension-url="${escapeAttr(ext.url)}" type="button" style="padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, var(--blue), var(--mint)); color: #06101a; border: none; font-weight: 700; cursor: pointer; font-size: 12px; white-space: nowrap;">Open</button>
        </div>
      `).join("")}
    </div>
  `;
}

function bindExtensionSourceButtons(container) {
  container.querySelectorAll("[data-extension-url]").forEach((button) => {
    button.addEventListener("click", () => {
      window.open(button.dataset.extensionUrl, "_blank", "noreferrer");
      showToast("Opening extension source");
    });
  });
}

function exportLibrary() {
  const data = {
    library: state.library,
    settings: state.settings,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = create("a", "");
  a.href = url;
  a.download = `anitrack-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Library exported");
}

function importLibrary(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Object.assign(state.library, data.library || {});
      Object.assign(state.settings, data.settings || {});
      persistLibrary();
      persistSettings();
      showToast("Library imported successfully");
      setTimeout(() => location.href = "index.html", 1000);
    } catch (error) {
      showToast("Invalid backup file");
    }
  });
  reader.readAsText(file);
}

async function initPlayerPage() {
  loadHlsLibrary().catch(() => null);
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "anime";
  const apiId = params.get("id");
  const apiSource = params.get("apiSource") || "";

  let anime = null;
  let startData = null;
  let sourceMatches = [];
  try {
    anime = JSON.parse(sessionStorage.getItem("player-anime"));
    startData = JSON.parse(sessionStorage.getItem("player-start-episode") || "null");
    sourceMatches = JSON.parse(sessionStorage.getItem("player-source-matches") || "[]");
  } catch (error) {
    // Continue without cached data
  }

  if (!anime && apiId && type === "anime") {
    try {
      anime = await fetchAnimeDetails(apiId, apiSource);
    } catch (error) {
      showToast("Could not load anime details");
    }
  }

  if (!anime) {
    document.querySelector("[data-anime-title]").textContent = "Anime not found";
    return;
  }

  setupPlayerChromeControls();

  // Update page title and anime info
  document.title = `AniTrack | ${anime.title}`;
  document.querySelector("[data-anime-title]").textContent = anime.title;

  playerRuntime.anime = anime;

  let episodes = buildEpisodes(anime);
  if (sourceMatches.length && startData?.sourceId === "hstream") {
    episodes = hstreamMatchesToEpisodes(sourceMatches);
    playerRuntime.currentSourceMatches = sourceMatches;
  } else if (sourceMatches.length && ["animedex", "anizone", "anilibria", "tokyoinsider"].includes(startData?.sourceId)) {
    episodes = sourceMatches;
    playerRuntime.allSourceEpisodes = sourceMatches;
    if (startData.sourceId === "animedex") {
      const preferredAudio = episodeAudioKey(startData?.episode) || selectedAnimeEpisodeAudio(anime, sourceMatches);
      if (preferredAudio) {
        localStorage.setItem(animeAudioPreferenceKey(anime), preferredAudio);
        episodes = filterEpisodesByAudio(sourceMatches, preferredAudio);
      }
    }
  } else if (!episodes.length && startData?.episode) {
    episodes = [startData.episode];
  }
  playerRuntime.episodes = episodes;

  renderEpisodesList(episodes, anime);

  // Setup episode search
  const searchInput = document.querySelector("[data-episodes-search] input");
  const searchToggle = document.querySelector("[data-episodes-search-toggle]");
  const searchContainer = document.querySelector("[data-episodes-search]");

  searchToggle.addEventListener("click", () => {
    searchContainer.classList.toggle("show");
    if (searchContainer.classList.contains("show")) {
      searchInput.focus();
    }
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll("[data-episode-item]").forEach((item) => {
      const title = item.dataset.episodeTitle.toLowerCase();
      const number = item.dataset.episodeNumber;
      const matches = title.includes(query) || number.includes(query);
      item.style.display = matches ? "" : "none";
    });
  });

  const targetEpisode = params.get("episode") || startData?.episode?.number || "";
  const targetAudio = episodeAudioKey(startData?.episode);
  const targetButton = targetEpisode ? [...document.querySelectorAll("[data-episode-item]")].find((button) => {
    if (button.dataset.episodeNumber !== String(targetEpisode)) return false;
    if (!targetAudio) return true;
    try {
      return episodeAudioKey(JSON.parse(button.dataset.episodeData)) === targetAudio;
    } catch (error) {
      return true;
    }
  }) : null;
  const firstEpisode = targetButton || document.querySelector("[data-episode-item]");
  if (firstEpisode) firstEpisode.click();
  else {
    document.querySelector("[data-video-player]").innerHTML = '<div class="player-loading"><p>No real episodes available.</p><p class="muted" style="font-size: 12px;">Use the details page source selector when a provider exposes episode entries.</p></div>';
    document.querySelector("[data-streaming-sources]").innerHTML = '<div class="empty">No episode list was returned by AniList or the selected source.</div>';
  }
}

function filterEpisodesByAudio(episodes, audio) {
  const key = String(audio || "").toLowerCase();
  return key ? episodes.filter((episode) => episodeAudioKey(episode) === key) : episodes;
}

function buildEpisodes(anime) {
  if (anime.episodesList?.length) {
    return anime.episodesList.map((ep, index) => ({
      number: extractEpisodeNumberFromText(ep.title) || index + 1,
      title: ep.title || `Episode ${index + 1}`,
      airDate: ep.time || "TBA",
      image: ep.image || anime.banner || anime.image,
      description: ep.description || "No episode description available.",
    }));
  }

  return [];
}

function renderEpisodesList(episodes, anime) {
  const container = document.querySelector("[data-episodes-list]");
  if (!episodes.length) {
    container.innerHTML = '<div class="empty" style="min-width: 260px;">No real episode list is available for this title. Choose a source from the details page or use source search below.</div>';
    return;
  }

  container.innerHTML = episodes
    .map((ep, index) => {
      const isWatched = state.library[anime.id]?.progress >= ep.number;
      return `<button
        type="button"
        class="episode-item ${index === 0 ? "active" : ""} ${isWatched ? "watched" : ""}"
        data-episode-item
        data-episode-number="${ep.number}"
        data-episode-title="${escapeAttr(ep.title)}"
        data-episode-data="${escapeAttr(JSON.stringify(ep))}"
      >
        <span class="episode-number">Ep ${ep.number}</span>
        <h4 class="episode-title">${escapeHtml(ep.title)}</h4>
        <span class="episode-air-date">${escapeHtml([episodeAudioLabel(ep.audio), ep.airDate].filter(Boolean).join(" / "))}</span>
        ${isWatched ? '<span class="muted" style="font-size: 11px;">✓ Watched</span>' : ""}
      </button>`;
    })
    .join("");

  // Add click handlers
  container.querySelectorAll("[data-episode-item]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      container.querySelectorAll("[data-episode-item]").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      const episode = JSON.parse(btn.dataset.episodeData);
      await loadEpisode(anime, episode, btn.dataset.episodeNumber);
    });
  });
}

async function loadEpisode(anime, episode, episodeNumber) {
  const title = document.querySelector("[data-episode-title]");
  const number = document.querySelector("[data-episode-number]");
  const description = document.querySelector("[data-episode-description]");
  const sources = document.querySelector("[data-streaming-sources]");
  const videoPlayer = document.querySelector("[data-video-player]");

  title.textContent = episode.title;
  number.textContent = `Episode ${episodeNumber} of ${anime.total || "?"}`;
  description.innerHTML = `<p>${escapeHtml(episode.description)}</p>`;
  playerRuntime.currentEpisode = episode;
  playerRuntime.currentEpisodeNumber = String(episodeNumber);

  // Show loading state
  videoPlayer.innerHTML = `
    <div class="player-loading">
      <div class="spinner"></div>
      <p>Searching for streaming sources...</p>
    </div>
  `;
  sources.innerHTML = '<p class="muted">Searching sources...</p>';
  setupMarkWatchedButton(anime, episodeNumber);

  if (episode.sourceUrl) {
    sources.innerHTML = adultSourceCards([episode.sourceMatch || episode]);
    bindAdultSourceButtons(sources, { autoplayUrl: playerAutoPlayEnabled() ? episode.sourceUrl : "" });
    return;
  }

  if (["animedex", "anizone", "anilibria", "tokyoinsider"].includes(episode.source)) {
    try {
      const data = episode.source === "animedex"
        ? await fetchApiJson(`/api/anime/animedex/streams?episodeId=${encodeURIComponent(episode.episodeId || episode.id || "")}`)
        : episode.source === "tokyoinsider"
          ? await fetchApiJson(`/api/anime/tokyoinsider/streams?episodeUrl=${encodeURIComponent(episode.episodeUrl || episode.id || "")}`)
          : episode.source === "anilibria"
            ? await fetchApiJson(`/api/anime/anilibria/streams?releaseId=${encodeURIComponent(episode.providerId || "")}&episodeId=${encodeURIComponent(episode.episodeId || episode.id || "")}`)
          : await fetchApiJson(`/api/anime/anizone/streams?episodeUrl=${encodeURIComponent(episode.episodeUrl || episode.id || "")}`);
      renderDirectAnimeStreams(sources, data, episode.source, playerAutoPlayEnabled());
    } catch (error) {
      sources.innerHTML = `<div class="empty">Could not load ${escapeHtml(animeSourceLabel(episode.source))} streams for this episode.</div>`;
      videoPlayer.innerHTML = '<div class="player-loading"><p style="color: var(--red);">No playable source found</p></div>';
    }
    return;
  }

  try {
    const [aniwavesMatches, adultMatches] = await Promise.all([
      animeSourceEnabled("aniwaves") ? searchAniwavesAnime(anime.title) : [],
      animeSourceEnabled("hstream") ? searchAdultAnime(anime) : [],
    ]);
    renderStreamingSources(sources, anime, episodeNumber, aniwavesMatches, adultMatches);
  } catch (error) {
    sources.innerHTML = `
      <div class="empty" style="padding: 16px; text-align: center;">
        <p class="muted">No streams found for this episode</p>
        <p class="muted" style="font-size: 12px;">Try another enabled source from Settings.</p>
      </div>
    `;
    videoPlayer.innerHTML = `
      <div class="player-loading">
        <p style="color: var(--red);">No playable sources found</p>
        <p class="muted" style="font-size: 12px;">Check back later or try another enabled source.</p>
      </div>
    `;
  }

}

function setupMarkWatchedButton(anime, episodeNumber) {
  document.querySelector("[data-mark-watched]").onclick = () => {
    if (!state.current && anime) {
      state.current = anime;
    }
    const progress = document.querySelector("[data-track-progress]");
    if (progress) {
      progress.value = episodeNumber;
    }
    state.library[anime.id] = state.library[anime.id] || anime;
    state.library[anime.id].progress = Math.max(
      state.library[anime.id].progress || 0,
      Number(episodeNumber)
    );
    state.library[anime.id].status = "watching";
    state.library[anime.id].updatedAt = Date.now();
    persistLibrary();
    document.querySelector(`[data-episode-item][data-episode-number="${episodeNumber}"]`)?.classList.add("watched");
    showToast(`Marked Episode ${episodeNumber} as watched`);
  };
}

async function searchAniwavesAnime(animeTitle) {
  try {
    return await fetchApiJson(`/api/anime/search?title=${encodeURIComponent(animeTitle)}`);
  } catch (error) {
    return [];
  }
}

async function searchAdultAnime(anime) {
  if (!state.settings.allowAdult) return [];
  const titles = uniqueStrings([anime?.sourceQuery, ...animeTitleCandidates(anime)]).filter(Boolean);
  const seen = new Set();
  const results = [];

  for (const title of titles) {
    try {
      const matches = await fetchApiJson(`/api/adult/search?title=${encodeURIComponent(title)}`);
      for (const match of matches) {
        const key = match.url || match.id || match.title;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        results.push(match);
      }
    } catch (error) {
      // Try the next AniList title variant.
    }
  }

  return results.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
}

function animeTitleCandidates(anime) {
  const titles = uniqueStrings([
    anime?.romajiTitle,
    anime?.nativeTitle,
    ...(anime?.alternativeTitles || []),
    anime?.title,
    anime?.englishTitle,
  ]).filter((title) => title.length > 1);
  return uniqueStrings(titles.flatMap((title) => [...animeTitleSearchVariants(title), title, ...romajiSpacingVariants(title)]));
}

function animeTitleSearchVariants(title) {
  const value = String(title || "").replace(/[\uFFFD]+/g, "").replace(/\s+/g, " ").trim();
  if (!value) return [];
  const variants = [value];
  const noYear = value.replace(/\s*\((?:19|20)\d{2}\)\s*$/i, "").trim();
  const noSeason = value.replace(/\b(?:season|part)\s*\d+\b/gi, "").replace(/\s+/g, " ").trim();
  const noOrdinalSeason = value.replace(/\b\d+(?:st|nd|rd|th)\s+season\b/gi, "").replace(/\s+/g, " ").trim();
  const noTrailingMarks = value.replace(/[.'\u2019`\u00B4\u00B0]+$/g, "").trim();
  const beforeColon = value.split(/[:\uFF1A]/)[0]?.trim();
  variants.push(noYear, noSeason, noOrdinalSeason, noTrailingMarks, beforeColon);
  return uniqueStrings(variants).filter((item) => item.length > 1);
}

function romajiSpacingVariants(title) {
  const token = String(title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!token || token.length < 7 || token.length > 28 || /\d/.test(token)) return [];
  const words = ["ai", "aki", "ane", "ao", "asa", "boku", "doki", "doro", "fuyu", "gaku", "haha", "hana", "haru", "hime", "hoshi", "inu", "koi", "kono", "kuro", "machi", "mahou", "mama", "mono", "mura", "natsu", "neko", "onna", "otome", "sensei", "shiro", "sora", "tsuma", "uma", "umi", "yama", "yoru", "yume", "zuma"];
  const variants = [];
  for (const word of words) {
    if (token.startsWith(word) && token.length - word.length >= 3) variants.push(`${word} ${token.slice(word.length)}`);
    if (token.endsWith(word) && token.length - word.length >= 3) variants.push(`${token.slice(0, -word.length)} ${word}`);
  }
  return uniqueStrings(variants).slice(0, 4);
}

function renderStreamingSources(container, anime, episodeNumber, aniwavesMatches = [], adultMatches = []) {
  const extensionHtml = extensionSourceCards("anime");
  const aniwavesHtml = aniwavesSourceCards(aniwavesMatches, episodeNumber);
  const adultHtml = adultSourceCards(adultMatches);
  if (!aniwavesMatches.length && !adultMatches.length) {
    container.innerHTML = `
      ${extensionHtml}
      ${aniwavesHtml}
      ${adultHtml}
      <div class="empty" style="padding: 16px; text-align: center;">
        <p class="muted">No sources available</p>
        <p class="muted" style="font-size: 12px;">Try AnimeDex/AniZone on the details page, or enable another provider in Settings.</p>
      </div>
    `;
    bindExtensionSourceButtons(container);
    bindAniwavesSourceButtons(container);
    bindAdultSourceButtons(container);
    document.querySelector("[data-video-player]").innerHTML = `
      <div class="player-loading">
        <p style="color: var(--red);">No provider sources found</p>
        <p class="muted" style="font-size: 12px;">Try another episode or search the title manually.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `${extensionHtml}${aniwavesHtml}${adultHtml}`;

  // Add play button handlers
  bindExtensionSourceButtons(container);
  bindAniwavesSourceButtons(container);
  bindAdultSourceButtons(container);
  document.querySelector("[data-video-player]").innerHTML = `
    <div class="player-loading">
      <p>Select a source above</p>
      <p class="muted" style="font-size: 12px;">Provider links may open externally when raw browser-playable streams are not available.</p>
    </div>
  `;
}

function aniwavesSourceCards(matches, episodeNumber) {
  if (!matches.length) return "";
  return `
    <div class="aniwaves-source-list" style="display: grid; gap: 8px; margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px; font-size: 14px;">Aniwaves matches</h4>
      ${matches.slice(0, 5).map((match) => {
        const meta = [match.type, match.date, match.rating].filter(Boolean).join(" / ");
        return `
          <div class="source-item">
            <div class="source-info">
              <h4>${escapeHtml(match.title || "Aniwaves")}</h4>
              <p>${escapeHtml(meta || "Open provider page")}</p>
              <p style="font-size: 11px; margin-top: 4px;">${escapeHtml(episodeNumber ? `Select episode ${episodeNumber} on Aniwaves` : "Episode selection opens on Aniwaves")}</p>
            </div>
            <button class="source-open-aniwaves" data-aniwaves-url="${escapeAttr(match.url)}" type="button" style="padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, var(--blue), var(--mint)); color: #06101a; border: none; font-weight: 700; cursor: pointer; font-size: 12px; white-space: nowrap;">Open</button>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function bindAniwavesSourceButtons(container) {
  container.querySelectorAll("[data-aniwaves-url]").forEach((button) => {
    button.addEventListener("click", () => {
      window.open(button.dataset.aniwavesUrl, "_blank", "noreferrer");
      showToast("Opening Aniwaves match");
    });
  });
}

function renderDirectAnimeStreams(container, data, provider, autoplay = false) {
  const streams = Array.isArray(data.sources) ? data.sources.filter((source) => source?.url) : [];
  if (!streams.length) {
    container.innerHTML = `<div class="empty">No playable ${escapeHtml(animeSourceLabel(provider))} streams returned.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="scrollable-source-section">
      <div class="source-section-head"><h4>${escapeHtml(animeSourceLabel(provider))} streams</h4><span>${streams.length} source${streams.length === 1 ? "" : "s"}</span></div>
      <div class="source-scroll-list">
        ${streams.map((stream, index) => `
          <div class="source-item">
            <div class="source-info">
              <h4>${escapeHtml(stream.quality || stream.name || `Source ${index + 1}`)}</h4>
              <p>${escapeHtml(stream.isHLS || String(stream.url).includes(".m3u8") ? "HLS stream" : "Direct stream")}</p>
            </div>
            <button class="source-play-direct" data-direct-stream-index="${index}" type="button" style="padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, var(--blue), var(--mint)); color: #06101a; border: none; font-weight: 700; cursor: pointer; font-size: 12px; white-space: nowrap;">Play</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  container.querySelectorAll("[data-direct-stream-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.directStreamIndex);
      const stream = streams[index];
      savePreferredQualityFromSource(stream);
      playHttpStream(stream.url, stream.tracks || data.tracks || [], { sources: streams, currentIndex: index });
    });
  });

  if (autoplay) {
    const index = preferredSourceIndex(streams);
    const stream = streams[index] || streams[0];
    playHttpStream(stream.url, stream.tracks || data.tracks || [], { sources: streams, currentIndex: index });
  }
}

function adultSourceCards(matches) {
  if (!state.settings.allowAdult || !matches.length) return "";
  return `
    <div class="adult-source-list scrollable-source-section">
      <div class="source-section-head"><h4>Adult sources</h4><span>${matches.length} match${matches.length === 1 ? "" : "es"}</span></div>
      <div class="source-scroll-list">
      ${matches.map((match) => `
        <div class="source-item">
          <div class="source-info">
            <h4 style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">${escapeHtml(match.title || "hstream")} <span style="display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 7px; background: color-mix(in srgb, var(--pink) 24%, transparent); color: var(--pink); border: 1px solid color-mix(in srgb, var(--pink) 55%, transparent); font-size: 10px; font-weight: 900; letter-spacing: 0.04em;">+18</span></h4>
            <p>${escapeHtml(["hstream.moe", match.quality].filter(Boolean).join(" / ") || "Direct browser-playable source")}</p>
          </div>
          <button class="source-play-adult" data-hstream-url="${escapeAttr(match.url)}" type="button" style="padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, var(--pink), var(--blue)); color: #06101a; border: none; font-weight: 700; cursor: pointer; font-size: 12px; white-space: nowrap;">Load</button>
        </div>
      `).join("")}
      </div>
    </div>
  `;
}

function bindAdultSourceButtons(container, options = {}) {
  container.querySelectorAll("[data-hstream-url]").forEach((button) => {
    button.addEventListener("click", async () => {
      const url = button.dataset.hstreamUrl;
      const item = button.closest(".source-item");
      button.disabled = true;
      button.textContent = "Loading";
      try {
        const data = await fetchApiJson(`/api/adult/streams?url=${encodeURIComponent(url)}`);
        const sources = Array.isArray(data.sources) ? data.sources : [];
        if (!sources.length) throw new Error("No direct sources returned");
        const sourceList = document.createElement("div");
        sourceList.className = "source-direct-list";
        sourceList.style.cssText = "display: grid; gap: 6px; margin: -4px 0 8px 0;";
        sourceList.innerHTML = sources.map((source, index) => `
          <button class="source-play-direct" data-adult-stream-index="${index}" type="button" style="padding: 7px 12px; border-radius: 8px; background: rgba(255,255,255,0.08); color: var(--text); border: 1px solid var(--line); font-weight: 700; cursor: pointer; font-size: 12px; text-align: left;">Play ${escapeHtml(source.quality || source.name || "stream")}</button>
        `).join("");
        item?.nextElementSibling?.classList?.contains("source-direct-list") && item.nextElementSibling.remove();
        item?.after(sourceList);
        sourceList.querySelectorAll("[data-adult-stream-index]").forEach((sourceButton) => {
          sourceButton.addEventListener("click", () => {
            const source = sources[Number(sourceButton.dataset.adultStreamIndex)];
            savePreferredQualityFromSource(source);
            playHttpStream(source.url, source.tracks || data.tracks || [], { sources, currentIndex: Number(sourceButton.dataset.adultStreamIndex) });
          });
        });
        button.textContent = "Loaded";
        showToast("hstream sources loaded");
        if (options.autoplayUrl === url) {
          const preferredIndex = preferredSourceIndex(sources);
          const source = sources[preferredIndex] || sources[0];
          playHttpStream(source.url, source.tracks || data.tracks || [], { sources, currentIndex: preferredIndex });
        }
      } catch (error) {
        button.disabled = false;
        button.textContent = "Retry";
        showToast("Could not load hstream sources");
      }
    });
  });
  if (options.autoplayUrl) {
    [...container.querySelectorAll("[data-hstream-url]")].find((button) => button.dataset.hstreamUrl === options.autoplayUrl)?.click();
  }
}

function preferredSourceIndex(sources) {
  const preferred = state.settings.preferredQuality || "auto";
  if (!preferred || preferred === "auto") return bestAvailableSourceIndex(sources);
  const normalizedPreferred = normalizeQualityPreference(preferred);
  const index = sources.findIndex((source) => {
    const sourceText = sourceQualityText(source).toLowerCase();
    const sourceQuality = normalizeQualityPreference(sourceText);
    return sourceQuality === normalizedPreferred || sourceText.includes(String(preferred).toLowerCase());
  });
  return index >= 0 ? index : bestAvailableSourceIndex(sources);
}

function bestAvailableSourceIndex(sources) {
  const ranked = sources
    .map((source, index) => ({ index, quality: Number((normalizeQualityPreference(sourceQualityText(source)).match(/\d+/) || [0])[0]) }))
    .filter((item) => item.quality > 0)
    .sort((a, b) => b.quality - a.quality);
  return ranked[0]?.index || 0;
}

function sourceQualityText(source) {
  return String(source?.quality || source?.name || source?.label || "");
}

function normalizeQualityPreference(value) {
  const text = String(value || "").toLowerCase();
  const match = text.match(/(2160|1440|1080|720|480|360|240)\s*p?/);
  return match ? `${match[1]}p` : text.trim();
}

function qualityPreferenceForSource(source) {
  const normalized = normalizeQualityPreference(sourceQualityText(source));
  return /^\d+p$/.test(normalized) ? normalized : "";
}

function savePreferredQualityFromSource(source) {
  const preference = qualityPreferenceForSource(source);
  if (!preference) return;
  state.settings.preferredQuality = preference;
  persistSettings();
}

function playerAutoPlayEnabled() {
  return state.settings.autoPlay !== false;
}

async function playHttpStream(url, tracks = [], options = {}) {
  const player = document.querySelector("[data-video-player]");
  const resumeState = options.resumeState || playerRuntime.resumeState || null;
  playerRuntime.resumeState = null;
  const streamToken = ++playerRuntime.streamToken;
  destroyActiveStreamEngines();
  player.innerHTML = `
    <video data-active-video playsinline crossorigin="anonymous" preload="auto" style="width: 100%; height: 100%; background: #000;"></video>
    <div class="player-buffering" data-player-buffering>
      <div class="spinner"></div>
      <span>Loading video...</span>
    </div>
    <button class="video-center-skip video-center-skip-back" data-video-skip-back type="button" aria-label="Skip back 10 seconds">↶10</button>
    <button class="video-center-toggle" data-video-center-toggle type="button" aria-label="Play or pause">▶</button>
    <button class="video-center-skip video-center-skip-forward" data-video-skip-forward type="button" aria-label="Skip forward 10 seconds">10↷</button>
    <div class="custom-video-controls" data-custom-video-controls>
      <button class="video-control-btn" data-video-play type="button" aria-label="Play or pause">▶</button>
      <div class="video-volume-control" data-video-volume-control>
        <button class="video-control-btn" data-video-mute type="button" aria-label="Mute or unmute">♪</button>
        <div class="video-volume-panel" data-video-volume-panel hidden>
          <input class="video-volume" data-video-volume type="range" min="0" max="1" value="1" step="0.01" aria-label="Volume">
        </div>
      </div>
      <span class="video-time video-time-range"><span data-video-current>0:00</span> / <span data-video-duration>0:00</span></span>
      <input class="video-progress" data-video-progress type="range" min="0" max="1000" value="0" step="1" aria-label="Seek">
      <button class="video-control-btn" data-video-captions type="button" aria-label="Toggle captions">CC</button>
      <button class="video-control-btn" data-video-settings type="button" aria-label="Player settings">⚙</button>
      <button class="video-control-btn" data-video-fullscreen type="button" aria-label="Fullscreen">⛶</button>
    </div>
    <div class="player-settings-panel" data-player-settings-panel hidden>
      <label>Quality <select data-player-quality><option value="">Auto / selected source</option></select></label>
      <label>Speed <select data-player-speed><option value="0.5">0.5x</option><option value="0.75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></label>
      <label>Subtitles <select data-player-subtitles><option value="off">Off</option></select></label>
      <label>Audio <select data-player-audio><option value="default">Default audio</option></select></label>
      <div class="player-check-row">
        <label class="player-check"><input data-player-auto-play type="checkbox"> Auto play</label>
        <label class="player-check"><input data-player-auto-next type="checkbox"> Auto next</label>
      </div>
    </div>
  `;
  setSubtitleToggleAvailable(false);
  const video = player.querySelector("[data-active-video]");
  const shouldAutoplay = !resumeState?.paused;
  const sourceOptions = Array.isArray(options.sources) ? options.sources : [{ url, name: "Current stream", tracks }];
  const currentIndex = Number.isFinite(Number(options.currentIndex)) ? Number(options.currentIndex) : Math.max(0, sourceOptions.findIndex((source) => source.url === url));
  setupCustomVideoControls(video);
  setupCustomSubtitles(video, tracks);
  setupPlayerSettingsControls(video, tracks, sourceOptions, currentIndex);
  setupVideoBufferingState(video, resumeState);

  video.addEventListener("error", () => {
    renderPlayerFallback(url);
  }, { once: true });
  video.addEventListener("ended", handlePlayerEnded);

  const isHls = url.includes(".m3u8") || url.includes("application/vnd.apple.mpegurl");
  const isDash = url.includes(".mpd") || url.includes("application/dash+xml");

  if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.load();
    if (shouldAutoplay) schedulePlayerAutoplay(video, streamToken);
    showToast("Loading HLS stream");
    return;
  }

  if (isHls) {
    try {
      await loadHlsLibrary();
      if (window.Hls?.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 60, maxBufferLength: 30 });
        playerRuntime.hls = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => { if (shouldAutoplay) schedulePlayerAutoplay(video, streamToken); });
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            hls.destroy();
            video.dispatchEvent(new Event("error"));
          }
        });
        showToast("Loading HLS stream");
        return;
      }
    } catch (error) {
      video.dispatchEvent(new Event("error"));
      return;
    }
  }

  if (isDash) {
    try {
      await loadDashLibrary();
      if (window.dashjs) {
        const dashPlayer = window.dashjs.MediaPlayer().create();
        playerRuntime.dash = dashPlayer;
        dashPlayer.initialize(video, url, false);
        const dashReadyEvent = window.dashjs.MediaPlayer.events.STREAM_INITIALIZED || window.dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED;
        if (dashReadyEvent) dashPlayer.on(dashReadyEvent, () => { if (shouldAutoplay) schedulePlayerAutoplay(video, streamToken); });
        if (shouldAutoplay) schedulePlayerAutoplay(video, streamToken);
        dashPlayer.on(window.dashjs.MediaPlayer.events.ERROR, () => renderPlayerFallback(url));
        showToast("Loading DASH stream");
        return;
      }
    } catch (error) {
      video.dispatchEvent(new Event("error"));
      return;
    }
  }

  video.src = url;
  video.load();
  if (shouldAutoplay) schedulePlayerAutoplay(video, streamToken);
  showToast("Loading stream");
}

function setupVideoBufferingState(video, resumeState = null) {
  const player = video.closest("[data-video-player]");
  const overlay = player?.querySelector("[data-player-buffering]");
  if (!player || !overlay) return;
  let restored = false;

  const show = (label = "Buffering...") => {
    overlay.querySelector("span").textContent = label;
    player.classList.add("is-buffering");
  };
  const hide = () => player.classList.remove("is-buffering");
  const restore = async () => {
    if (restored || !resumeState) return;
    const time = Math.max(0, Number(resumeState.time) || 0);
    if (time > 0 && Number.isFinite(video.duration)) video.currentTime = Math.min(time, Math.max(0, video.duration - 0.5));
    restored = true;
    if (!resumeState.paused) {
      try { await video.play(); } catch (error) {}
    }
  };

  show("Loading video...");
  video.addEventListener("loadedmetadata", restore, { once: true });
  video.addEventListener("canplay", () => { hide(); restore(); });
  video.addEventListener("playing", hide);
  video.addEventListener("waiting", () => show("Buffering..."));
  video.addEventListener("stalled", () => show("Reconnecting..."));
  video.addEventListener("seeking", () => show("Seeking..."));
  video.addEventListener("seeked", hide);
  video.addEventListener("error", () => show("Could not load video"));
}

function capturePlaybackState(video) {
  return {
    time: Number.isFinite(video?.currentTime) ? video.currentTime : 0,
    paused: video?.paused !== false,
  };
}

function schedulePlayerAutoplay(video, streamToken) {
  if (!playerAutoPlayEnabled()) return;
  const attempt = () => attemptPlayerAutoplay(video, streamToken);
  video.addEventListener("loadedmetadata", attempt, { once: true });
  video.addEventListener("canplay", attempt, { once: true });
  setTimeout(attempt, 250);
}

async function attemptPlayerAutoplay(video, streamToken) {
  if (!video || streamToken !== playerRuntime.streamToken || !playerAutoPlayEnabled()) return;
  try {
    await video.play();
  } catch (error) {
    if (error?.name === "NotAllowedError") {
      try {
        video.muted = true;
        await video.play();
        showToast("Autoplay started muted by browser policy");
      } catch (mutedError) {
        // Browser still blocked autoplay; leave the play button visible.
      }
    }
  }
}

function destroyActiveStreamEngines() {
  try { playerRuntime.hls?.destroy?.(); } catch (error) {}
  try { playerRuntime.dash?.reset?.(); } catch (error) {}
  playerRuntime.hls = null;
  playerRuntime.dash = null;
}

function setupCustomVideoControls(video) {
  const player = video.closest("[data-video-player]");
  const wrapper = document.querySelector(".video-wrapper");
  const controls = player?.querySelector("[data-custom-video-controls]");
  if (!player || !controls) return;

  const play = controls.querySelector("[data-video-play]");
  const centerToggle = player.querySelector("[data-video-center-toggle]");
  const skipBack = player.querySelector("[data-video-skip-back]");
  const skipForward = player.querySelector("[data-video-skip-forward]");
  const progress = controls.querySelector("[data-video-progress]");
  const current = controls.querySelector("[data-video-current]");
  const duration = controls.querySelector("[data-video-duration]");
  const settings = controls.querySelector("[data-video-settings]");
  const mute = controls.querySelector("[data-video-mute]");
  const volumeControl = controls.querySelector("[data-video-volume-control]");
  const volumePanel = controls.querySelector("[data-video-volume-panel]");
  const volume = controls.querySelector("[data-video-volume]");
  const captions = controls.querySelector("[data-video-captions]");
  const fullscreen = controls.querySelector("[data-video-fullscreen]");
  const panel = document.querySelector("[data-player-settings-panel]");
  let seeking = false;
  let hideTimer = null;
  let emptyPointerStartedIdle = null;

  const hideVolumePanel = () => {
    if (!volumePanel) return;
    volumePanel.hidden = true;
    volumeControl?.classList.remove("volume-open");
  };

  const showVolumePanel = () => {
    if (!volumePanel) return;
    hidePlayerSettingsPanel();
    volumePanel.hidden = false;
    volumeControl?.classList.add("volume-open");
    showControls();
  };

  const toggleVolumePanel = () => {
    if (!volumePanel) return;
    if (volumePanel.hidden) showVolumePanel();
    else hideVolumePanel();
    showControls();
  };

  const hideControls = () => {
    clearTimeout(hideTimer);
    player.classList.add("video-controls-idle");
    hidePlayerSettingsPanel();
    hideVolumePanel();
  };

  const showControls = () => {
    player.classList.remove("video-controls-idle");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      player.classList.add("video-controls-idle");
      hidePlayerSettingsPanel();
      hideVolumePanel();
    }, 2400);
  };

  const update = () => {
    const total = Number.isFinite(video.duration) ? video.duration : 0;
    const now = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    if (current) current.textContent = formatPlayerTime(now);
    if (duration) duration.textContent = formatPlayerTime(total);
    if (progress && !seeking) progress.value = total ? String(Math.round((now / total) * 1000)) : "0";
    if (play) play.textContent = video.paused ? "▶" : "❚❚";
    if (centerToggle) centerToggle.textContent = video.paused ? "▶" : "❚❚";
    if (mute) mute.textContent = video.muted || video.volume === 0 ? "×" : "♪";
    if (volume) volume.value = String(video.muted ? 0 : video.volume);
    player.classList.toggle("is-paused", video.paused);
    const subtitleToggle = document.querySelector("[data-subtitle-toggle]");
    if (captions) {
      captions.disabled = !subtitleToggle || subtitleToggle.hidden || subtitleToggle.disabled;
      captions.classList.toggle("active", Boolean(subtitleToggle?.classList.contains("active")));
    }
  };

  const togglePlayback = async () => {
    if (video.paused) {
      try { await video.play(); } catch (error) {}
    } else {
      video.pause();
    }
    showControls();
  };

  play?.addEventListener("click", togglePlayback);
  centerToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePlayback();
  });
  skipBack?.addEventListener("click", (event) => {
    event.stopPropagation();
    video.currentTime = Math.max(0, video.currentTime - 10);
    showControls();
  });
  skipForward?.addEventListener("click", (event) => {
    event.stopPropagation();
    video.currentTime = Math.min(Number.isFinite(video.duration) ? video.duration : video.currentTime + 10, video.currentTime + 10);
    showControls();
  });

  const isEmptyPlayerTarget = (event) => !event.target.closest?.("button, input, select, .custom-video-controls, .video-volume-panel, .player-settings-panel");

  player.addEventListener("pointerdown", (event) => {
    emptyPointerStartedIdle = isEmptyPlayerTarget(event) ? player.classList.contains("video-controls-idle") : null;
  });

  player.addEventListener("click", (event) => {
    if (!isEmptyPlayerTarget(event)) return;
    const wasIdle = emptyPointerStartedIdle ?? player.classList.contains("video-controls-idle");
    emptyPointerStartedIdle = null;
    if (wasIdle) showControls();
    else hideControls();
  });

  progress?.addEventListener("input", () => {
    seeking = true;
    const total = Number.isFinite(video.duration) ? video.duration : 0;
    if (total) video.currentTime = (Number(progress.value) / 1000) * total;
    showControls();
  });
  progress?.addEventListener("change", () => {
    seeking = false;
    update();
    showControls();
  });

  mute?.addEventListener("click", () => {
    toggleVolumePanel();
  });
  volume?.addEventListener("input", () => {
    video.volume = Math.max(0, Math.min(1, Number(volume.value) || 0));
    video.muted = video.volume === 0;
    update();
    showVolumePanel();
    showControls();
  });
  fullscreen?.addEventListener("click", () => document.querySelector("[data-fullscreen-btn]")?.click());
  captions?.addEventListener("click", () => {
    document.querySelector("[data-subtitle-toggle]")?.click();
    update();
    showControls();
  });
  settings?.addEventListener("click", () => {
    hideVolumePanel();
    document.querySelector("[data-player-settings-toggle]")?.click();
    showControls();
  });
  volumeControl?.addEventListener("mousemove", showControls);
  setupPlayerKeyboardControls(video, showControls);

  ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "volumechange"].forEach((event) => video.addEventListener(event, update));
  player.addEventListener("mousemove", showControls);
  player.addEventListener("touchstart", showControls, { passive: true });
  panel?.addEventListener("mousemove", showControls);
  panel?.addEventListener("touchstart", showControls, { passive: true });
  panel?.addEventListener("focusin", showControls);
  wrapper?.addEventListener("fullscreenchange", showControls);
  update();
  showControls();
}

function setupPlayerKeyboardControls(video, showControls) {
  if (playerRuntime.keyboardHandler) document.removeEventListener("keydown", playerRuntime.keyboardHandler);
  playerRuntime.keyboardHandler = async (event) => {
    const target = event.target;
    if (target?.matches?.("input, textarea, select, button")) return;
    const key = event.key.toLowerCase();
    if ([" ", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(event.key.toLowerCase()) || event.code === "Space") event.preventDefault();
    if (event.code === "Space" || key === "k") {
      if (video.paused) {
        try { await video.play(); } catch (error) {}
      } else video.pause();
    } else if (key === "arrowleft") {
      video.currentTime = Math.max(0, video.currentTime - 10);
    } else if (key === "arrowright") {
      video.currentTime = Math.min(Number.isFinite(video.duration) ? video.duration : video.currentTime + 10, video.currentTime + 10);
    } else if (key === "arrowup") {
      video.volume = Math.min(1, video.volume + 0.05);
      video.muted = false;
    } else if (key === "arrowdown") {
      video.volume = Math.max(0, video.volume - 0.05);
      video.muted = video.volume === 0;
    } else if (key === "m") {
      video.muted = !video.muted;
    } else if (key === "f") {
      document.querySelector("[data-fullscreen-btn]")?.click();
    } else if (key === "c") {
      document.querySelector("[data-subtitle-toggle]")?.click();
    } else if (key === ",") {
      video.playbackRate = Math.max(0.25, video.playbackRate - 0.25);
    } else if (key === ".") {
      video.playbackRate = Math.min(3, video.playbackRate + 0.25);
    } else return;
    showControls();
  };
  document.addEventListener("keydown", playerRuntime.keyboardHandler);
}

function hidePlayerSettingsPanel() {
  const panel = document.querySelector("[data-player-settings-panel]");
  const toggle = document.querySelector("[data-player-settings-toggle]");
  const player = document.querySelector("[data-video-player]");
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  panel.inert = true;
  toggle?.setAttribute("aria-expanded", "false");
  player?.classList.remove("player-settings-open");
}

function formatPlayerTime(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const remaining = value % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`
    : `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function setupPlayerSettingsControls(video, tracks = [], sources = [], currentIndex = 0) {
  const toggle = document.querySelector("[data-player-settings-toggle]");
  const panel = document.querySelector("[data-player-settings-panel]");
  const quality = document.querySelector("[data-player-quality]");
  const speed = document.querySelector("[data-player-speed]");
  const subtitles = document.querySelector("[data-player-subtitles]");
  const audio = document.querySelector("[data-player-audio]");
  const autoPlay = document.querySelector("[data-player-auto-play]");
  const autoNext = document.querySelector("[data-player-auto-next]");

  if (toggle && panel) {
    toggle.onclick = () => {
      const isHidden = panel.hidden;
      panel.hidden = !isHidden;
      panel.inert = !isHidden;
      toggle.setAttribute("aria-expanded", String(isHidden));
      video.closest("[data-video-player]")?.classList.toggle("player-settings-open", isHidden);
    };
  }

  if (quality) {
    quality.innerHTML = sources.length ? sources.map((source, index) => `<option value="${index}">${escapeHtml(source.quality || source.name || `Source ${index + 1}`)}</option>`).join("") : '<option value="">Auto / selected source</option>';
    quality.value = String(Math.max(0, currentIndex));
    quality.disabled = sources.length <= 1;
    quality.onchange = () => {
      const nextSource = sources[Number(quality.value)];
      if (!nextSource?.url || nextSource.url === video.currentSrc) return;
      savePreferredQualityFromSource(nextSource);
      playHttpStream(nextSource.url, nextSource.tracks || tracks, { sources, currentIndex: Number(quality.value), resumeState: capturePlaybackState(video) });
    };
  }

  if (speed) {
    speed.value = state.settings.playerSpeed || "1";
    video.playbackRate = Number(speed.value) || 1;
    speed.onchange = () => {
      video.playbackRate = Number(speed.value) || 1;
      state.settings.playerSpeed = speed.value;
      persistSettings();
    };
  }

  if (subtitles) {
    subtitles.innerHTML = '<option value="off">Off</option>' + tracks.filter((track) => track?.url).map((track, index) => `<option value="${index}">${escapeHtml(track.label || track.srclang || `Subtitle ${index + 1}`)}</option>`).join("");
    subtitles.value = tracks.some((track) => track?.url) ? "0" : "off";
    subtitles.disabled = !tracks.some((track) => track?.url);
    subtitles.onchange = () => video.dispatchEvent(new CustomEvent("player-subtitle-change", { detail: subtitles.value }));
  }

  if (audio) {
    const animeDexAudioVersions = animeDexAudioVersionsForCurrentEpisode();
    if (animeDexAudioVersions.length) {
      const currentAudio = episodeAudioKey(playerRuntime.currentEpisode) || episodeAudioKey(animeDexAudioVersions[0]);
      audio.innerHTML = animeDexAudioVersions.map((episode) => {
        const value = episodeAudioKey(episode);
        return `<option value="${escapeAttr(value)}">${escapeHtml(episodeAudioLabel(value))}</option>`;
      }).join("");
      audio.value = currentAudio;
      audio.disabled = animeDexAudioVersions.length <= 1;
      audio.onchange = () => switchAnimeDexAudioVersion(audio.value);
    } else {
    const renderAudioTracks = () => {
      const audioTracks = video.audioTracks ? Array.from(video.audioTracks) : [];
      audio.innerHTML = '<option value="default">Default audio</option>' + audioTracks.map((track, index) => `<option value="${index}">${escapeHtml(track.label || track.language || `Track ${index + 1}`)}</option>`).join("");
      audio.disabled = !audioTracks.length;
    };
    renderAudioTracks();
    video.addEventListener("loadedmetadata", renderAudioTracks, { once: true });
    audio.onchange = () => {
      if (!video.audioTracks || audio.value === "default") return;
      Array.from(video.audioTracks).forEach((track, index) => { track.enabled = String(index) === audio.value; });
    };
    }
  }

  if (autoPlay) {
    playerRuntime.autoPlay = playerAutoPlayEnabled();
    autoPlay.checked = playerRuntime.autoPlay;
    autoPlay.onchange = () => {
      playerRuntime.autoPlay = autoPlay.checked;
      state.settings.autoPlay = autoPlay.checked;
      persistSettings();
    };
  }

  if (autoNext) {
    playerRuntime.autoNext = Boolean(state.settings.autoPlayNext);
    autoNext.checked = playerRuntime.autoNext;
    autoNext.onchange = () => {
      playerRuntime.autoNext = autoNext.checked;
      state.settings.autoPlayNext = autoNext.checked;
      persistSettings();
    };
  }
}

function animeDexAudioVersionsForCurrentEpisode() {
  if (playerRuntime.currentEpisode?.source !== "animedex") return [];
  const currentNumber = String(playerRuntime.currentEpisode?.number || playerRuntime.currentEpisodeNumber || "");
  const episodes = playerRuntime.allSourceEpisodes.length ? playerRuntime.allSourceEpisodes : playerRuntime.episodes;
  const versions = episodes.filter((episode) => String(episode.number || "") === currentNumber && episodeAudioKey(episode));
  const seen = new Set();
  return versions.filter((episode) => {
    const key = episodeAudioKey(episode);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function switchAnimeDexAudioVersion(audio) {
  const key = String(audio || "").toLowerCase();
  const currentNumber = String(playerRuntime.currentEpisode?.number || playerRuntime.currentEpisodeNumber || "");
  const allEpisodes = playerRuntime.allSourceEpisodes.length ? playerRuntime.allSourceEpisodes : playerRuntime.episodes;
  const nextEpisode = allEpisodes.find((episode) => String(episode.number || "") === currentNumber && episodeAudioKey(episode) === key);
  if (!nextEpisode) return;
  playerRuntime.resumeState = capturePlaybackState(document.querySelector("[data-active-video]"));
  localStorage.setItem(animeAudioPreferenceKey(playerRuntime.anime || {}), key);
  const filtered = filterEpisodesByAudio(allEpisodes, key);
  playerRuntime.episodes = filtered;
  renderEpisodesList(filtered, playerRuntime.anime);
  const button = [...document.querySelectorAll("[data-episode-item]")].find((item) => item.dataset.episodeNumber === currentNumber);
  if (button) button.click();
  else loadEpisode(playerRuntime.anime, nextEpisode, nextEpisode.number);
}

function handlePlayerEnded() {
  if (!playerRuntime.autoNext) return;
  const current = document.querySelector("[data-episode-item].active");
  const visible = [...document.querySelectorAll("[data-episode-item]")].filter((item) => item.style.display !== "none");
  const currentIndex = current ? visible.indexOf(current) : -1;
  const currentNumber = Number.parseFloat(playerRuntime.currentEpisodeNumber || current?.dataset.episodeNumber || "");
  const numbered = visible
    .map((item) => ({ item, number: Number.parseFloat(item.dataset.episodeNumber || "") }))
    .filter((entry) => Number.isFinite(entry.number));
  const nextByNumber = Number.isFinite(currentNumber)
    ? visible
      .map((item) => ({ item, number: Number.parseFloat(item.dataset.episodeNumber || "") }))
      .filter((entry) => Number.isFinite(entry.number) && entry.number > currentNumber)
      .sort((a, b) => a.number - b.number)[0]?.item
    : null;
  if (Number.isFinite(currentNumber) && numbered.length && currentNumber >= Math.max(...numbered.map((entry) => entry.number))) {
    renderCaughtUpPlayerMessage();
    return;
  }
  const next = nextByNumber || (currentIndex >= 0 ? visible[currentIndex + 1] : null);
  if (next) {
    next.click();
    return;
  }
  renderCaughtUpPlayerMessage();
}

function renderCaughtUpPlayerMessage() {
  playerRuntime.streamToken++;
  destroyActiveStreamEngines();
  const player = document.querySelector("[data-video-player]");
  if (player) {
    player.innerHTML = `
      <div class="player-loading">
        <p>You're all caught up.</p>
        <p class="muted" style="font-size: 12px;">There is no next episode available for this source.</p>
      </div>
    `;
  }
  showToast("You're all caught up");
}

function setupPlayerChromeControls() {
  const fullscreen = document.querySelector("[data-fullscreen-btn]");
  const wrapper = document.querySelector(".video-wrapper");
  let hideTimer = null;

  const showFullscreenChrome = () => {
    if (!wrapper?.classList.contains("player-fullscreen")) return;
    wrapper.classList.remove("player-fs-idle");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!document.querySelector("[data-player-settings-panel]")?.hidden) return;
      wrapper.classList.add("player-fs-idle");
    }, 2200);
  };

  const syncFullscreenState = async () => {
    const active = document.fullscreenElement;
    const video = document.querySelector("[data-active-video]");
    if (active && active === video && wrapper && document.fullscreenEnabled) {
      try {
        await document.exitFullscreen();
        await wrapper.requestFullscreen();
      } catch (error) {
        showToast("Use the AniTrack fullscreen button for subtitles");
      }
      return;
    }
    wrapper?.classList.toggle("player-fullscreen", active === wrapper);
    wrapper?.classList.remove("player-fs-idle");
    if (active === wrapper) showFullscreenChrome();
    else clearTimeout(hideTimer);
  };

  if (fullscreen) {
    fullscreen.onclick = async () => {
      const target = wrapper || document.querySelector("[data-video-player]");
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await target?.requestFullscreen?.();
      } catch (error) {
        showToast("Fullscreen is unavailable");
      }
    };
  }
  wrapper?.addEventListener("mousemove", showFullscreenChrome);
  wrapper?.addEventListener("touchstart", showFullscreenChrome, { passive: true });
  wrapper?.addEventListener("click", showFullscreenChrome);
  document.addEventListener("fullscreenchange", syncFullscreenState);
}

function setupCustomSubtitles(video, tracks = []) {
  const availableTracks = tracks.filter((item) => item?.url);
  if (!availableTracks.length) return;

  const player = video.closest("[data-video-player]");
  const toggle = document.querySelector("[data-subtitle-toggle]");
  const overlay = document.createElement("div");
  overlay.className = "custom-subtitles";
  overlay.setAttribute("aria-live", "polite");
  applySubtitleStyle(overlay);
  player?.append(overlay);
  let subtitlesEnabled = true;
  let currentTrackIndex = 0;
  let cues = [];

  setSubtitleToggleAvailable(true, subtitlesEnabled);

  const renderCue = () => {
    if (!subtitlesEnabled) {
      overlay.classList.remove("show");
      overlay.innerHTML = "";
      return;
    }

    const current = video.currentTime;
    const cue = cues.find((item) => current >= item.start && current <= item.end);
    if (!cue) {
      overlay.classList.remove("show");
      overlay.innerHTML = "";
      return;
    }

    overlay.innerHTML = cue.text.split(/\n+/).map(escapeHtml).join("<br>");
    overlay.classList.add("show");
  };

  const loadTrack = (index) => {
    const track = availableTracks[index];
    if (!track) return;
    currentTrackIndex = index;
    return fetch(track.url)
    .then((response) => response.ok ? response.text() : Promise.reject(new Error("Subtitle request failed")))
    .then((text) => {
      cues = parseSubtitleCues(text, track.url);
      if (!cues.length) throw new Error("No subtitle cues");
      subtitlesEnabled = true;
      setSubtitleToggleAvailable(true, subtitlesEnabled, true);
      renderCue();
    })
    .catch(() => {
      overlay.remove();
      appendNativeVideoTracks(video, tracks);
    });
  };

  if (toggle) {
    toggle.onclick = () => {
      subtitlesEnabled = !subtitlesEnabled;
      setSubtitleToggleAvailable(true, subtitlesEnabled, true);
      const subtitles = document.querySelector("[data-player-subtitles]");
      if (subtitles) subtitles.value = subtitlesEnabled ? String(currentTrackIndex) : "off";
      renderCue();
    };
  }

  video.addEventListener("player-subtitle-change", (event) => {
    if (event.detail === "off") {
      subtitlesEnabled = false;
      setSubtitleToggleAvailable(true, false, true);
      renderCue();
      return;
    }
    const nextIndex = Number(event.detail);
    if (Number.isFinite(nextIndex)) loadTrack(nextIndex);
  });

  video.addEventListener("timeupdate", renderCue);
  video.addEventListener("seeked", renderCue);
  video.addEventListener("emptied", () => overlay.remove(), { once: true });
  loadTrack(0);
}

function applySubtitleStyle(overlay) {
  const style = { ...defaultSubtitleStyle(), ...(state.settings.subtitleStyle || {}) };
  overlay.style.fontSize = `${Math.max(16, Math.min(42, Number(style.size) || DEFAULT_SUBTITLE_STYLE.size))}px`;
  overlay.style.color = style.color || DEFAULT_SUBTITLE_STYLE.color;
  overlay.style.background = hexToRgba(style.backgroundColor || DEFAULT_SUBTITLE_STYLE.backgroundColor, Math.max(0, Math.min(100, Number(style.backgroundOpacity))) / 100);
  const offset = Math.max(16, Math.min(320, Number(style.offset) || DEFAULT_SUBTITLE_STYLE.offset));
  overlay.style.setProperty("--subtitle-base-offset", `${offset}px`);
  overlay.style.setProperty("--subtitle-controls-offset", `${offset + 52}px`);
  overlay.style.setProperty("--subtitle-settings-offset", `${offset + 134}px`);
  overlay.classList.toggle("subtitle-top", style.position === "top");
}

function hexToRgba(hex, alpha = 1) {
  const value = String(hex || "").replace("#", "");
  if (!/^[\da-f]{6}$/i.test(value)) return `rgba(8, 16, 24, ${alpha})`;
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function setSubtitleToggleAvailable(available, enabled = true, keepHandler = false) {
  const toggle = document.querySelector("[data-subtitle-toggle]");
  if (!toggle) return;
  toggle.hidden = !available;
  toggle.disabled = !available;
  toggle.classList.toggle("active", available && enabled);
  toggle.setAttribute("aria-pressed", String(Boolean(available && enabled)));
  toggle.title = enabled ? "Turn subtitles off" : "Turn subtitles on";
  if (!keepHandler) toggle.onclick = null;
}

function parseSubtitleCues(text, url = "") {
  return String(url).toLowerCase().endsWith(".ass") || /^\s*\[Script Info\]/i.test(text)
    ? parseAssCues(text)
    : parseVttCues(text);
}

function parseVttCues(text) {
  return text
    .replace(/^WEBVTT[^\n]*(?:\n|$)/i, "")
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const timeIndex = lines.findIndex((line) => line.includes("-->"));
      if (timeIndex < 0) return null;
      const [startRaw, endRaw] = lines[timeIndex].split("-->").map((part) => part.trim().split(/\s+/)[0]);
      const cueText = cleanSubtitleText(lines.slice(timeIndex + 1).join("\n"));
      if (!cueText) return null;
      return { start: parseVttTime(startRaw), end: parseVttTime(endRaw), text: cueText };
    })
    .filter((cue) => cue && Number.isFinite(cue.start) && Number.isFinite(cue.end));
}

function parseAssCues(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => {
      if (!/^Dialogue:/i.test(line)) return null;
      const parts = line.replace(/^Dialogue:\s*/i, "").split(",");
      if (parts.length < 10) return null;
      const start = parseAssTime(parts[1]);
      const end = parseAssTime(parts[2]);
      const cueText = cleanSubtitleText(parts.slice(9).join(","));
      if (!cueText || isDrawingSubtitleText(cueText)) return null;
      return { start, end, text: cueText };
    })
    .filter((cue) => cue && Number.isFinite(cue.start) && Number.isFinite(cue.end));
}

function parseAssTime(value) {
  const parts = String(value || "").trim().split(":");
  const seconds = Number(parts.pop());
  const minutes = Number(parts.pop() || 0);
  const hours = Number(parts.pop() || 0);
  return (hours * 3600) + (minutes * 60) + seconds;
}

function cleanSubtitleText(value) {
  return String(value || "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\\[Nnh]/g, "\n")
    .replace(/\\[a-z]+\d*/gi, "")
    .replace(/<[^>]*>/g, "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function isDrawingSubtitleText(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  const letters = (text.match(/[A-Za-z\u3040-\u30ff\u3400-\u9fff]/g) || []).length;
  const drawingTokens = (text.match(/(?:^|\s)[mlbspc]\s*-?\d/gi) || []).length;
  return letters < 2 && (drawingTokens > 0 || /-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/.test(text));
}

function parseVttTime(value) {
  const parts = String(value || "").split(":");
  const seconds = Number(parts.pop());
  const minutes = Number(parts.pop() || 0);
  const hours = Number(parts.pop() || 0);
  return (hours * 3600) + (minutes * 60) + seconds;
}

function appendNativeVideoTracks(video, tracks = []) {
  tracks.filter((track) => track?.url).forEach((track, index) => {
    const node = document.createElement("track");
    node.kind = track.kind || "subtitles";
    node.label = track.label || "Subtitles";
    node.srclang = track.srclang || "en";
    node.src = track.url;
    node.default = index === 0;
    video.appendChild(node);
  });
}

function renderPlayerFallback(url) {
  const player = document.querySelector("[data-video-player]");
  player.innerHTML = `
    <div class="player-loading" style="padding: 24px; text-align: center;">
      <p style="color: var(--red);">This stream could not be played in the browser.</p>
      <p class="muted" style="font-size: 12px; max-width: 520px; margin: 0 auto 16px;">A better player cannot bypass CORS, missing MIME types, or source referer protection. Try opening it externally.</p>
      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button class="btn secondary" data-open-stream-url type="button">Open Stream</button>
        <button class="btn secondary" data-copy-stream-url type="button">Copy URL</button>
      </div>
    </div>
  `;
  player.querySelector("[data-open-stream-url]").addEventListener("click", () => window.open(url, "_blank", "noreferrer"));
  player.querySelector("[data-copy-stream-url]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Stream URL copied");
    } catch (error) {
      showToast("Could not copy stream URL");
    }
  });
}

function loadHlsLibrary() {
  if (window.Hls) return Promise.resolve();
  if (loadHlsLibrary.promise) return loadHlsLibrary.promise;

  loadHlsLibrary.promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return loadHlsLibrary.promise;
}

function loadDashLibrary() {
  if (window.dashjs) return Promise.resolve();
  if (loadDashLibrary.promise) return loadDashLibrary.promise;

  loadDashLibrary.promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/dashjs@4.7.4/dist/dash.all.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return loadDashLibrary.promise;
}

function extractQuality(name) {
  const qualities = ["4K", "2160p", "1440p", "1080p", "720p", "480p", "360p"];
  for (const quality of qualities) {
    if (name.includes(quality)) return quality;
  }
  return "Unknown Quality";
}

async function initReaderPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "manga";
  const apiId = params.get("id");

  let manga = null;
  try {
    manga = JSON.parse(sessionStorage.getItem("reader-manga"));
  } catch (error) {
    // Continue without cached data
  }

  if (!manga && apiId && type === "manga") {
    try {
      manga = await fetchMangaDetails(apiId, params.get("apiSource") || "");
    } catch (error) {
      showToast("Could not load manga details");
    }
  }

  if (!manga) {
    document.querySelector("[data-manga-title]").textContent = type === "doujin" ? "Doujinshi not found" : "Manga not found";
    return;
  }

  // Update page title and manga info
  document.title = `AniTrack | ${manga.title}`;
  document.querySelector("[data-manga-title]").textContent = manga.title;

  setupReadingMode();
  setupReaderControlsVisibility();

  document.querySelector("[data-reader-top]")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.querySelectorAll("[data-reader-back]").forEach((button) => {
    button.addEventListener("click", () => {
      if (history.length > 1) history.back();
      else window.location.href = detailUrl(manga);
    });
  });

  // Setup source and chapter list
  const mangaSources = await loadMangaSourceMatches(manga);
  renderMangaSourceSelector(mangaSources, manga);
  await loadMangaSourceChapters(manga, mangaSources);

  // Navigation buttons
  document.querySelector("[data-prev-chapter]").addEventListener("click", () => {
    const current = document.querySelector("[data-chapter-item].active");
    const prev = current?.previousElementSibling;
    if (prev) prev.click();
  });

  document.querySelector("[data-next-chapter]").addEventListener("click", () => {
    const current = document.querySelector("[data-chapter-item].active");
    const next = current?.nextElementSibling;
    if (next) next.click();
  });

  // Source loading triggers the first chapter automatically.
}

function buildChapters(manga) {
  const total = Number(manga.total || 0);
  const chapters = [];

  // Generate chapter list
  for (let i = 1; i <= Math.min(total || 50, 200); i++) {
    chapters.push({
      number: i,
      title: `Chapter ${i}`,
      date: "Date TBA",
      description: `Chapter ${i} of ${manga.title}`,
    });
  }

  return chapters;
}

async function loadMangaSourceMatches(manga, customTitle = "") {
  try {
    if (Array.isArray(manga.preloadedSources) && manga.preloadedSources.length) return manga.preloadedSources;
    const providers = enabledMangaProviderIds();
    if (!providers.length) return [];
    const searchTitles = customTitle ? uniqueStrings([customTitle, ...mangaSourceSearchTitles(manga)]) : mangaSourceSearchTitles(manga);
    const results = await Promise.allSettled(searchTitles.map((title) =>
      fetchApiJson(`/api/manga/search?title=${encodeURIComponent(title)}&providers=${encodeURIComponent(providers.join(","))}`)
        .then((matches) => matches.map((match) => ({ ...match, searchTitle: title })))
    ));
    const matches = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    return bestMangaSourceMatches(matches, searchTitles, providers);
  } catch (error) {
    showToast("Could not search manga sources");
    return [];
  }
}

function mangaSourceSearchTitles(manga) {
  return uniqueStrings([
    manga.englishTitle,
    ...(manga.alternativeTitles || []),
    manga.title,
    manga.romajiTitle,
    manga.nativeTitle,
  ]).filter((title) => title.length > 1);
}

function bestMangaSourceMatches(matches, titles, providers) {
  const byProvider = new Map();
  for (const match of matches || []) {
    if (!match?.provider || !providers.includes(match.provider)) continue;
    const scored = { ...match, score: Math.max(sourceTitleScore(titles, match.title), Number(match.score || 0)) };
    const requiredScore = isAdultMangaProvider(scored.provider) ? 0.45 : 0.15;
    if (scored.score < requiredScore) continue;
    const current = byProvider.get(match.provider);
    if (!current || scored.score > current.score) byProvider.set(match.provider, scored);
  }
  return providers.map((provider) => byProvider.get(provider)).filter(Boolean);
}

function isAdultMangaProvider(provider) {
  return ["pornhwaz", "hentai20", "pornhwapro", "hentai18", "hentainame", "hentaizap", "hentaifox", "3hentai", "hentaiera", "hentaicity"].includes(provider);
}

function sourceTitleScore(titles, candidate) {
  return titles.reduce((best, title, index) => Math.max(best, titleSimilarity(title, candidate) - index * 0.01), 0);
}

function renderMangaSourceSelector(matches, manga) {
  const bar = document.querySelector("[data-manga-source-bar]");
  const select = document.querySelector("[data-manga-source-select]");
  const status = document.querySelector("[data-manga-source-status]");
  if (!bar || !select || !status) return;

  if (!matches.length) {
    bar.hidden = false;
    select.innerHTML = '<option value="">Generated list</option>';
    select.disabled = true;
    status.textContent = "No provider matches found";
    return;
  }

  bar.hidden = false;
  select.disabled = false;
  select.innerHTML = matches.map((match) => `
    <option value="${escapeAttr(match.id)}">${escapeHtml(mangaSourceOptionLabel(match))}</option>
  `).join("");

  const saved = localStorage.getItem(mangaSourceKey(manga));
  if (saved && matches.some((match) => match.id === saved)) {
    select.value = saved;
  }

  status.textContent = `${matches.length} source${matches.length === 1 ? "" : "s"} found`;
  select.onchange = async () => {
    localStorage.setItem(mangaSourceKey(manga), select.value);
    await loadMangaSourceChapters(manga, matches, select.value);
  };
}

async function loadMangaSourceChapters(manga, matches, preferredId) {
  const container = document.querySelector("[data-chapters-list]");
  const display = document.querySelector("[data-chapter-display]");
  const status = document.querySelector("[data-manga-source-status]");
  const select = document.querySelector("[data-manga-source-select]");

  container.innerHTML = `
    <div class="chapters-loading">
      <div class="spinner"></div>
      <p>Loading chapters...</p>
    </div>
  `;
  display.innerHTML = `
    <div class="reader-loading">
      <div class="spinner"></div>
      <p>Loading source...</p>
    </div>
  `;

  try {
    const ordered = orderMangaSources(matches, preferredId || localStorage.getItem(mangaSourceKey(manga)));

    for (const match of ordered) {
      if (select) select.value = match.id;
      if (status) status.textContent = `Loading ${providerLabel(match.provider)}...`;
      const chapters = await fetchApiJson(`/api/manga/chapters?mangaId=${encodeURIComponent(match.id)}`);
      if (!chapters.length) continue;

      manga.provider = match.provider;
      manga.providerId = match.id;
      manga.providerTitle = match.title;

      if (select) select.value = match.id;
      localStorage.setItem(mangaSourceKey(manga), match.id);
      if (status) status.textContent = `${providerLabel(match.provider)} / ${chapters.length} chapters`;

      renderChaptersList(chapters.map((chapter) => ({ ...chapter, image: manga.image })), manga);
      const start = readerStartChapter(manga, match.id);
      const startButton = start ? [...document.querySelectorAll("[data-chapter-item]")].find((button) =>
        (start.chapterId && button.dataset.chapterId === start.chapterId) ||
        (start.chapterNumber && button.dataset.chapterNumber === start.chapterNumber)
      ) : null;
      (startButton || document.querySelector("[data-chapter-item]"))?.click();
      if (startButton) sessionStorage.removeItem("reader-start-chapter");
      return;
    }

    throw new Error("No source chapters");
  } catch (error) {
    showToast("Using generated chapter list; providers did not return chapters");
    if (status) status.textContent = "Generated chapter list";
    renderChaptersList(buildChapters(manga), manga);
    document.querySelector("[data-chapter-item]")?.click();
  }
}

function orderMangaSources(matches, preferredId) {
  const copy = [...matches];
  if (!preferredId) return copy;
  return copy.sort((a, b) => (a.id === preferredId ? -1 : b.id === preferredId ? 1 : 0));
}

function mangaSourceKey(manga) {
  return `manga-source:${manga.apiId || manga.id || manga.title}`;
}

function mangaSourceCustomQueryKey(manga) {
  return `manga-source-query:${manga.apiId || manga.id || manga.title}`;
}

function providerLabel(provider) {
  return ({ mangadex: "MangaDex", asura: "Asura Scans", mangakatana: "MangaKatana", weebcentral: "WeebCentral", flamecomics: "Flame Comics", rizzcomic: "Rizz Comic", projectsuki: "Project Suki", manhwaz: "ManhwaZ", pornhwaz: "PornhwaZ", hentai20: "Hentai20", pornhwapro: "Pornhwa Pro", hentai18: "Hentai18", hentainame: "Hentai.name", hentaizap: "HentaiZap", hentaifox: "HentaiFox", "3hentai": "3Hentai", hentaiera: "HentaiEra", hentaicity: "HentaiCity", toonily: "Toonily", animedex: "AnimeDex", anizone: "AniZone", anilibria: "AniLibria", tokyoinsider: "TokyoInsider" }[provider] || provider || "Source");
}

function animeSourceLabel(source) {
  return ({ animedex: "AnimeDex", anizone: "AniZone", anilibria: "AniLibria", tokyoinsider: "TokyoInsider", aniwaves: "Aniwaves", hstream: "hstream.moe" }[source] || source || "Anime source");
}

function mangaSourceOptionLabel(source, count = null) {
  const suffix = count == null ? "" : ` (${count})`;
  return `${providerLabel(source.provider)}: ${compactText(source.title, 34)}${suffix}`;
}

function compactText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…` : text;
}

function setupReaderControlsVisibility() {
  document.body.classList.remove("reader-controls-visible", "reader-images-ready");
  document.addEventListener("click", (event) => {
    if (event.target.closest("button, a, select, input, textarea, label")) return;
    const x = event.clientX / Math.max(1, window.innerWidth);
    const y = event.clientY / Math.max(1, window.innerHeight);
    if (x < 0.25 || x > 0.75 || y < 0.15 || y > 0.85) return;
    document.body.classList.toggle("reader-controls-visible");
  });
}

function readerStartChapter(manga, providerId) {
  try {
    const data = JSON.parse(sessionStorage.getItem("reader-start-chapter"));
    if (!data || data.mangaKey !== mangaSourceKey(manga) || data.providerId !== providerId) return null;
    return data;
  } catch (error) {
    return null;
  }
}

function readerStartPage(manga, chapter) {
  try {
    const data = JSON.parse(sessionStorage.getItem("reader-start-page") || "null");
    if (!data || data.mangaKey !== mangaSourceKey(manga)) return null;
    if (data.providerId && data.providerId !== manga.providerId && data.providerId !== manga.apiId) return null;
    if (data.chapterId && chapter?.id && data.chapterId !== chapter.id) return null;
    return { pageIndex: Math.max(0, Number(data.pageIndex || 0)) };
  } catch (error) {
    return null;
  }
}

function applyAdultReaderDefaultMode() {
  const select = document.querySelector("[data-reading-mode]");
  if (!select) return;
  const adultKey = "reader-mode-adult";
  const mode = localStorage.getItem(adultKey) || "single";
  select.value = mode;
  localStorage.setItem("reader-mode", mode);
  applyReadingMode(mode);
  select.onchange = null;
  select.addEventListener("change", () => {
    localStorage.setItem(adultKey, select.value);
    localStorage.setItem("reader-mode", select.value);
    applyReadingMode(select.value);
  }, { once: false });
}

function setupReadingMode() {
  const select = document.querySelector("[data-reading-mode]");
  if (!select) return;
  const saved = localStorage.getItem("reader-mode") || "webtoon";
  select.value = saved;
  applyReadingMode(saved);
  select.addEventListener("change", () => {
    localStorage.setItem("reader-mode", select.value);
    applyReadingMode(select.value);
  });
}

function currentReadingMode() {
  return document.querySelector("[data-reading-mode]")?.value || localStorage.getItem("reader-mode") || "webtoon";
}

function applyReadingMode(mode) {
  const normalized = mode === "single-fit" ? "vertical-fit" : mode;
  document.querySelectorAll("[data-reader-pages]").forEach((pages) => {
    pages.dataset.mode = normalized;
  });
  if (state.readerSession?.pages?.length) {
    renderChapterPages(state.readerSession.display, state.readerSession.pages, state.readerSession.chapter, state.readerSession.pageIndex || 0, true);
  }
}

function titleSimilarity(a, b) {
  const left = normalizeSearchText(a);
  const right = normalizeSearchText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.8;
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return shared / Math.max(leftTokens.size, rightTokens.size, 1);
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.map((value) => String(value || "").trim()).filter((value) => {
    const key = normalizeSearchText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderChaptersList(chapters, manga) {
  const container = document.querySelector("[data-chapters-list]");
  const select = document.querySelector("[data-chapter-select]");
  container.innerHTML = chapters
    .map((ch, index) => {
      const isRead = state.library[manga.id]?.progress >= ch.number;
      return `<button
        type="button"
        class="chapter-item ${index === 0 ? "active" : ""} ${isRead ? "read" : ""}"
        data-chapter-item
        data-chapter-index="${index}"
        data-chapter-id="${escapeAttr(ch.id || "")}"
        data-chapter-number="${ch.number}"
        data-chapter-title="${escapeAttr(ch.title)}"
        data-chapter-data="${escapeAttr(JSON.stringify(ch))}"
      >
        <span class="chapter-num">Ch ${ch.number}</span>
        <h4 class="chapter-title">${escapeHtml(ch.title)}</h4>
        <span class="chapter-date">${escapeHtml(ch.date)}</span>
        ${isRead ? '<span class="muted" style="font-size: 10px;">✓ Read</span>' : ""}
      </button>`;
    })
    .join("");

  if (select) {
    select.innerHTML = chapters.map((ch, index) => `
      <option value="${index}">Ch ${escapeHtml(ch.number)}</option>
    `).join("");
    select.onchange = () => {
      container.querySelector(`[data-chapter-item][data-chapter-index="${select.value}"]`)?.click();
    };
  }

  // Add click handlers
  container.querySelectorAll("[data-chapter-item]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      container.querySelectorAll("[data-chapter-item]").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
      if (select) select.value = btn.dataset.chapterIndex;

      const chapter = JSON.parse(btn.dataset.chapterData);
      await loadChapter(manga, chapter, btn.dataset.chapterNumber);
    });
  });
}

async function loadChapter(manga, chapter, chapterNumber) {
  const display = document.querySelector("[data-chapter-display]");
  const info = document.querySelector("[data-chapter-info]");
  const sources = document.querySelector("[data-manga-sources]");

  info.textContent = `${chapter.title} (${chapterNumber}/${manga.total || "?"})`;
  document.body.classList.remove("reader-images-ready");

  // Show loading
  display.innerHTML = `
    <div class="reader-loading">
      <div class="spinner"></div>
      <p>Loading chapter ${chapterNumber}...</p>
    </div>
  `;

  if ((chapter.provider === "mangadex" || chapter.provider === "asura" || chapter.provider === "mangakatana" || chapter.provider === "weebcentral" || chapter.provider === "flamecomics" || chapter.provider === "rizzcomic" || chapter.provider === "projectsuki" || chapter.provider === "manhwaz" || chapter.provider === "pornhwaz" || chapter.provider === "hentai20" || chapter.provider === "pornhwapro" || chapter.provider === "hentai18" || chapter.provider === "hentainame" || chapter.provider === "hentaizap" || chapter.provider === "hentaifox" || chapter.provider === "3hentai" || chapter.provider === "hentaiera" || chapter.provider === "hentaicity" || chapter.provider === "toonily") && chapter.id) {
    try {
      const data = await fetchMangaPagesCached(chapter.id);
      if (data.pages?.length) {
        const startPage = readerStartPage(manga, chapter);
        if (isAdultMangaProvider(chapter.provider)) applyAdultReaderDefaultMode();
        renderChapterPages(display, data.pages, chapter, startPage?.pageIndex || 0);
        if (sources) {
          sources.innerHTML = `
            <div class="empty" style="padding: 12px; text-align: center;">
              <p class="muted" style="margin: 0;">Reading from ${providerLabel(chapter.provider)} (${data.pages.length} pages)</p>
            </div>
          `;
        }
        markMangaChapterRead(manga, chapterNumber);
        if (startPage) sessionStorage.removeItem("reader-start-page");
        return;
      }
    } catch (error) {
      showToast("Could not load provider pages; try another source");
    }
  }

  if (!sources) {
    // No sources container - just show content
    setTimeout(() => {
      display.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--muted);">
          <p>📖 Chapter ${chapterNumber} ready to read</p>
          <p style="font-size: 12px;">Integration with manga providers coming soon</p>
          <div style="margin-top: 20px; padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: color-mix(in srgb, var(--soft) 40%, transparent);">
            <p style="margin: 0 0 8px;"><strong>${escapeHtml(chapter.title)}</strong></p>
            <p style="margin: 0; font-size: 12px;">${escapeHtml(chapter.description)}</p>
          </div>
        </div>
      `;
    }, 800);
  } else {
    sources.innerHTML = `
      ${extensionSourceCards("manga")}
      <div class="empty" style="padding: 16px; text-align: center;">
        <p class="muted">No direct pages returned by this source.</p>
        <p class="muted" style="font-size: 12px;">Choose another enabled manga source from the reader controls or Settings.</p>
      </div>
    `;
    bindExtensionSourceButtons(sources);
    display.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--muted);">
        <p>Chapter ${chapterNumber}</p>
        <p style="font-size: 12px;">No direct page images were available for this chapter.</p>
      </div>
    `;
  }

  markMangaChapterRead(manga, chapterNumber);
}

function renderChapterPages(display, pages, chapter, startPageIndex = 0, keepPage = false) {
  document.body.classList.add("reader-images-ready");
  const mode = currentReadingMode();
  const pageIndex = keepPage ? Math.max(0, Math.min(state.readerSession?.pageIndex || 0, pages.length - 1)) : Math.max(0, Math.min(startPageIndex, pages.length - 1));
  state.readerSession = { display, pages, chapter, pageIndex };
  if (mode === "single" || mode === "double") {
    renderPagedChapterPages(display, pages, chapter, pageIndex, mode);
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "reader-pages";
  wrapper.dataset.readerPages = "";
  wrapper.dataset.mode = mode;

  display.innerHTML = "";
  display.appendChild(wrapper);
  display.scrollTop = 0;

  const images = pages.map((url, index) => {
    const image = document.createElement("img");
    image.className = "chapter-page-image";
    image.alt = `${chapter.title} page ${index + 1}`;
    image.decoding = "async";
    image.loading = index < 4 ? "eager" : "lazy";
    image.dataset.src = url;
    wrapper.appendChild(image);
    return image;
  });

  let nextIndex = 0;
  const loadWindow = () => {
    const limit = Math.max(2, Math.min(4, currentReadingMode() === "single" ? 2 : 4));
    while (nextIndex < images.length && images[nextIndex].src) nextIndex += 1;
    while (nextIndex < images.length && images.filter((image) => image.dataset.loading === "true").length < limit) {
      const image = images[nextIndex];
      image.dataset.loading = "true";
      image.addEventListener("load", () => { delete image.dataset.loading; loadWindow(); }, { once: true });
      image.addEventListener("error", () => { delete image.dataset.loading; loadWindow(); }, { once: true });
      image.src = image.dataset.src;
      nextIndex += 1;
    }
  };

  loadWindow();
}

function renderPagedChapterPages(display, pages, chapter, pageIndex, mode) {
  const step = mode === "double" ? 2 : 1;
  const current = Math.max(0, Math.min(pageIndex, Math.max(0, pages.length - 1)));
  state.readerSession = { display, pages, chapter, pageIndex: current };
  display.innerHTML = "";
  display.scrollTop = 0;

  const wrapper = document.createElement("div");
  wrapper.className = "reader-pages reader-paged";
  wrapper.dataset.readerPages = "";
  wrapper.dataset.mode = mode;

  const spread = pages.slice(current, current + step);
  spread.forEach((url, offset) => {
    const image = document.createElement("img");
    image.className = "chapter-page-image";
    image.alt = `${chapter.title} page ${current + offset + 1}`;
    image.decoding = "async";
    image.loading = "eager";
    image.src = url;
    image.addEventListener("load", () => preloadReaderPages(pages, current + step, step + 1), { once: true });
    wrapper.appendChild(image);
  });

  const indicator = document.createElement("div");
  indicator.className = "reader-page-indicator";
  indicator.textContent = mode === "double" && spread.length > 1 ? `${current + 1}-${current + spread.length} / ${pages.length}` : `${current + 1} / ${pages.length}`;
  wrapper.appendChild(indicator);

  wrapper.addEventListener("click", (event) => {
    if (event.target.closest("button, a, select, input, textarea, label")) return;
    event.stopPropagation();
    const rect = wrapper.getBoundingClientRect();
    const zone = (event.clientX - rect.left) / Math.max(1, rect.width);
    if (zone < 0.33) {
      changeReaderPage(-step);
      return;
    }
    if (zone > 0.66) {
      changeReaderPage(step);
      return;
    }
    document.body.classList.toggle("reader-controls-visible");
  });

  display.appendChild(wrapper);
  preloadReaderPages(pages, current + step, step + 1);
}

function changeReaderPage(delta) {
  const session = state.readerSession;
  if (!session?.pages?.length) return;
  const next = Math.max(0, Math.min(session.pageIndex + delta, session.pages.length - 1));
  if (next === session.pageIndex) return;
  renderChapterPages(session.display, session.pages, session.chapter, next);
}

function preloadReaderPages(pages, start, count) {
  for (let index = start; index < Math.min(pages.length, start + count); index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = pages[index];
  }
}

async function fetchMangaPagesCached(chapterId) {
  const key = `manga-pages:v2:${chapterId}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.time < MANGA_PAGE_CACHE_TTL_MS && Array.isArray(cached.pages)) return { pages: cached.pages };
  } catch (error) {
    // Page URL cache is optional.
  }

  const data = await fetchApiJson(`/api/manga/pages?chapterId=${encodeURIComponent(chapterId)}`);
  try {
    sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), pages: data.pages || [] }));
  } catch (error) {
    // Ignore storage limits.
  }
  return data;
}

function markMangaChapterRead(manga, chapterNumber) {
  if (!state.current && manga) {
    state.current = manga;
  }
  state.library[manga.id] = state.library[manga.id] || manga;
  state.library[manga.id].progress = Math.max(
    state.library[manga.id].progress || 0,
    Number(chapterNumber)
  );
  state.library[manga.id].status = "reading";
  state.library[manga.id].updatedAt = Date.now();
  persistLibrary();
  document.querySelector(`[data-chapter-item][data-chapter-number="${chapterNumber}"]`)?.classList.add("read");
}

const samples = [
  {
    id: "anime-1",
    apiId: 1,
    source: "Sample",
    type: "anime",
    title: "Frieren: Beyond Journey's End",
    nativeTitle: "Sousou no Frieren",
    description: "A reflective fantasy journey about memory, magic, and life after the final battle.",
    image: fallbackImage,
    banner: fallbackImage,
    score: "94%",
    year: "2023",
    total: 28,
    unit: "eps",
    genres: ["Fantasy", "Adventure"],
    format: "TV",
    statusText: "Finished",
    extra: ["Madhouse"],
    accent: "#7dd3fc",
  },
  {
    id: "manga-2",
    apiId: 2,
    source: "Sample",
    type: "manga",
    title: "Berserk",
    nativeTitle: "Berserk",
    description: "A dark fantasy epic of ambition, survival, and revenge.",
    image: fallbackImage,
    banner: fallbackImage,
    score: "9.47",
    year: "1989",
    total: 0,
    unit: "ch",
    genres: ["Action", "Fantasy"],
    format: "Manga",
    statusText: "Publishing",
    extra: ["Kentaro Miura"],
    accent: "#ef4444",
  },
];
