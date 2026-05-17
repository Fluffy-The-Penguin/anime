const ANILIST_URL = "https://graphql.anilist.co";
const STORAGE_KEY = "anitrack-library-v1";
const LEGACY_STORAGE_KEYS = ["anitrack-library-v2"];
const THEME_KEY = "anitrack-theme";
const SETTINGS_KEY = "anitrack-settings-v1";
const DETAIL_CACHE_KEY = "anitrack-last-detail";
const BROWSE_PAGE_SIZE = 28;
const fallbackImage = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80";

applyStoredTheme();

const page = document.body.dataset.page;
const state = {
  feed: page === "manga" ? "top" : "trending",
  filter: "all",
  browsePage: 1,
  browseQuery: "",
  genres: [],
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
  browseSpotlightItems: [],
  browseSpotlightIndex: 0,
  browseSpotlightTimer: null,
  homePointerStart: null,
  settings: loadSettings(),
  library: loadLibrary(),
  current: null,
  currentItems: [],
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyThemeColor();
  injectChrome();
  updateStats();
  setupMobileNavMode();

  if (page === "home") initHomePage();
  if (page === "anime" || page === "manga") initBrowsePage();
  if (page === "library") initLibraryPage();
  if (page === "details") initDetailsPage();
  if (page === "settings") initSettingsPage();
  if (page === "player") initPlayerPage();
  if (page === "reader") initReaderPage();
}

function setupMobileNavMode() {
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
        ${(page === "anime" || page === "manga") ? `<button class="icon-btn nav-search-toggle" data-browse-filter-toggle type="button" aria-label="Show search and filters" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.7 18.4a7.7 7.7 0 1 1 5.4-13.1 7.7 7.7 0 0 1 0 10.8l4.1 4.1-2 2-4.1-4.1a7.6 7.6 0 0 1-3.4.8Zm0-3a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4Z"/></svg>
        </button>` : ""}
        <div class="profile-menu">
          <button class="icon-btn profile-btn" data-profile-toggle type="button" aria-label="Open profile settings">AT</button>
          <div class="profile-popover" data-profile-popover>
            <strong>Profile</strong>
            <button class="settings-row" data-settings-button type="button">Settings</button>
            <label class="settings-toggle"><span>Show 18+ content</span><input data-adult-toggle type="checkbox" ${state.settings.allowAdult ? "checked" : ""}></label>
            <div class="personalize-block">
              <span>Personalize</span>
              <label class="color-field">Theme color <input data-theme-color type="color" value="${escapeAttr(state.settings.themeColor || "#48dbfb")}"></label>
              <button class="settings-row" data-reset-color type="button">Use poster colors</button>
            </div>
          </div>
        </div>
        <button class="icon-btn theme-toggle" data-theme-toggle type="button" aria-label="Toggle theme">${themeIcon()}</button>
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
  document.querySelector("[data-settings-button]").addEventListener("click", () => {
    window.location.href = "settings.html";
  });
  document.querySelector("[data-adult-toggle]").addEventListener("change", updateAdultSetting);
  document.querySelector("[data-theme-color]").addEventListener("input", updateThemeColor);
  document.querySelector("[data-reset-color]").addEventListener("click", resetThemeColor);
  document.querySelector("[data-theme-toggle]").addEventListener("click", toggleTheme);
  document.querySelector("[data-menu-toggle]").addEventListener("click", toggleMobileMenu);
  document.querySelector("[data-browse-filter-toggle]")?.addEventListener("click", toggleBrowseFilters);
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
  const genreInputs = genre ? [...genre.querySelectorAll('input[type="checkbox"]')] : [];
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
  const lists = document.querySelectorAll("[data-library-list]");

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    setActive(filters, button);
    state.filter = button.dataset.filter;
    renderLibrary();
  });

  lists.forEach((list) => {
    list.addEventListener("click", (event) => {
      const row = event.target.closest("[data-id]");
      if (!row) return;
      goToDetails(state.library[row.dataset.id]);
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
  setRailLoading(latestAnime, 5);
  setRailLoading(latestManga, 5);
  setListLoading(rankingList, 4);

  const [animeResult, mangaResult, latestResult, latestMangaResult, rankingResult] = await Promise.allSettled([
    fetchAnimeFeed("trending"),
    fetchMangaFeed("top"),
    fetchAnimeLatest(state.latestAnimePage),
    fetchMangaLatest(state.latestMangaPage),
    fetchAnimeFeed("popular"),
  ]);
  const animeItems = animeResult.status === "fulfilled" ? animeResult.value.slice(0, 4) : samples.filter((item) => item.type === "anime");
  const mangaItems = mangaResult.status === "fulfilled" ? mangaResult.value.slice(0, 4) : samples.filter((item) => item.type === "manga");
  const latestAnimeItems = latestResult.status === "fulfilled" ? latestResult.value : animeItems;
  const latestMangaItems = latestMangaResult.status === "fulfilled" ? latestMangaResult.value : mangaItems;
  const rankingItems = rankingResult.status === "fulfilled" ? rankingResult.value.slice(0, 4) : animeItems;
  const featuredItems = mergeItems([...(animeResult.status === "fulfilled" ? animeResult.value : []), ...(mangaResult.status === "fulfilled" ? mangaResult.value : [])]).slice(0, 12);

  state.latestItems = [...latestAnimeItems, ...latestMangaItems];
  state.latestAnimeItems = latestAnimeItems;
  state.latestMangaItems = latestMangaItems;
  state.latestPage = 1;
  state.currentItems = mergeItems([...featuredItems, ...animeItems, ...mangaItems, ...latestAnimeItems, ...latestMangaItems, ...rankingItems]);
  renderPosterRail(featuredRail, featuredItems.length ? featuredItems : [...animeItems, ...mangaItems]);
  renderCards(animeGrid, animeItems);
  renderCards(mangaGrid, mangaItems);
  renderStaticRail(latestAnime, latestAnimeItems);
  renderStaticRail(latestManga, latestMangaItems);
  renderRankingList(rankingList, rankingItems);
  renderEditorPick(editorPick, mangaItems[0] || animeItems[0]);
  syncHomePanelHeights();
  window.setTimeout(syncHomePanelHeights, 250);
}

async function initDetailsPage() {
  const root = document.querySelector("[data-details-root]");
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const apiId = params.get("id");
  const cache = loadDetailCache();
  const key = type && apiId ? `${type}-${apiId}` : cache?.id;
  const cachedItem = key ? state.library[key] || (cache?.id === key ? cache : null) : null;

  if (!type || !apiId) {
    renderDetailsError(root, "No title selected. Use Search, Anime, Manga, or Library to open a detail page.");
    return;
  }

  if (cachedItem) renderDetails(root, cachedItem, true);

  try {
    const freshItem = type === "anime" ? await fetchAnimeDetails(apiId) : await fetchMangaDetails(apiId);
    state.current = { ...freshItem, ...state.library[freshItem.id] };
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
}

function updateBrowseUrl() {
  const params = new URLSearchParams(window.location.search);
  if (state.browseQuery) params.set("search", state.browseQuery);
  else params.delete("search");
  if (state.browsePage > 1) params.set("page", String(state.browsePage));
  else params.delete("page");
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
          id title { romaji english native } description(asHtml: false) episodes averageScore seasonYear genres bannerImage coverImage { extraLarge large color }
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
          id title { romaji english native } description(asHtml: false) episodes averageScore seasonYear genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    { page: pageNumber }
  );
  return data.Page.media.map(mapAniList);
}

async function fetchAnimeDetails(apiId) {
  const filter = animeFilterArgs(["id: $id", "type: ANIME"], false);
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(${filter}) {
        id title { romaji english native } description(asHtml: false) episodes duration averageScore popularity seasonYear status format genres bannerImage
        coverImage { extraLarge large color }
        studios(isMain: true) { nodes { name } }
        streamingEpisodes { title thumbnail site }
      }
    }`,
    { id: Number(apiId) }
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
          id title { romaji english native } description(asHtml: false) episodes averageScore seasonYear genres bannerImage coverImage { extraLarge large color }
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
          id title { romaji english native } description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage coverImage { extraLarge large color }
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
          id title { romaji english native } description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    { page: pageNumber }
  );
  return data.Page.media.map(mapAniListManga);
}

async function fetchMangaDetails(apiId) {
  const filter = animeFilterArgs(["id: $id", "type: MANGA"], false);
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(${filter}) {
        id title { romaji english native } description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage
        coverImage { extraLarge large color }
        staff(perPage: 1) { nodes { name { full } } }
      }
    }`,
    { id: Number(apiId) }
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
          id title { romaji english native } description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    variables
  );
  return data.Page.media.map(mapAniListManga);
}

async function anilistQuery(query, variables) {
  const response = await fetch(ANILIST_URL, {
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
  return {
    id: `anime-${item.id}`,
    apiId: item.id,
    source: "AniList",
    type: "anime",
    displayType: item.format || "Anime",
    title: item.title.english || item.title.romaji || "Untitled",
    nativeTitle: item.title.native || "",
    description: clean(item.description) || "No synopsis available.",
    image: item.coverImage.extraLarge || item.coverImage.large || fallbackImage,
    banner: item.bannerImage || "",
    accent: item.coverImage.color || colorFromString(item.title.english || item.title.romaji || String(item.id)),
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
  const title = item.title.english || item.title.romaji || "Untitled";
  return {
    id: `manga-${item.id}`,
    apiId: item.id,
    source: "AniList",
    type: "manga",
    displayType: item.format || "Manga",
    title,
    nativeTitle: item.title.native || "",
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
  if (!animeList || !mangaList) return;

  const allItems = Object.values(state.library).sort((a, b) => b.updatedAt - a.updatedAt);
  const items = state.filter === "all" ? allItems : allItems.filter((item) => item.status === state.filter);
  const animeItems = items.filter((item) => item.type === "anime");
  const mangaItems = items.filter((item) => item.type === "manga");

  renderLibraryGroup(animeList, animeItems, allItems.length ? "No anime match this filter." : "No anime tracked yet. Add titles from the Anime page.");
  renderLibraryGroup(mangaList, mangaItems, allItems.length ? "No manga match this filter." : "No manga tracked yet. Add titles from the Manga page.");
  setText("[data-anime-count]", `${animeItems.length} ${animeItems.length === 1 ? "title" : "titles"}`);
  setText("[data-manga-count]", `${mangaItems.length} ${mangaItems.length === 1 ? "title" : "titles"}`);

  updateStats();
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
  const row = create("a", "library-item");
  setMediaDataset(row, item);
  row.innerHTML = `
    <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
    <div>
      <h3>${escapeHtml(item.title)}</h3>
      <div class="meta">${metaHtml([statusLabel(item.status), mediaLabel(item), item.rating !== "" ? `Rated ${item.rating}/10` : "Unrated"])}</div>
      <div class="progress-bar"><span style="width:${percent}%"></span></div>
    </div>
    <div class="library-side"><strong>${item.progress || 0}${total ? `/${total}` : ""}</strong><div class="muted">${item.unit}</div></div>
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
  const chapters = buildChapterRows(active);
  const countLabel = active.total ? `${active.total} ${active.type === "anime" ? "episodes" : "chapters"}` : active.type === "anime" ? "Episodes TBA" : "Chapters TBA";
  const audience = (active.extra || []).find((value) => /popular|members/i.test(value)) || "Library ready";
  const actionLabel = tracked ? "Update Library" : "Add to Library";
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
            <h1>${escapeHtml(active.title)}</h1>
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
           <div class="detail-actions">
             <span class="detail-mark">A<span>.</span></span>
             ${active.type === "anime" ? `<button class="btn" data-watch-button type="button" style="background: linear-gradient(135deg, var(--blue), var(--mint)); color: #06101a;">▶ Watch Now</button>` : ""}
             ${active.type === "manga" ? `<button class="btn" data-read-button type="button" style="background: linear-gradient(135deg, var(--mint), var(--blue)); color: #06101a;">📖 Read Now</button>` : ""}
             <div class="field detail-status-field"><select data-track-status>${statusOptions(active.type)}</select></div>
             <button class="btn detail-save" data-save-track type="button">${actionLabel}</button>
             <div class="detail-progress-control">
               <button data-minus-progress type="button">−</button>
               <input data-track-progress type="number" min="0" step="1" value="${Number(active.progress || 0)}" aria-label="Progress">
               <span>/ ${escapeHtml(total || "?")}</span>
               <button data-plus-progress type="button">+</button>
             </div>
             <input data-track-rating class="detail-rating" type="number" min="0" max="10" step="0.5" value="${escapeAttr(active.rating ?? "")}" placeholder="Rating / 10" aria-label="Rating out of 10">
             <button class="detail-remove" data-remove-track type="button" ${tracked ? "" : "hidden"}>Remove</button>
           </div>
          <textarea data-track-notes class="detail-notes" placeholder="Private notes...">${escapeHtml(active.notes || "")}</textarea>
          <div class="details-progress-card detail-progress-card">
            <div><span class="muted">Your progress</span><strong>${progress}${total ? ` / ${total}` : ""} ${escapeHtml(active.unit)}</strong></div>
            <div class="progress-bar"><span style="width:${progressPercent}%"></span></div>
          </div>
        </main>
      </div>
      <section class="detail-episodes">
        <div class="detail-episode-head">
          <h2>${active.type === "anime" ? "Episodes" : "Chapters"}</h2>
          <button type="button">${active.type === "anime" ? "English Dub" : "Source"}</button>
          <button type="button">Hide Watched ${active.type === "anime" ? "Episodes" : "Chapters"}</button>
          <span>${chapters.length ? "1" : "0"} / 1</span>
          <label>⌕ <input type="search" placeholder="Manually search for ${active.type}..." aria-label="Filter episodes"></label>
        </div>
        <div class="detail-list-filter">All ⌕ <span>|</span> ${escapeHtml(active.title)}</div>
        <div class="chapter-list detail-chapter-list">${chapters.map((chapter, index) => `<button type="button" data-plus-progress class="chapter-row detail-chapter-row"><img src="${escapeAttr(chapter.image || active.image || fallbackImage)}" alt="${escapeAttr(chapter.title)} thumbnail" loading="lazy"><span>${index + 1}. ${escapeHtml(chapter.title)}</span><small>${escapeHtml(chapter.time)}</small></button>`).join("")}</div>
      </section>
    </section>
  `;

  root.querySelector("[data-track-status]").value = active.status || (active.type === "anime" ? "watching" : "reading");
  root.querySelector("[data-save-track]").addEventListener("click", () => saveCurrent());
  root.querySelector("[data-watch-button]")?.addEventListener("click", () => {
    sessionStorage.setItem("player-anime", JSON.stringify(active));
    window.location.href = `player.html?type=${active.type}&id=${active.apiId}`;
  });
  root.querySelector("[data-read-button]")?.addEventListener("click", () => {
    sessionStorage.setItem("reader-manga", JSON.stringify(active));
    window.location.href = `manga-reader.html?type=${active.type}&id=${active.apiId}`;
  });
  root.querySelector("[data-minus-progress]").addEventListener("click", () => {
    const progress = root.querySelector("[data-track-progress]");
    progress.value = Math.max(0, Number(progress.value || 0) - 1);
    saveCurrent(true);
  });
  root.querySelectorAll("[data-plus-progress]").forEach((button) => button.addEventListener("click", () => {
    const progress = root.querySelector("[data-track-progress]");
    progress.value = Number(progress.value || 0) + 1;
    saveCurrent(true);
  }));
  root.querySelector("[data-remove-track]").addEventListener("click", removeCurrent);
}

function renderDetailsError(root, message) {
  root.innerHTML = `<div class="details-loading panel"><h2>Details unavailable</h2><p class="muted">${escapeHtml(message)}</p><a class="btn" href="anime.html">Browse Anime</a></div>`;
}

function saveCurrent(silent = false) {
  if (!state.current) return;
  const progress = Math.max(0, Number(document.querySelector("[data-track-progress]")?.value || 0));
  const ratingInput = document.querySelector("[data-track-rating]")?.value || "";
  const rating = ratingInput === "" ? "" : Math.min(10, Math.max(0, Number(ratingInput)));
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
  return `details.html?type=${encodeURIComponent(item.type)}&id=${encodeURIComponent(item.apiId || item.id.split("-").pop())}`;
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
  if (page !== "anime" && page !== "manga") {
    return;
  }

  event.stopPropagation();
  const isOpen = document.body.classList.toggle("browse-filters-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) window.setTimeout(() => document.querySelector("[data-browse-search]")?.focus(), 0);
}

function updateAdultSetting(event) {
  state.settings.allowAdult = event.target.checked;
  persistSettings();
  showToast(state.settings.allowAdult ? "18+ content enabled." : "18+ content disabled.");
  if (page === "home") loadHomeSections();
  if (page === "anime" || page === "manga") loadFeed();
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
  if (!state.settings.allowAdult) args.push("isAdult: false");
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
    return { allowAdult: false, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) };
  } catch (error) {
    return { allowAdult: false };
  }
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

  if (!state.genres.length) {
    toggle.textContent = "Any genre";
    return;
  }

  toggle.textContent = state.genres.length === 1 ? state.genres[0] : `${state.genres.length} genres selected`;
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
  return escapeHtml(value || "");
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

async function initSettingsPage() {
  // Section Navigation
  const navButtons = document.querySelectorAll("[data-section]");
  const sections = document.querySelectorAll("[data-section-content]");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionName = btn.dataset.section;
      navButtons.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));
      btn.classList.add("active");
      document.querySelector(`[data-section-content="${sectionName}"]`)?.classList.add("active");
      
      if (sectionName === "extensions-anime") loadAnimeExtensionsNew();
      if (sectionName === "extensions-manga") loadMangaExtensionsNew();
    });
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
  document.querySelector("[data-adult-toggle]").checked = state.settings.allowAdult || false;
  document.querySelector("[data-adult-toggle]").addEventListener("change", (e) => {
    state.settings.allowAdult = e.target.checked;
    persistSettings();
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

  document.querySelector("[data-autoplay-toggle]").checked = state.settings.autoPlayNext || false;
  document.querySelector("[data-autoplay-toggle]").addEventListener("change", (e) => {
    state.settings.autoPlayNext = e.target.checked;
    persistSettings();
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

  // Load initial extensions
  loadAnimeExtensionsNew();
}

async function loadAnimeExtensionsNew() {
  const container = document.querySelector("[data-anime-extensions]");
  if (!container) return;

  container.innerHTML = '<div class="loading-state">Loading anime sources...</div>';

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/yuzono/anime-repo/repo/index.min.json"
    );
    const data = await response.json();
    
    // Handle different response structures
    let extensions = data.extensions || data || [];
    if (!Array.isArray(extensions)) {
      extensions = Object.values(extensions);
    }

    if (!extensions.length) {
      container.innerHTML = '<div class="loading-state">No anime sources available</div>';
      return;
    }

    renderExtensionsGrid(
      container,
      extensions.slice(0, 15).map((ext) => ({
        id: ext.id || ext.pkg || ext.name,
        name: ext.name || "Unknown",
        version: ext.version || "1.0",
        description: ext.description || ext.lang || "Anime source",
      }))
    );
  } catch (error) {
    console.error("Failed to load anime extensions:", error);
    container.innerHTML = '<div class="loading-state">Failed to load anime sources</div>';
  }
}

async function loadMangaExtensionsNew() {
  const container = document.querySelector("[data-manga-extensions]");
  if (!container) return;

  container.innerHTML = '<div class="loading-state">Loading manga readers...</div>';

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json"
    );
    const data = await response.json();

    // Handle different response structures
    let extensions = data.extensions || data || [];
    if (!Array.isArray(extensions)) {
      extensions = Object.values(extensions);
    }

    if (!extensions.length) {
      container.innerHTML = '<div class="loading-state">No manga readers available</div>';
      return;
    }

    renderExtensionsGrid(
      container,
      extensions.slice(0, 15).map((ext) => ({
        id: ext.id || ext.key || ext.name,
        name: ext.name || "Unknown",
        version: ext.versionCode || ext.version || "1.0",
        description: ext.description || "Manga reader",
      }))
    );
  } catch (error) {
    console.error("Failed to load manga extensions:", error);
    container.innerHTML = '<div class="loading-state">Failed to load manga readers</div>';
  }
}

function renderExtensionsGrid(container, extensions) {
  container.innerHTML = extensions
    .map(
      (ext) => `
    <div class="extension-card">
      <h4>${escapeHtml(ext.name)}</h4>
      <p>${escapeHtml(ext.description)}</p>
      <div class="extension-footer">
        <span class="extension-version">v${escapeHtml(ext.version)}</span>
        <input type="checkbox" class="extension-toggle" data-ext-id="${ext.id}" aria-label="Enable ${ext.name}">
      </div>
    </div>
  `
    )
    .join("");

  // Restore toggle states
  container.querySelectorAll(".extension-toggle").forEach((toggle) => {
    const enabled = JSON.parse(localStorage.getItem("enabled-extensions") || "{}");
    toggle.checked = enabled[toggle.dataset.extId] || false;

    toggle.addEventListener("change", () => {
      const enabled = JSON.parse(localStorage.getItem("enabled-extensions") || "{}");
      enabled[toggle.dataset.extId] = toggle.checked;
      localStorage.setItem("enabled-extensions", JSON.stringify(enabled));
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
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "anime";
  const apiId = params.get("id");

  let anime = null;
  try {
    anime = JSON.parse(sessionStorage.getItem("player-anime"));
  } catch (error) {
    // Continue without cached data
  }

  if (!anime && apiId && type === "anime") {
    try {
      anime = await fetchAnimeDetails(apiId);
    } catch (error) {
      showToast("Could not load anime details");
    }
  }

  if (!anime) {
    document.querySelector("[data-anime-title]").textContent = "Anime not found";
    return;
  }

  // Update page title and anime info
  document.title = `AniTrack | ${anime.title}`;
  document.querySelector("[data-anime-title]").textContent = anime.title;

  // Setup episode list
  const episodes = buildEpisodes(anime);
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

  // Load first episode by default
  const firstEpisode = document.querySelector("[data-episode-item]");
  if (firstEpisode) {
    firstEpisode.click();
  }
}

function buildEpisodes(anime) {
  const total = Number(anime.total || 0);
  const episodes = [];

  if (anime.episodesList?.length) {
    return anime.episodesList.map((ep, index) => ({
      number: index + 1,
      title: ep.title || `Episode ${index + 1}`,
      airDate: ep.time || "TBA",
      image: ep.image || anime.banner || anime.image,
      description: "Episode description loading...",
    }));
  }

  // Generate episode list
  for (let i = 1; i <= Math.min(total || 12, 100); i++) {
    episodes.push({
      number: i,
      title: `Episode ${i}`,
      airDate: "Air date TBA",
      image: anime.image,
      description: `Episode ${i} of ${anime.title}`,
    });
  }

  return episodes;
}

function renderEpisodesList(episodes, anime) {
  const container = document.querySelector("[data-episodes-list]");
  container.innerHTML = episodes
    .map((ep, index) => {
      const isWatched = state.library[anime.id]?.progress >= ep.number;
      return `<button
        type="button"
        class="episode-item ${index === 0 ? "active" : ""} ${isWatched ? "watched" : ""}"
        data-episode-item
        data-episode-number="${ep.number}"
        data-episode-title="${escapeAttr(ep.title)}"
        data-episode-data='${JSON.stringify(ep)}'
      >
        <span class="episode-number">Ep ${ep.number}</span>
        <h4 class="episode-title">${escapeHtml(ep.title)}</h4>
        <span class="episode-air-date">${escapeHtml(ep.airDate)}</span>
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

  // Show loading state
  videoPlayer.innerHTML = `
    <div class="player-loading">
      <div class="spinner"></div>
      <p>Searching for streaming sources...</p>
    </div>
  `;

  try {
    // Search for streams using Nyaa
    const streamData = await searchNyaaStreams(anime.title, episodeNumber);
    renderStreamingSources(sources, streamData, anime, episodeNumber);
  } catch (error) {
    sources.innerHTML = `
      <div class="empty" style="padding: 16px; text-align: center;">
        <p class="muted">No streams found for this episode</p>
        <p class="muted" style="font-size: 12px;">Try searching manually on Nyaa.si</p>
      </div>
    `;
    videoPlayer.innerHTML = `
      <div class="player-loading">
        <p style="color: var(--red);">No playable sources found</p>
        <p class="muted" style="font-size: 12px;">Check back later or search on Nyaa.si</p>
      </div>
    `;
  }

  // Setup mark as watched button
  document.querySelector("[data-mark-watched]").addEventListener("click", () => {
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
  });
}

async function searchNyaaStreams(animeTitle, episodeNumber) {
  try {
    // Multiple query formats to try
    const queries = [
      `${animeTitle} ${episodeNumber}`,
      `${animeTitle} - ${episodeNumber}`,
      `[${animeTitle}] ${episodeNumber}`,
      `${animeTitle} episode ${episodeNumber}`,
    ];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://nyaa.si/api/v1/search?q=${encodeURIComponent(query)}&c=1_2&s=seeders&o=desc`,
          { timeout: 5000 }
        );
        
        if (!response.ok) continue;

        const data = await response.json();
        if (data.results?.length > 0) {
          return data.results;
        }
      } catch (e) {
        continue;
      }
    }

    return [];
  } catch (error) {
    console.error("Stream search error:", error);
    return [];
  }
}

async function searchNyaaMangaTorrents(mangaTitle, chapterNumber) {
  try {
    // Multiple query formats to try for manga
    const queries = [
      `${mangaTitle} ${chapterNumber}`,
      `${mangaTitle} - chapter ${chapterNumber}`,
      `${mangaTitle} ch ${chapterNumber}`,
      `${mangaTitle} chapter ${chapterNumber}`,
    ];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://nyaa.si/api/v1/search?q=${encodeURIComponent(query)}&c=6_0&s=seeders&o=desc`,
          { timeout: 5000 }
        );
        
        if (!response.ok) continue;

        const data = await response.json();
        if (data.results?.length > 0) {
          return data.results;
        }
      } catch (e) {
        continue;
      }
    }

    return [];
  } catch (error) {
    console.error("Manga search error:", error);
    return [];
  }
}

function renderStreamingSources(container, results, anime, episodeNumber) {
  if (!results.length) {
    container.innerHTML = `
      <div class="empty" style="padding: 16px; text-align: center;">
        <p class="muted">No sources available</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results
    .slice(0, 5)
    .map((result) => {
      const seeders = result.seeders || 0;
      const leechers = result.leechers || 0;
      const quality = extractQuality(result.name);
      const seeds = seeders > 0 ? `${seeders} seeders` : "No seeders";

      return `
        <div class="source-item">
          <div class="source-info">
            <h4>${escapeHtml(quality || "Unknown Quality")}</h4>
            <p>${escapeHtml(result.name.substring(0, 60))}...</p>
            <p style="font-size: 11px; margin-top: 4px;">👥 ${seeds}</p>
          </div>
          <button class="source-play" data-magnet-link="${escapeAttr(result.magnet_uri)}" type="button">▶ Play</button>
        </div>
      `;
    })
    .join("");

  // Add play button handlers
  container.querySelectorAll(".source-play").forEach((btn) => {
    btn.addEventListener("click", () => {
      const magnetLink = btn.dataset.magnetLink;
      // Open in default torrent client or show info
      window.open(magnetLink, "_blank");
      showToast("Opening torrent in your default client");
    });
  });

  document.querySelector("[data-video-player]").innerHTML = `
    <div class="player-loading">
      <p>Select a source above to stream</p>
      <p class="muted" style="font-size: 12px;">⚠ Requires a torrent client (qBittorrent, Transmission, etc.)</p>
    </div>
  `;
}

function renderMangaTorrentSources(container, results, manga, chapterNumber) {
  if (!results.length) {
    container.innerHTML = `
      <div class="empty" style="padding: 16px; text-align: center;">
        <p class="muted">No torrent sources available</p>
        <p class="muted" style="font-size: 12px;">Try searching manually on Nyaa.si</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="margin-top: 16px;">
      <h4 style="margin: 0 0 12px; font-size: 14px;">📥 Available Torrents</h4>
      ${results
        .slice(0, 5)
        .map((result) => {
          const seeders = result.seeders || 0;
          const quality = extractQuality(result.name);
          const seeds = seeders > 0 ? `${seeders} seeders` : "No seeders";

          return `
            <div class="source-item" style="display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 12px; border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--soft) 50%, transparent); margin-bottom: 8px;">
              <div class="source-info">
                <h4 style="margin: 0 0 4px; font-size: 12px;">${escapeHtml(quality || "Unknown Quality")}</h4>
                <p style="margin: 0; font-size: 11px; color: var(--muted);">${escapeHtml(result.name.substring(0, 50))}...</p>
                <p style="font-size: 10px; margin-top: 4px; color: var(--muted);">👥 ${seeds}</p>
              </div>
              <button class="source-play" data-magnet-link="${escapeAttr(result.magnet_uri)}" type="button" style="min-width: 50px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 8px; background: rgba(72, 219, 251, 0.1); color: var(--blue); font-size: 11px; cursor: pointer; white-space: nowrap;">📥 Torrent</button>
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  // Add play button handlers
  container.querySelectorAll(".source-play").forEach((btn) => {
    btn.addEventListener("click", () => {
      const magnetLink = btn.dataset.magnetLink;
      window.open(magnetLink, "_blank");
      showToast("Opening torrent in your default client");
    });
  });
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
      manga = await fetchMangaDetails(apiId);
    } catch (error) {
      showToast("Could not load manga details");
    }
  }

  if (!manga) {
    document.querySelector("[data-manga-title]").textContent = "Manga not found";
    return;
  }

  // Update page title and manga info
  document.title = `AniTrack | ${manga.title}`;
  document.querySelector("[data-manga-title]").textContent = manga.title;

  // Setup chapter list
  const chapters = buildChapters(manga);
  renderChaptersList(chapters, manga);

  // Setup chapter search
  const searchInput = document.querySelector("[data-chapters-search] input");
  const searchToggle = document.querySelector("[data-chapters-search-toggle]");
  const searchContainer = document.querySelector("[data-chapters-search]");

  searchToggle.addEventListener("click", () => {
    searchContainer.classList.toggle("show");
    if (searchContainer.classList.contains("show")) {
      searchInput.focus();
    }
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll("[data-chapter-item]").forEach((item) => {
      const title = item.dataset.chapterTitle.toLowerCase();
      const number = item.dataset.chapterNumber;
      const matches = title.includes(query) || number.includes(query);
      item.style.display = matches ? "" : "none";
    });
  });

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

  // Load first chapter by default
  const firstChapter = document.querySelector("[data-chapter-item]");
  if (firstChapter) {
    firstChapter.click();
  }
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

function renderChaptersList(chapters, manga) {
  const container = document.querySelector("[data-chapters-list]");
  container.innerHTML = chapters
    .map((ch, index) => {
      const isRead = state.library[manga.id]?.progress >= ch.number;
      return `<button
        type="button"
        class="chapter-item ${index === 0 ? "active" : ""} ${isRead ? "read" : ""}"
        data-chapter-item
        data-chapter-number="${ch.number}"
        data-chapter-title="${escapeAttr(ch.title)}"
        data-chapter-data='${JSON.stringify(ch)}'
      >
        <span class="chapter-num">Ch ${ch.number}</span>
        <h4 class="chapter-title">${escapeHtml(ch.title)}</h4>
        <span class="chapter-date">${escapeHtml(ch.date)}</span>
        ${isRead ? '<span class="muted" style="font-size: 10px;">✓ Read</span>' : ""}
      </button>`;
    })
    .join("");

  // Add click handlers
  container.querySelectorAll("[data-chapter-item]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      container.querySelectorAll("[data-chapter-item]").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

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

  // Show loading
  display.innerHTML = `
    <div class="reader-loading">
      <div class="spinner"></div>
      <p>Loading chapter ${chapterNumber}...</p>
    </div>
  `;

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
    // Search for manga torrents
    try {
      const torrentData = await searchNyaaMangaTorrents(manga.title, chapterNumber);
      renderMangaTorrentSources(sources, torrentData, manga, chapterNumber);
      
      if (torrentData.length === 0) {
        display.innerHTML = `
          <div style="padding: 20px; text-align: center; color: var(--muted);">
            <p>📖 Chapter ${chapterNumber}</p>
            <p style="font-size: 12px;">No direct provider available. Use torrent sources below.</p>
            <div style="margin-top: 20px; padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: color-mix(in srgb, var(--soft) 40%, transparent);">
              <p style="margin: 0 0 8px;"><strong>${escapeHtml(chapter.title)}</strong></p>
              <p style="margin: 0; font-size: 12px;">${escapeHtml(chapter.description)}</p>
            </div>
          </div>
        `;
      }
    } catch (error) {
      sources.innerHTML = `
        <div class="empty" style="padding: 16px; text-align: center;">
          <p class="muted">Could not load manga sources</p>
          <p class="muted" style="font-size: 12px;">Try searching manually</p>
        </div>
      `;
    }
  }

  // Mark as read
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
