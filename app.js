const ANILIST_URL = "/api/anilist";
const ANILIST_DIRECT_URL = "https://graphql.anilist.co";
const STORAGE_KEY = "anitrack-library-v1";
const LEGACY_STORAGE_KEYS = ["anitrack-library-v2"];
const THEME_KEY = "anitrack-theme";
const SETTINGS_KEY = "anitrack-settings-v1";
const ACCOUNT_KEY = "anitrack-account-v1";
const DETAIL_CACHE_KEY = "anitrack-last-detail";
const LIBRARY_VIEW_KEY = "anitrack-library-view-v1";
const FAVORITES_KEY = "anitrack-favorites-v1";
const FAVORITE_REMOVALS_KEY = "anitrack-favorite-removals-v1";
const NOTIFICATION_READ_KEY = "anitrack-notifications-read-at";
const NOTIFICATION_STORE_KEY = "anitrack-notifications-v1";
const CHAPTER_SEEN_KEY = "anitrack-chapter-seen-v1";
const ACTIVITY_KEY = "anitrack-activity-v1";
const ACTIVITY_LIMIT = 500;
const ACTIVITY_PAGE_SIZE = 8;
const ACCOUNT_AUTO_SYNC_INTERVAL_MS = 45000;
const ACCOUNT_AUTO_SYNC_MIN_MS = 10000;
const MANGA_CHAPTER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MANGA_PAGE_CACHE_TTL_MS = 60 * 60 * 1000;
const BROWSE_PAGE_SIZE = 28;
const API_BASE_KEY = "anitrack-api-base";
const DEFAULT_API_BASE_URL = "https://anime-api-proxy.aryanpanwar.workers.dev";
const LEGACY_API_BASE_URLS = ["http://localhost:3000", "http://fi10.bot-hosting.net:21204"];
const DEFAULT_SUBTITLE_STYLE = { size: 28, color: "#ffffff", backgroundColor: "#081018", backgroundOpacity: 46, position: "bottom", offset: 58 };
const ANILIST_DETAIL_MEDIA_FRAGMENT = `
  fragment DetailMediaCard on Media {
    id idMal type isAdult title { romaji english native } description(asHtml: false) episodes chapters volumes duration averageScore popularity seasonYear status format genres bannerImage
    coverImage { extraLarge large color }
  }
`;
const ANIME_SOURCES = [
  { id: "animedex", name: "AnimeDex", description: "Real anime episode lists with direct HLS streams from public AnimeDex APIs.", badge: "HLS" },
  { id: "anizone", name: "AniZone", description: "Anime episode lists with proxied direct HLS playback when available.", badge: "HLS" },
  { id: "anilibria", name: "AniLibria", description: "Russian/fansub public HLS source. Lower-priority fallback for native playback.", badge: "RU HLS" },
  { id: "tokyoinsider", name: "TokyoInsider", description: "Fallback source for public MP4 download links. MKV files are ignored for browser playback.", badge: "MP4" },
  { id: "aniwaves", name: "Aniwaves", description: "Searches provider matches when raw streams are not available.", badge: "Provider" },
  { id: "animekai", name: "AnimeKai", description: "Searches AnimeKai provider matches when direct browser-playable streams are not available.", badge: "Provider" },
  { id: "allanime", name: "AllAnime", description: "Adds a quick external AllAnime search fallback from the player.", badge: "Search" },
  { id: "miruro", name: "Miruro", description: "Adds a quick external Miruro search fallback from the player.", badge: "Search" },
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
  { id: "hentaizap", name: "HentaiZap", description: "English doujin gallery source. Can be blocked by upstream on production.", defaultEnabled: false },
  { id: "hentaifox", name: "HentaiFox" },
  { id: "3hentai", name: "3Hentai" },
  { id: "hentaiera", name: "HentaiEra" },
];
const DOUJIN_TAGS = [
  "cheating", "ntr", "netorare", "milf", "big breasts", "netori", "wife", "married woman", "mother", "teacher", "schoolgirl", "ahegao",
  "vanilla", "romance", "full color", "uncensored", "anal", "creampie", "paizuri", "blowjob", "nakadashi", "threesome", "group", "mind break",
  "hypnosis", "corruption", "cosplay", "maid", "nurse", "office lady", "gyaru", "tomboy", "futanari", "yuri", "stockings", "swimsuit",
  "pregnant", "lactation", "dark skin", "elf", "monster girl", "succubus", "tentacles", "bondage", "femdom", "exhibitionism", "voyeurism", "incest",
  "sister", "daughter", "childhood friend", "idol", "game cg", "artist cg", "western", "doujinshi", "manga", "english",
  "sole female", "sole male", "schoolgirl uniform", "glasses", "multi-work series", "x-ray", "yaoi", "defloration", "mosaic censorship", "males only",
  "big penis", "impregnation", "double penetration", "sex toys", "hairy", "big ass", "ffm threesome", "sweating", "twintails", "dilf", "muscle",
  "collar", "ponytail", "kissing", "full censorship", "small breasts", "big nipples", "masturbation", "oral", "handjob", "lingerie", "bikini",
  "garter belt", "kimono", "apron", "bunny girl", "catgirl", "kemonomimi", "tanned", "tanlines", "public use", "humiliation", "blackmail",
  "drugs", "mind control", "slave", "petplay", "pegging", "facesitting", "cunnilingus", "sixty-nine", "rimjob", "footjob", "foot licking",
  "smell", "urination", "scat", "inflation", "vore", "monster", "demon", "ghost", "alien", "robot", "body swap", "gender bender"
];
const DOUJIN_METADATA_LABELS = {
  artists: "Artists",
  groups: "Groups",
  parodies: "Parodies",
  characters: "Characters",
  categories: "Categories",
  tags: "Tags",
  languages: "Languages",
};
const DOUJIN_PAGE_SIZE = 42;
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
  doujinTagCategory: "",
  doujinTagValue: "",
  doujinToken: 0,
  doujinPage: 1,
  doujinItems: [],
  doujinLoadingMore: false,
  doujinHasMore: true,
  libraryAdultFilter: "all",
  librarySearch: "",
  libraryFormat: "all",
  libraryStatusText: "all",
  libraryGenre: "all",
  libraryYear: "all",
  librarySort: "updated",
  libraryView: "grid",
  readerSession: null,
  browseSpotlightItems: [],
  browseSpotlightIndex: 0,
  browseSpotlightTimer: null,
  homePointerStart: null,
  homeActivityPage: 1,
  homeActivityItems: [],
  notificationPage: 1,
  historyPage: 1,
  profileFavoriteFilter: "all",
  profileFavoriteSearch: "",
  profileFavoriteSort: "recent",
  detailAnimeResume: null,
  detailMangaResume: null,
  libraryType: "all",
  settings: loadSettings(),
  library: loadLibrary(),
  favorites: loadFavorites(),
  favoriteRemovals: loadFavoriteRemovals(),
  account: loadAccount(),
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
  sourceToken: 0,
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
  if (page === "profile") initProfilePage();
  if (page === "library") initLibraryPage();
  if (page === "details") initDetailsPage();
  if (page === "settings") initSettingsPage();
  if (page === "history") initHistoryPage();
  if (page === "player") initPlayerPage();
  if (page === "reader") initReaderPage();
}

function setupMobileNavMode() {
  document.body.classList.remove("is-scrolled", "mobile-nav-floating");
  if (page === "reader") {
    document.body.classList.remove("primary-nav-collapsed");
    return;
  }
  const media = window.matchMedia?.("(max-width: 720px)");
  const update = () => {
    document.body.classList.remove("is-scrolled", "mobile-nav-floating");
    window.requestAnimationFrame(syncMenuToggleVisibility);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  media?.addEventListener?.("change", update);
}

function syncMenuToggleVisibility() {
  const topbar = document.querySelector(".topbar");
  const nav = topbar?.querySelector(".nav");
  const isMobile = window.matchMedia?.("(max-width: 720px)").matches || window.innerWidth <= 720;
  const navVisible = nav ? getComputedStyle(nav).display !== "none" : false;
  const menuOpen = document.body.classList.contains("mobile-menu-open");
  const floating = document.body.classList.contains("mobile-nav-floating");
  document.body.classList.toggle("primary-nav-collapsed", Boolean(isMobile && !floating && (menuOpen || !navVisible)));
}

function injectChrome() {
  const topbar = document.querySelector(".topbar");
  ensureSettingsNavLink();
  if (topbar && !topbar.querySelector(".top-actions")) {
    topbar.insertAdjacentHTML(
      "beforeend",
      `<div class="top-actions">
        <button class="icon-btn menu-toggle" data-menu-toggle type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
        ${(page === "anime" || page === "manga" || page === "doujin") ? `<button class="icon-btn nav-search-toggle" data-browse-filter-toggle type="button" aria-label="Show search and filters" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.7 18.4a7.7 7.7 0 1 1 5.4-13.1 7.7 7.7 0 0 1 0 10.8l4.1 4.1-2 2-4.1-4.1a7.6 7.6 0 0 1-3.4.8Zm0-3a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4Z"/></svg>
        </button>` : ""}
        ${(page === "anime" || page === "manga" || page === "doujin") ? "" : `<button class="icon-btn nav-search-toggle" data-search-toggle type="button" aria-label="Search titles">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.7 18.4a7.7 7.7 0 1 1 5.4-13.1 7.7 7.7 0 0 1 0 10.8l4.1 4.1-2 2-4.1-4.1a7.6 7.6 0 0 1-3.4.8Zm0-3a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4Z"/></svg>
        </button>`}
        <button class="icon-btn theme-toggle" data-theme-toggle type="button" aria-label="Toggle theme">${themeIcon()}</button>
        <a class="top-settings-link" href="settings.html" aria-label="Open settings">Settings</a>
        <div class="notification-menu">
          <button class="icon-btn notification-btn" data-notification-toggle type="button" aria-label="Open notifications" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a2.7 2.7 0 0 0 2.5-1.7h-5A2.7 2.7 0 0 0 12 22Zm7-6.4-1.7-2.3V9a5.3 5.3 0 0 0-4-5.1V3a1.3 1.3 0 0 0-2.6 0v.9a5.3 5.3 0 0 0-4 5.1v4.3L5 15.6V18h14v-2.4Z"/></svg><span data-notification-count hidden>0</span></button>
          <div class="notification-popover" data-notification-popover></div>
        </div>
        <div class="history-menu">
          <button class="icon-btn history-btn" data-history-toggle type="button" aria-label="Open history" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-2.3-5.7L15 9h7V2l-2.9 2.9A10 10 0 0 0 12 2Zm-1 5v6l5 3 .9-1.6-3.9-2.3V7h-2Z"/></svg></button>
          <div class="history-popover" data-history-popover></div>
        </div>
        ${profileMenuHtml()}
      </div>`
    );
  }

  if (["anime", "manga", "doujin"].includes(page) && !document.querySelector(".browse-filter-fab")) {
    document.body.insertAdjacentHTML("beforeend", `<button class="browse-filter-fab" data-browse-filter-toggle type="button" aria-label="Show search and filters" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z"/></svg><span>Filters</span></button>`);
  }

  if (["home", "anime", "manga", "doujin", "doujin-preview", "profile", "library", "history"].includes(page) && !document.querySelector(".details-side-rail")) {
    document.body.insertAdjacentHTML("afterbegin", cinematicSideRailHtml());
  }

  enhanceCinematicSideRail();

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="toast" data-toast role="status" aria-live="polite"></div>`
  );

  if (!document.querySelector("[data-search-overlay]")) {
    document.body.insertAdjacentHTML("beforeend", searchOverlayHtml());
  }

  if (!document.querySelector("[data-account-modal]")) {
    document.body.insertAdjacentHTML("beforeend", accountModalHtml());
  }

  if (!document.querySelector(".site-footer")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<footer class="site-footer shell"><strong>AniTrack</strong><p>Anime and manga discovery with local progress tracking and external metadata.</p></footer>`
    );
  }

  document.querySelectorAll("[data-profile-toggle]").forEach((button) => button.addEventListener("click", toggleProfileMenu));
  document.querySelectorAll("[data-profile-page-button]").forEach((button) => button.addEventListener("click", () => {
    window.location.href = "profile.html";
  }));
  document.querySelectorAll("[data-library-button]").forEach((button) => button.addEventListener("click", () => {
    window.location.href = "anime-library.html";
  }));
  document.querySelectorAll("[data-settings-button]").forEach((button) => button.addEventListener("click", () => {
    window.location.href = "settings.html";
  }));
  document.querySelectorAll("[data-adult-toggle]").forEach((input) => input.addEventListener("change", updateAdultSetting));
  document.querySelector("[data-theme-color]")?.addEventListener("input", updateThemeColor);
  document.querySelector("[data-reset-color]")?.addEventListener("click", resetThemeColor);
  document.querySelector("[data-theme-toggle]").addEventListener("click", toggleTheme);
  document.querySelector("[data-menu-toggle]").addEventListener("click", toggleMobileMenu);
  document.querySelector("[data-notification-toggle]")?.addEventListener("click", toggleNotifications);
  document.querySelector("[data-history-toggle]")?.addEventListener("click", toggleHistory);
  document.querySelectorAll("[data-browse-filter-toggle]").forEach((button) => button.addEventListener("click", toggleBrowseFilters));
  document.querySelector("[data-search-toggle]")?.addEventListener("click", toggleSearchOverlay);
  document.querySelector("[data-overlay-search-form]")?.addEventListener("submit", handleOverlaySearch);
  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearchOverlay);
  initAccountControls();
  syncAdultControls();
  checkLibraryChapterNotifications();
  renderNotifications();
  renderHistory();
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
    if (event.key === "Escape") closeAccountModal();
    if (event.key === "Escape") closeNotifications();
    if (event.key === "Escape") closeHistory();
    if (event.key === "Escape") closeSearchOverlay();
    if (event.key === "Escape") closeBrowseFilters();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".profile-menu")) closeProfileMenu();
    if (!event.target.closest(".notification-menu")) closeNotifications();
    if (!event.target.closest(".history-menu")) closeHistory();
    if (!event.target.closest(".topbar")) closeMobileMenu();
    if (!event.target.closest(".browse-toolbar") && !event.target.closest("[data-browse-filter-toggle]")) closeBrowseFilters();
  });
}

function ensureSettingsNavLink() {
  document.querySelectorAll(".topbar .nav").forEach((nav) => {
    if (!nav.querySelector('a[href="settings.html"]')) nav.insertAdjacentHTML("beforeend", '<a href="settings.html" data-settings-nav>Settings</a>');
  });
}

function cinematicSideRailHtml() {
  return `
    <nav class="details-side-rail" aria-label="Site navigation">
      <a class="details-rail-logo" href="index.html" aria-label="AniTrack home">AT</a>
      <div class="details-rail-main">
        <a href="index.html" aria-label="Home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 12 4l9 7.2v8.1a1.7 1.7 0 0 1-1.7 1.7h-4.6v-6.2H9.3V21H4.7A1.7 1.7 0 0 1 3 19.3v-8.1Zm2 1v6.8h2.3v-6.2h9.4v6.2H19v-6.8l-7-5.6-7 5.6Z"/></svg></a>
        <a href="anime.html" aria-label="Anime"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.8A1.8 1.8 0 0 1 8.7 3.2l10 6.2a1.9 1.9 0 0 1 0 3.2l-10 6.2A1.8 1.8 0 0 1 6 17.2V4.8Zm2 1.1v10.2l8.2-5.1L8 5.9Z"/></svg></a>
        <a href="manga.html" aria-label="Manga / Manhwa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 4h6.1c1 0 1.9.3 2.7.9.8-.6 1.7-.9 2.7-.9h2.1A2.2 2.2 0 0 1 21 6.2v13.4h-5.3c-.9 0-1.7.3-2.3.9l-.4.4-.4-.4c-.6-.6-1.4-.9-2.3-.9H3V6.2A2.2 2.2 0 0 1 5.2 4ZM5 17.6h5.3c.6 0 1.2.1 1.7.4V6.5c-.2-.3-.6-.5-1.1-.5H5.2c-.1 0-.2.1-.2.2v11.4Zm9 .4c.5-.3 1.1-.4 1.7-.4H19V6.2c0-.1-.1-.2-.2-.2h-2.1c-1 0-1.9.8-2.7 1.4V18Z"/></svg></a>
        <a href="doujin.html" data-adult-nav hidden aria-label="Doujin"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 4 6v6c0 5 3.4 8.6 8 9.5 4.6-.9 8-4.5 8-9.5V6l-8-3.5Zm0 2.2 6 2.6V12c0 3.8-2.4 6.4-6 7.4-3.6-1-6-3.6-6-7.4V7.3l6-2.6Zm0 4.1a2.7 2.7 0 0 0-1.2 5.1v2.6h2.4v-2.6A2.7 2.7 0 0 0 12 8.8Z"/></svg></a>
        <a href="profile.html" aria-label="Profile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12.2a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4Zm0-7.4a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 0 1 0-5.4Zm-8.4 16a8.4 8.4 0 0 1 16.8 0h-2a6.4 6.4 0 0 0-12.8 0h-2Z"/></svg></a>
      </div>
      <div class="details-rail-bottom">
        <a href="profile-favorites.html" aria-label="Favorites"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 20.7-1.3-1.2C6.1 15.3 3 12.5 3 9.1A4.8 4.8 0 0 1 7.9 4c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2A4.8 4.8 0 0 1 21 9.1c0 3.4-3.1 6.2-7.7 10.4L12 20.7Z"/></svg></a>
        <a href="history.html" aria-label="History"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-2.1-5L14 10h7V3l-2.7 2.7A8.9 8.9 0 0 0 12 3Zm-1 4v6l5 3 .9-1.6-3.9-2.3V7h-2Z"/></svg></a>
        ${settingsRailLinkHtml()}
      </div>
    </nav>
  `;
}

function settingsRailLinkHtml() {
  return `<a href="settings.html" data-settings-rail aria-label="Settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.7 7.7 0 0 0 7 6.5l-2.4-1-2 3.5 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.7 7.7 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/></svg></a>`;
}

function profileMenuHtml(buttonClass = "icon-btn profile-btn", menuClass = "") {
  const className = menuClass ? `profile-menu ${menuClass}` : "profile-menu";
  return `
    <div class="${className}">
      <button class="${buttonClass}" data-profile-toggle type="button" aria-label="Open profile settings" aria-expanded="false">${profileInitials()}</button>
      <div class="profile-popover" data-profile-popover>
        <strong>Profile</strong>
        <div class="profile-account-card" data-account-panel>
          <div class="account-status"><strong data-account-title>${state.account?.username ? `@${escapeHtml(state.account.username)}` : "Guest"}</strong><span data-account-status>${state.account?.username ? "Sync enabled" : "Local library only"}</span></div>
          <button class="settings-row compact" data-account-open type="button">${state.account?.token ? "Manage Account" : "Log in / Register"}</button>
        </div>
        <button class="settings-row" data-profile-page-button type="button">Profile</button>
        <button class="settings-row" data-library-button type="button">Library</button>
        <button class="settings-row" data-settings-button type="button">Settings</button>
        <label class="settings-toggle"><span>Show 18+ content</span><input data-adult-toggle type="checkbox" ${state.settings.allowAdult ? "checked" : ""}></label>
      </div>
    </div>
  `;
}

function enhanceCinematicSideRail() {
  const rail = document.querySelector(".details-side-rail");
  const profileLink = rail?.querySelector('.details-rail-main a[href="profile.html"]');
  if (profileLink && !rail.querySelector(".details-rail-profile-menu")) {
    profileLink.insertAdjacentHTML("afterend", profileMenuHtml("details-rail-profile-btn", "details-rail-profile-menu"));
    profileLink.remove();
  }
  const bottom = rail?.querySelector(".details-rail-bottom");
  if (bottom && !bottom.querySelector("[data-settings-rail]")) bottom.insertAdjacentHTML("beforeend", settingsRailLinkHtml());
}

function searchOverlayHtml() {
  return `
    <div class="search-overlay" data-search-overlay>
      <form class="search-box" data-overlay-search-form>
        <div class="search-head">
          <strong>Search AniTrack</strong>
          <button class="icon-btn" data-search-close type="button" aria-label="Close search">×</button>
        </div>
        <div class="search-row">
          <input data-overlay-search-input type="search" placeholder="Search anime, manga, manhwa, doujin..." autocomplete="off">
          <select data-overlay-search-type aria-label="Search type">
            <option value="anime">Anime</option>
            <option value="manga">Manga / Manhwa</option>
            ${state.settings.allowAdult ? '<option value="doujin">Doujin</option>' : ""}
          </select>
          <button class="btn" type="submit">Search</button>
        </div>
      </form>
    </div>
  `;
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
    state.doujinQuery = search.value.trim();
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

  tags.innerHTML = `
    <div class="genre-filter doujin-tag-filter" data-doujin-tag-filter>
      <span>Tags</span>
      <button class="genre-toggle" data-doujin-tag-toggle type="button" aria-expanded="false">Any</button>
      <div class="genre-menu doujin-tag-menu" data-doujin-tag-menu>
        <div class="doujin-tag-search"><input data-doujin-tag-search type="search" placeholder="Filter tags" autocomplete="off"></div>
        ${DOUJIN_TAGS.map((tag) => `<label><input type="checkbox" data-doujin-tag="${escapeAttr(tag)}"> ${escapeHtml(tag)}</label>`).join("")}
      </div>
    </div>
  `;
  applyDoujinUrlParams(search);
  syncDoujinTags();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.doujinQuery = search.value.trim();
    state.doujinTagCategory = "";
    state.doujinTagValue = "";
    updateDoujinUrl();
    loadDoujinSearch();
  });

  search.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    state.doujinQuery = search.value.trim();
    state.doujinTagCategory = "";
    state.doujinTagValue = "";
    updateDoujinUrl();
    loadDoujinSearch();
  });

  tags.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-doujin-tag-toggle]");
    if (toggle) {
      const filter = tags.querySelector("[data-doujin-tag-filter]");
      const isOpen = !filter?.classList.contains("open");
      filter?.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
      if (isOpen) window.setTimeout(() => tags.querySelector("[data-doujin-tag-search]")?.focus(), 0);
      return;
    }
  });

  tags.querySelector("[data-doujin-tag-search]")?.addEventListener("input", (event) => filterDoujinTagOptions(event.target.value));

  tags.addEventListener("change", (event) => {
    const input = event.target.closest("[data-doujin-tag]");
    if (!input) return;
    const tag = input.dataset.doujinTag;
    state.doujinTags = state.doujinTags.includes(tag) ? state.doujinTags.filter((item) => item !== tag) : [...state.doujinTags, tag];
    state.doujinTagCategory = "";
    state.doujinTagValue = "";
    syncDoujinTags();
    updateDoujinUrl();
    loadDoujinSearch();
  });

  clear?.addEventListener("click", () => {
    search.value = "";
    state.doujinQuery = "";
    state.doujinTags = [];
    state.doujinTagCategory = "";
    state.doujinTagValue = "";
    syncDoujinTags();
    updateDoujinUrl();
    loadDoujinSearch();
    search.focus();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-doujin-tag-filter]")) {
      tags.querySelector("[data-doujin-tag-filter]")?.classList.remove("open");
      tags.querySelector("[data-doujin-tag-toggle]")?.setAttribute("aria-expanded", "false");
    }
  });

  grid.addEventListener("click", openDoujinPreview);
  window.addEventListener("scroll", maybeLoadMoreDoujin);
  loadDoujinSearch();
}

function applyDoujinUrlParams(searchInput) {
  const params = new URLSearchParams(window.location.search);
  state.doujinQuery = params.get("search") || "";
  state.doujinTags = uniqueStrings((params.get("tags") || "").split(",")).filter((tag) => DOUJIN_TAGS.includes(tag));
  state.doujinTagCategory = normalizeDoujinMetadataCategory(params.get("category"));
  state.doujinTagValue = (params.get("tag") || "").trim();
  if (state.doujinTagValue && !state.doujinTagCategory) state.doujinTagCategory = "tags";
  searchInput.value = state.doujinQuery;
}

function updateDoujinUrl() {
  const params = new URLSearchParams();
  if (state.doujinQuery) params.set("search", state.doujinQuery);
  if (state.doujinTags.length) params.set("tags", state.doujinTags.join(","));
  if (state.doujinTagValue) {
    params.set("category", state.doujinTagCategory || "tags");
    params.set("tag", state.doujinTagValue);
  }
  const query = params.toString();
  history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
}

function syncDoujinTags() {
  document.querySelectorAll("[data-doujin-tag]").forEach((input) => {
    input.checked = state.doujinTags.includes(input.dataset.doujinTag);
  });
  const toggle = document.querySelector("[data-doujin-tag-toggle]");
  if (toggle) toggle.textContent = state.doujinTags.length ? `${state.doujinTags.length} selected` : "Any";
}

function filterDoujinTagOptions(query) {
  const normalized = normalizeSearchText(query);
  document.querySelectorAll("[data-doujin-tag]").forEach((input) => {
    const label = input.closest("label");
    if (label) label.hidden = normalized ? !normalizeSearchText(input.dataset.doujinTag).includes(normalized) : false;
  });
}

async function loadDoujinSearch(options = {}) {
  const append = Boolean(options.append);
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
  const selectedFilterTags = uniqueStrings(state.doujinTags);
  const selectedTag = state.doujinTagValue.trim() || selectedFilterTags[0] || "";
  const selectedCategory = normalizeDoujinMetadataCategory(state.doujinTagCategory) || "tags";
  const usingTagPage = Boolean(state.doujinTagValue.trim() && !query);
  const usingTagFilters = selectedFilterTags.length > 0;
  const usingTagEndpoint = Boolean(selectedTag && (usingTagPage || usingTagFilters));
  if (!append) {
    state.doujinPage = 1;
    state.doujinItems = [];
    state.doujinHasMore = true;
  }
  if (append && (!state.doujinHasMore || state.doujinLoadingMore)) return;
  if (!query && !selectedTag) {
    if (heading) heading.textContent = "English Doujinshi";
    if (status) status.textContent = "Loading latest English doujinshi...";
  }

  const token = ++state.doujinToken;
  if (query && !usingTagFilters && heading) heading.textContent = `English doujinshi for "${query}"`;
  if (query && !usingTagFilters && status) status.textContent = "Searching English-only sources...";
  if (usingTagFilters && heading) heading.textContent = query ? `English doujinshi for "${query}" with ${selectedFilterTags.length} tag${selectedFilterTags.length === 1 ? "" : "s"}` : `English doujinshi tagged ${selectedFilterTags.join(", ")}`;
  if (usingTagFilters && status) status.textContent = "Loading exact tag matches from English-only sources...";
  if (usingTagPage && heading) heading.textContent = doujinTagHeading(selectedCategory, selectedTag);
  if (usingTagPage && status) status.textContent = `Loading ${doujinMetadataLabel(selectedCategory).toLowerCase()} results from English-only sources...`;
  if (!append) setLoading(grid, 12);
  state.doujinLoadingMore = true;

  try {
    const providers = doujinProviderIds();
    const pageParam = `page=${encodeURIComponent(state.doujinPage)}&limit=${DOUJIN_PAGE_SIZE}&`;
    const tagRequests = usingTagFilters
      ? selectedFilterTags.map((tag) => ({ category: "tags", tag }))
      : usingTagEndpoint ? [{ category: selectedCategory, tag: selectedTag }] : [];
    const searchRequests = tagRequests.length
      ? tagRequests.map((request) => ({ ...request, queryParam: `latest=1&category=${encodeURIComponent(request.category)}&tag=${encodeURIComponent(request.tag)}&` }))
      : [{ queryParam: query ? `title=${encodeURIComponent(query)}&` : "latest=1&" }];
    const resultGroups = await Promise.all(searchRequests.map(async (request) => {
      const results = await fetchApiJson(`/api/manga/search?${request.queryParam}${pageParam}providers=${encodeURIComponent(providers.join(","))}`);
      return bestDoujinResults(results, providers).map((item) => request.tag ? addImplicitDoujinTag(item, request.category, request.tag) : item);
    }));
    if (token !== state.doujinToken) return;
    const rawPageItems = mergeDoujinResultItems(resultGroups.flat())
      .filter((item) => doujinItemMatchesActiveFilters(item, { query, tags: selectedFilterTags, category: usingTagPage ? selectedCategory : "", tag: usingTagPage ? selectedTag : "" }));
    const pageItems = rawPageItems.slice(0, DOUJIN_PAGE_SIZE);
    const newItems = pageItems.filter((item) => !state.doujinItems.some((existing) => existing.id === item.id));
    const previousCount = state.doujinItems.length;
    state.doujinItems = append ? [...state.doujinItems, ...newItems] : pageItems;
    state.doujinHasMore = rawPageItems.length > 0 && state.doujinItems.length > previousCount;
    if (state.doujinHasMore) state.doujinPage += 1;
    const resultLabel = usingTagPage ? `${doujinMetadataLabel(selectedCategory).toLowerCase()} result` : usingTagFilters ? "exact tag result" : query ? "English result" : "latest English doujinshi";
    if (status) status.textContent = `${state.doujinItems.length} ${resultLabel}${state.doujinItems.length === 1 ? "" : "s"} from ${providers.length} enabled sources`;
    if (append) appendDoujinCards(grid, newItems, state.doujinHasMore);
    else renderDoujinCards(grid, state.doujinItems, state.doujinHasMore);
  } catch (error) {
    if (token !== state.doujinToken) return;
    if (status) status.textContent = "Search failed";
    if (!append) renderEmpty(grid, "Could not load doujinshi results right now.");
  } finally {
    state.doujinLoadingMore = false;
  }
}

function maybeLoadMoreDoujin() {
  if (page !== "doujin" || state.doujinLoadingMore || !state.doujinHasMore) return;
  const distance = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
  if (distance < 900) loadDoujinSearch({ append: true });
}

function doujinSearchQuery() {
  return String(state.doujinQuery || "").trim();
}

function addImplicitDoujinTag(item, category, tag) {
  const normalizedCategory = normalizeDoujinMetadataCategory(category) || "tags";
  return { ...item, metadata: mergeDoujinMetadata(item.metadata, { [normalizedCategory]: [tag] }) };
}

function doujinItemMatchesActiveFilters(item, filters = {}) {
  const query = normalizeSearchText(filters.query || "");
  if (query) {
    const searchable = normalizeSearchText(`${item.title || ""} ${doujinMetadataValues(item.metadata).join(" ")}`);
    if (!searchable.includes(query)) return false;
  }
  const tagFilters = uniqueStrings(filters.tags || []);
  if (tagFilters.length) {
    const values = doujinMetadataValues(item.metadata).map(normalizeSearchText);
    const searchable = normalizeSearchText(`${item.title || ""} ${(item.tags || []).join(" ")}`);
    if (!tagFilters.every((tag) => {
      const normalizedTag = normalizeSearchText(tag);
      return values.includes(normalizedTag) || searchable.includes(normalizedTag);
    })) return false;
  }
  if (filters.tag) {
    const normalizedCategory = normalizeDoujinMetadataCategory(filters.category) || "tags";
    const values = normalizeDoujinMetadata(item.metadata)[normalizedCategory].map(normalizeSearchText);
    if (!values.includes(normalizeSearchText(filters.tag))) return false;
  }
  return true;
}

function normalizeDoujinMetadataCategory(value) {
  const key = String(value || "").toLowerCase().trim();
  return ({
    artist: "artists",
    artists: "artists",
    group: "groups",
    groups: "groups",
    parody: "parodies",
    parodies: "parodies",
    character: "characters",
    characters: "characters",
    category: "categories",
    categories: "categories",
    tag: "tags",
    tags: "tags",
    language: "languages",
    languages: "languages",
  }[key] || "");
}

function doujinMetadataLabel(category) {
  return DOUJIN_METADATA_LABELS[normalizeDoujinMetadataCategory(category)] || "Tags";
}

function doujinTagHeading(category, tag) {
  const normalized = normalizeDoujinMetadataCategory(category);
  const label = ({ artists: "artist", groups: "group", parodies: "parody", characters: "character", categories: "category", tags: "tag", languages: "language" }[normalized] || "tag");
  if (normalized === "artists") return `English doujinshi by ${tag}`;
  return `English doujinshi for ${label} "${tag}"`;
}

function normalizeDoujinMetadata(metadata) {
  const source = metadata || {};
  return Object.fromEntries(Object.keys(DOUJIN_METADATA_LABELS).map((key) => [key, uniqueStrings(source[key] || [])]));
}

function doujinMetadataValues(metadata) {
  return Object.values(normalizeDoujinMetadata(metadata)).flat();
}

function hasDoujinMetadata(metadata) {
  return doujinMetadataValues(metadata).length > 0;
}

function mergeDoujinMetadata(...items) {
  const merged = normalizeDoujinMetadata();
  items.forEach((item) => {
    const normalized = normalizeDoujinMetadata(item);
    Object.keys(DOUJIN_METADATA_LABELS).forEach((key) => {
      merged[key] = uniqueStrings([...merged[key], ...normalized[key]]);
    });
  });
  return merged;
}

function doujinTagUrl(category, value) {
  const params = new URLSearchParams({ category: normalizeDoujinMetadataCategory(category) || "tags", tag: value });
  return `doujin.html?${params.toString()}`;
}

function doujinArtistFavoriteId(artist) {
  return `doujin-artist:${normalizeSearchText(artist).replace(/\s+/g, "-")}`;
}

function doujinCreatorFavoriteCategory(category) {
  return normalizeDoujinMetadataCategory(category) === "groups" ? "groups" : "artists";
}

function doujinCreatorFavoriteId(category, name) {
  const normalizedName = normalizeSearchText(name).replace(/\s+/g, "-");
  if (doujinCreatorFavoriteCategory(category) === "groups") return `doujin-group:${normalizedName}`;
  return doujinArtistFavoriteId(name);
}

function isFavoriteDoujinArtist(artist) {
  const id = doujinCreatorFavoriteId("artists", artist);
  return state.favorites.some((favorite) => favorite.favoriteType === "doujin-artist" && favorite.id === id);
}

function isFavoriteDoujinCreator(category, name) {
  const id = doujinCreatorFavoriteId(category, name);
  return state.favorites.some((favorite) => favorite.favoriteType === "doujin-artist" && favorite.id === id);
}

function doujinMetadataFromTitle(title) {
  const text = String(title || "");
  const tags = DOUJIN_TAGS.filter((tag) => normalizeSearchText(text).includes(normalizeSearchText(tag)));
  return tags.length ? { tags } : {};
}

function doujinProviderIds() {
  return enabledDoujinProviderIds();
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

function mergeDoujinResultItems(items) {
  const byId = new Map();
  (items || []).forEach((item) => {
    if (!item?.id) return;
    const current = byId.get(item.id);
    if (!current) {
      byId.set(item.id, item);
      return;
    }
    const metadata = mergeDoujinMetadata(current.metadata, item.metadata);
    const preferred = Number(item.score || 0) > Number(current.score || 0) ? item : current;
    byId.set(item.id, {
      ...current,
      ...preferred,
      score: Math.max(Number(current.score || 0), Number(item.score || 0)),
      metadata,
      tags: doujinMetadataValues(metadata),
    });
  });
  return [...byId.values()].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
}

function renderDoujinCards(container, items, hasMore = false) {
  container.innerHTML = "";
  if (!items.length) return renderEmpty(container, "No English doujinshi found for this search.");

  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.append(renderDoujinCard(item)));
  container.append(fragment);
  renderDoujinLoadMoreMarker(container, hasMore);
}

function appendDoujinCards(container, items, hasMore = false) {
  container.querySelector(".doujin-load-more")?.remove();
  const empty = container.querySelector(".empty");
  if (empty && items.length) empty.remove();
  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.append(renderDoujinCard(item)));
  container.append(fragment);
  renderDoujinLoadMoreMarker(container, hasMore);
}

function renderDoujinCard(item) {
  const card = create("button", "browse-card doujin-card");
  card.type = "button";
  card.dataset.doujin = JSON.stringify(item);
  card.innerHTML = `
    <img src="${escapeAttr(item.cover || fallbackImage)}" alt="${escapeAttr(item.title)} cover" loading="lazy">
    <h3>${escapeHtml(item.title)}</h3>
    <div class="browse-meta"><span>${escapeHtml(providerLabel(item.provider))}</span><i></i><span>English</span></div>
    ${doujinCardTagsHtml(item)}
  `;
  return card;
}

function doujinCardTagsHtml(item) {
  const tags = doujinMetadataValues(item.metadata).filter((tag) => !/^english$/i.test(tag)).slice(0, 3);
  if (!tags.length) return "";
  return `<div class="doujin-card-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function renderDoujinLoadMoreMarker(container, hasMore) {
  if (hasMore) {
    const loading = create("div", "doujin-load-more");
    loading.textContent = "Scroll for more doujinshi...";
    container.append(loading);
  }
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
    metadata: mergeDoujinMetadata(source.metadata, { tags: source.tags || [] }),
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
    let chapter = chapters[0] || { id: manga.apiId, provider: manga.provider, number: "1", title: manga.title };
    if (!hasDoujinMetadata(chapter.metadata)) {
      const localChapters = await fetchSameOriginJson(`/api/manga/chapters?mangaId=${encodeURIComponent(manga.apiId)}`).catch(() => []);
      const localChapter = Array.isArray(localChapters) ? localChapters[0] : null;
      if (hasDoujinMetadata(localChapter?.metadata)) chapter = { ...chapter, metadata: localChapter.metadata };
    }
    manga = { ...manga, metadata: mergeDoujinMetadata(manga.metadata, chapter.metadata, { tags: chapter.tags || [] }, doujinMetadataFromTitle(manga.title)) };
    state.current = { ...manga, ...state.library[manga.id] };
    const data = await fetchMangaPagesCached(chapter.id || manga.apiId);
    renderDoujinPreview(root, manga, data.pages || [], false, chapter);
  } catch (error) {
    renderDoujinPreview(root, manga, [], false);
    showToast("Could not load preview pages.");
  }
}

function renderDoujinPreview(root, manga, pages, loading = false, chapter = null) {
  const tracked = state.library[manga.id];
  const initialVisible = doujinPreviewInitialCount(root);
  const requestedVisible = Number(root.dataset.previewVisible || initialVisible);
  const visibleCount = loading ? 0 : Math.min(pages.length, Math.max(initialVisible, requestedVisible));
  const visiblePages = pages.slice(0, visibleCount);
  root.dataset.previewVisible = String(visibleCount || initialVisible);
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
        ${renderDoujinMetadataHtml(manga.metadata)}
        <div class="doujin-preview-actions">
          <button class="btn" data-doujin-read-page="0" type="button">Read online</button>
          <button class="btn secondary" data-doujin-save type="button">${tracked ? "Remove from Library" : "Add to Library"}</button>
          <button class="btn secondary detail-favorite-toggle ${isFavoriteItem(manga) ? "active" : ""}" data-doujin-favorite type="button">${isFavoriteItem(manga) ? "★ Favorited" : "☆ Favorite"}</button>
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
        ${loading ? Array.from({ length: 12 }, () => '<div class="skeleton-card"></div>').join("") : visiblePages.map((url, index) => doujinPreviewThumbHtml(manga, url, index)).join("")}
      </div>
      ${!loading && pages.length > visibleCount ? `
        <div class="doujin-preview-more">
          <button class="btn secondary" data-doujin-preview-more type="button">View more</button>
          <button class="btn secondary" data-doujin-preview-all type="button">View all</button>
        </div>
      ` : ""}
    </section>
  `;

  root.querySelector("[data-doujin-save]")?.addEventListener("click", () => toggleDoujinLibrary(root, manga, pages, chapter));
  root.querySelector("[data-doujin-favorite]")?.addEventListener("click", () => {
    const activeFavorite = toggleFavoriteItem(manga);
    const button = root.querySelector("[data-doujin-favorite]");
    button.classList.toggle("active", activeFavorite);
    button.textContent = activeFavorite ? "★ Favorited" : "☆ Favorite";
  });
  root.querySelectorAll("[data-doujin-creator-favorite]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const name = button.dataset.doujinCreatorFavorite;
      const category = button.dataset.doujinCreatorCategory || "artists";
      const activeFavorite = toggleFavoriteDoujinCreator(category, name);
      button.classList.toggle("active", activeFavorite);
      button.textContent = activeFavorite ? "★" : "☆";
      const label = doujinCreatorFavoriteCategory(category) === "groups" ? "group" : "artist";
      button.setAttribute("aria-label", `${activeFavorite ? "Remove" : "Add"} ${name} as favorite ${label}`);
    });
  });
  root.querySelector("[data-doujin-preview-more]")?.addEventListener("click", () => {
    const currentVisible = Number(root.dataset.previewVisible || 0);
    appendDoujinPreviewPages(root, manga, pages, chapter, Math.min(pages.length, currentVisible + doujinPreviewInitialCount(root)));
  });
  root.querySelector("[data-doujin-preview-all]")?.addEventListener("click", () => {
    appendDoujinPreviewPages(root, manga, pages, chapter, pages.length);
  });
  bindDoujinPreviewReadButtons(root, manga, chapter);
  if (!loading) loadDoujinPreviewImagesInBatches(root);
}

function renderDoujinMetadataHtml(metadata) {
  const normalized = normalizeDoujinMetadata(metadata);
  if (!hasDoujinMetadata(normalized)) return "";
  return `
    <div class="doujin-metadata" aria-label="Doujin metadata">
      ${Object.entries(DOUJIN_METADATA_LABELS).map(([category, label]) => {
        const values = normalized[category] || [];
        if (!values.length) return "";
        return `
          <div class="doujin-metadata-row">
            <strong>${escapeHtml(label)}</strong>
            <div>${values.slice(0, 36).map((value) => doujinMetadataChipHtml(category, value)).join("")}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function doujinMetadataChipHtml(category, value) {
  const link = `<a class="doujin-tag-chip" href="${escapeAttr(doujinTagUrl(category, value))}">${escapeHtml(value)}</a>`;
  if (category !== "artists" && category !== "groups") return link;
  const favoriteCategory = doujinCreatorFavoriteCategory(category);
  const active = isFavoriteDoujinCreator(favoriteCategory, value);
  const label = favoriteCategory === "groups" ? "group" : "artist";
  return `<span class="doujin-artist-chip">${link}<button class="doujin-artist-favorite ${active ? "active" : ""}" data-doujin-creator-category="${favoriteCategory}" data-doujin-creator-favorite="${escapeAttr(value)}" type="button" aria-label="${active ? "Remove" : "Add"} ${escapeAttr(value)} as favorite ${label}">${active ? "★" : "☆"}</button></span>`;
}

function doujinPreviewThumbHtml(manga, url, index) {
  return `
    <button class="doujin-page-thumb" data-doujin-read-page="${index}" type="button" aria-label="Read from page ${index + 1}">
      <img data-doujin-preview-image data-src="${escapeAttr(url)}" alt="${escapeAttr(manga.title)} page ${index + 1}" loading="lazy">
      <span>${index + 1}</span>
    </button>
  `;
}

function appendDoujinPreviewPages(root, manga, pages, chapter, targetVisible) {
  const grid = root.querySelector("[data-doujin-preview-grid]");
  if (!grid) return;
  const currentVisible = Number(root.dataset.previewVisible || grid.querySelectorAll("[data-doujin-read-page]").length || 0);
  const nextVisible = Math.min(pages.length, Math.max(currentVisible, targetVisible));
  if (nextVisible <= currentVisible) return;

  grid.insertAdjacentHTML("beforeend", pages.slice(currentVisible, nextVisible).map((url, offset) => doujinPreviewThumbHtml(manga, url, currentVisible + offset)).join(""));
  root.dataset.previewVisible = String(nextVisible);
  bindDoujinPreviewReadButtons(root, manga, chapter);
  loadDoujinPreviewImagesInBatches(root, [...grid.querySelectorAll("[data-doujin-preview-image]:not([src])")]);

  if (nextVisible >= pages.length) root.querySelector(".doujin-preview-more")?.remove();
}

function bindDoujinPreviewReadButtons(root, manga, chapter) {
  root.querySelectorAll("[data-doujin-read-page]:not([data-bound])").forEach((button) => {
    button.dataset.bound = "true";
    button.addEventListener("click", () => openDoujinReaderFromPreview(manga, chapter, Number(button.dataset.doujinReadPage || 0)));
  });
}

async function loadDoujinPreviewImagesInBatches(root, images = null) {
  const token = root.dataset.previewImageToken || String(Date.now());
  root.dataset.previewImageToken = token;
  const pendingImages = images || [...root.querySelectorAll("[data-doujin-preview-image]")];
  for (let index = 0; index < pendingImages.length; index += 5) {
    if (root.dataset.previewImageToken !== token || !document.body.contains(root)) return;
    await Promise.all(pendingImages.slice(index, index + 5).map((image) => loadImageWithFallback(image, image.dataset.src || "")));
  }
}

function doujinPreviewInitialCount(root) {
  const width = Math.max(280, (root?.querySelector?.("[data-doujin-preview-grid]")?.clientWidth || root?.clientWidth || window.innerWidth || 720) - 32);
  const minColumn = window.matchMedia?.("(max-width: 720px)").matches ? 148 : 202;
  return Math.max(2, Math.floor(width / minColumn)) * 2;
}

function toggleDoujinLibrary(root, manga, pages, chapter) {
  if (state.library[manga.id]) {
    recordActivity(state.library[manga.id], "removed");
    delete state.library[manga.id];
    persistLibrary();
    showLibraryOverlay(`${manga.title} removed from Library`, "Removed");
    renderDoujinPreview(root, manga, pages, false, chapter);
    return;
  }
  saveDoujinToLibrary(manga);
  renderDoujinPreview(root, manga, pages, false, chapter);
}

function saveDoujinToLibrary(manga) {
  const saved = { ...manga, status: state.library[manga.id]?.status || "reading", progress: state.library[manga.id]?.progress || 0, rating: state.library[manga.id]?.rating || "", notes: state.library[manga.id]?.notes || "", updatedAt: Date.now(), isAdult: true };
  state.library[saved.id] = saved;
  state.current = saved;
  recordActivity(saved, "added");
  persistLibrary();
  showToast("Saved to your library.");
  showLibraryOverlay(`${saved.title} added to Library`, "Saved");
  const button = document.querySelector("[data-doujin-save]");
  if (button) button.textContent = "Saved";
}

function showLibraryOverlay(message, title = "Saved") {
  document.querySelector(".library-overlay-toast")?.remove();
  const overlay = create("div", "library-overlay-toast");
  overlay.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.classList.add("show"), 20);
  window.setTimeout(() => {
    overlay.classList.remove("show");
    window.setTimeout(() => overlay.remove(), 180);
  }, 1600);
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
  hydrateProfileShell();
  const activity = document.querySelector("[data-home-activity]");
  const progress = document.querySelector("[data-home-progress]");
  const mangaProgress = document.querySelector("[data-home-manga-progress]");
  const progressGrids = [...document.querySelectorAll(".home-progress-grid")];
  if (activity || progressGrids.length) {
    activity?.addEventListener("click", handleCardNavigation);
    progressGrids.forEach((grid) => grid.addEventListener("click", handleCardNavigation));
    setupHomeActivityInfiniteScroll(activity);
    loadHomeSections();
    return;
  }

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
  const adultFilter = document.querySelector("[data-library-adult-filter]");
  const search = document.querySelector("[data-library-search]");
  const advancedFilters = document.querySelectorAll("[data-library-advanced-filter]");
  const lists = document.querySelectorAll("[data-library-list]");
  const viewButtons = document.querySelectorAll("[data-library-view]");
  const params = new URLSearchParams(window.location.search);
  state.libraryType = document.body.dataset.libraryKind || "anime";
  state.libraryView = readLibraryView();
  state.filter = ["all", "watching", "reading", "planning", "completed", "dropped"].includes(params.get("status")) ? params.get("status") : "all";
  state.libraryAdultFilter = ["all", "adult", "normal", "doujin", "hentai", "pornhwa"].includes(params.get("adult")) ? params.get("adult") : (state.libraryType === "adult" ? "adult" : "all");
  state.librarySearch = params.get("q") || "";
  state.libraryFormat = params.get("format") || "all";
  state.libraryStatusText = params.get("airing") || "all";
  state.libraryGenre = params.get("genre") || "all";
  state.libraryYear = params.get("year") || "all";
  state.librarySort = params.get("sort") || "updated";
  if (adultFilter) adultFilter.value = [...adultFilter.options].some((option) => option.value === state.libraryAdultFilter) ? state.libraryAdultFilter : adultFilter.options[0]?.value || "adult";
  if (adultFilter) state.libraryAdultFilter = adultFilter.value;
  if (search) search.value = state.librarySearch;
  populateLibraryAdvancedFilters();
  filters?.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("active", button.dataset.filter === state.filter));
  syncLibraryViewControls();
  hydrateProfileShell();
  syncLibraryPageLinks();
  setupLibraryFilterDrawer();

  filters?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    setActive(filters, button);
    state.filter = button.dataset.filter;
    updateLibraryUrl();
    renderLibrary();
  });

  adultFilter?.addEventListener("change", () => {
    state.libraryAdultFilter = adultFilter.value;
    updateLibraryUrl();
    renderLibrary();
  });

  search?.addEventListener("input", () => {
    state.librarySearch = search.value.trim();
    updateLibraryUrl();
    renderLibrary();
  });

  advancedFilters.forEach((filter) => {
    const key = filter.dataset.libraryAdvancedFilter;
    if (key && state[`library${key}`] != null) filter.value = state[`library${key}`];
    filter.addEventListener("change", () => {
      if (key && state[`library${key}`] != null) state[`library${key}`] = filter.value;
      updateLibraryUrl();
      renderLibrary();
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.libraryView = validLibraryView(button.dataset.libraryView);
      localStorage.setItem(libraryViewStorageKey(), state.libraryView);
      syncLibraryViewControls();
      renderLibrary();
    });
  });

  lists.forEach((list) => {
    list.addEventListener("click", (event) => {
      const row = event.target.closest("[data-id]");
      if (!row) return;
      const item = state.library[row.dataset.id];
      event.preventDefault();
      event.stopPropagation();
      openLibraryItem(item);
    });
  });

  renderLibrary();
}

function setupLibraryFilterDrawer() {
  const sidebar = document.querySelector(".profile-list-sidebar");
  if (!sidebar) return;
  const drawerLabel = document.querySelector(".profile-favorites-sidebar") ? "Favorite Filters" : "Library Filters";
  sidebar.setAttribute("data-library-filter-panel", "");
  sidebar.setAttribute("aria-label", drawerLabel);
  if (!document.querySelector("[data-library-filter-toggle]")) {
    document.body.insertAdjacentHTML("beforeend", `<button class="library-filter-fab" data-library-filter-toggle type="button" aria-label="Open filters" aria-expanded="false">Filters</button>`);
  }
  if (!document.querySelector("[data-library-filter-overlay]")) {
    document.body.insertAdjacentHTML("beforeend", `<button class="library-filter-overlay" data-library-filter-overlay type="button" aria-label="Close filters"></button>`);
  }
  if (!sidebar.querySelector("[data-library-filter-close]")) {
    sidebar.insertAdjacentHTML("afterbegin", `<div class="library-filter-drawer-head"><strong>${drawerLabel}</strong><button data-library-filter-close type="button" aria-label="Close filters">Close</button></div>`);
  }

  const toggle = document.querySelector("[data-library-filter-toggle]");
  const setOpen = (open) => {
    document.body.classList.toggle("library-filter-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
  };
  toggle?.addEventListener("click", () => setOpen(!document.body.classList.contains("library-filter-open")));
  document.querySelector("[data-library-filter-overlay]")?.addEventListener("click", () => setOpen(false));
  sidebar.querySelector("[data-library-filter-close]")?.addEventListener("click", () => setOpen(false));
  sidebar.querySelectorAll("button[data-filter], select").forEach((control) => control.addEventListener("change", () => setOpen(false)));
  sidebar.querySelectorAll("button[data-filter]").forEach((control) => control.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function libraryViewStorageKey() {
  return `${LIBRARY_VIEW_KEY}:${state.libraryType || "anime"}`;
}

function validLibraryView(value) {
  return ["compact", "text", "grid"].includes(value) ? value : "grid";
}

function readLibraryView() {
  return validLibraryView(localStorage.getItem(libraryViewStorageKey()) || "grid");
}

function syncLibraryViewControls() {
  document.querySelectorAll("[data-library-view]").forEach((button) => {
    const active = button.dataset.libraryView === state.libraryView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function initProfilePage() {
  hydrateProfileShell();
  setupProfileFavoriteFilter();
  if (document.querySelector(".profile-favorites-sidebar")) setupLibraryFilterDrawer();
  renderProfileOverview();
}

function setupProfileFavoriteFilter() {
  const filter = document.querySelector("[data-profile-favorite-filter]");
  const search = document.querySelector("[data-profile-favorite-search]");
  const sort = document.querySelector("[data-profile-favorite-sort]");
  if (filter) {
    if (!state.settings.allowAdult) {
      filter.querySelectorAll('option[value="doujin"], option[value="hentai"], option[value="pornhwa"], option[value="artists"]').forEach((option) => option.remove());
      if (["doujin", "hentai", "pornhwa", "artists"].includes(state.profileFavoriteFilter)) state.profileFavoriteFilter = "all";
    }
    filter.value = state.profileFavoriteFilter;
    filter.addEventListener("change", () => {
      state.profileFavoriteFilter = filter.value;
      renderProfileFavorites(document.querySelector("[data-profile-favorites]"));
    });
  }
  if (search) {
    search.value = state.profileFavoriteSearch;
    search.addEventListener("input", () => {
      state.profileFavoriteSearch = search.value.trim();
      renderProfileFavorites(document.querySelector("[data-profile-favorites]"));
    });
  }
  if (sort) {
    sort.value = state.profileFavoriteSort;
    sort.addEventListener("change", () => {
      state.profileFavoriteSort = sort.value;
      renderProfileFavorites(document.querySelector("[data-profile-favorites]"));
    });
  }
}

function updateLibraryUrl() {
  const params = new URLSearchParams();
  if (state.filter && state.filter !== "all") params.set("status", state.filter);
  if (state.libraryAdultFilter && state.libraryAdultFilter !== "all") params.set("adult", state.libraryAdultFilter);
  if (state.librarySearch) params.set("q", state.librarySearch);
  if (state.libraryFormat !== "all") params.set("format", state.libraryFormat);
  if (state.libraryStatusText !== "all") params.set("airing", state.libraryStatusText);
  if (state.libraryGenre !== "all") params.set("genre", state.libraryGenre);
  if (state.libraryYear !== "all") params.set("year", state.libraryYear);
  if (state.librarySort !== "updated") params.set("sort", state.librarySort);
  const query = params.toString();
  history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
  syncLibraryPageLinks();
}

function syncLibraryPageLinks() {
  const params = new URLSearchParams();
  if (state.filter && state.filter !== "all") params.set("status", state.filter);
  if (state.libraryAdultFilter && state.libraryAdultFilter !== "all") params.set("adult", state.libraryAdultFilter);
  if (state.librarySearch) params.set("q", state.librarySearch);
  if (state.libraryFormat !== "all") params.set("format", state.libraryFormat);
  if (state.libraryStatusText !== "all") params.set("airing", state.libraryStatusText);
  if (state.libraryGenre !== "all") params.set("genre", state.libraryGenre);
  if (state.libraryYear !== "all") params.set("year", state.libraryYear);
  if (state.librarySort !== "updated") params.set("sort", state.librarySort);
  const query = params.toString();
  document.querySelectorAll("[data-library-page]").forEach((link) => {
    const target = link.dataset.libraryPage === "adult" ? "adult-library.html" : link.dataset.libraryPage === "manga" ? "manga-library.html" : "anime-library.html";
    link.href = `${target}${query ? `?${query}` : ""}`;
    link.classList.toggle("active", link.dataset.libraryPage === state.libraryType);
  });
}

function hydrateProfileShell() {
  const avatar = profileAvatarUrl();
  const banner = profileBannerUrl();
  document.body.style.setProperty("--profile-bg", `url("${avatar.replace(/"/g, "%22")}")`);
  document.querySelectorAll("[data-profile-name]").forEach((node) => {
    node.textContent = profileDisplayName();
  });
  document.querySelectorAll("[data-profile-avatar]").forEach((image) => {
    image.src = avatar;
  });
  document.querySelectorAll("[data-profile-hero]").forEach((hero) => {
    hero.style.setProperty("--profile-bg", `url("${banner.replace(/"/g, "%22")}")`);
  });
}

function profileDisplayName() {
  return state.account?.username || "fluffy07";
}

function profileAvatarUrl() {
  const custom = String(state.settings.profileAvatarUrl || "").trim();
  if (custom) return custom;
  const items = Object.values(state.library).filter((item) => item?.image);
  return items[0]?.image || fallbackImage;
}

function profileBannerUrl() {
  const custom = String(state.settings.profileBannerUrl || "").trim();
  if (custom) return custom;
  const items = Object.values(state.library).filter((item) => item?.banner || item?.image);
  return items[0]?.banner || items[0]?.image || fallbackImage;
}

function renderProfileOverview() {
  const rawItems = Object.values(state.library).sort((a, b) => b.updatedAt - a.updatedAt);
  const allItems = state.settings.allowAdult ? rawItems : rawItems.filter(contentVisibleItem);
  const adultItems = state.settings.allowAdult ? allItems.filter(isAdultLibraryItem) : [];
  const animeItems = allItems.filter((item) => item.type === "anime" && !isAdultLibraryItem(item));
  const mangaItems = allItems.filter((item) => item.type === "manga" && !isAdultLibraryItem(item));
  const episodes = animeItems.reduce((sum, item) => sum + Number(item.progress || 0), 0);
  const chapters = mangaItems.reduce((sum, item) => sum + Number(item.progress || 0), 0);
  const adultChapters = adultItems.filter((item) => item.type === "manga").reduce((sum, item) => sum + Number(item.progress || 0), 0);
  const ratings = allItems.map((item) => Number(item.rating)).filter(Boolean);
  const meanScore = ratings.length ? (ratings.reduce((sum, score) => sum + score, 0) / ratings.length).toFixed(1) : "--";

  setText("[data-profile-total-anime]", String(animeItems.length));
  setText("[data-profile-days]", episodes ? (episodes * 24 / 1440).toFixed(1) : "0");
  setText("[data-profile-episodes]", String(episodes));
  setText("[data-profile-total-manga]", String(mangaItems.length));
  setText("[data-profile-chapters]", String(chapters));
  setText("[data-profile-score]", meanScore);
  setText("[data-profile-total-adult]", String(adultItems.length));
  setText("[data-profile-total-hentai]", String(adultItems.filter(isHentaiLibraryItem).length));
  setText("[data-profile-total-pornhwa]", String(adultItems.filter(isPornhwaLibraryItem).length));
  setText("[data-profile-total-doujin]", String(adultItems.filter(isDoujinLibraryItem).length));
  document.querySelector("[data-profile-anime-bar]")?.style.setProperty("width", `${Math.min(100, Math.max(8, animeItems.length * 2))}%`);
  document.querySelector("[data-profile-manga-bar]")?.style.setProperty("width", `${Math.min(100, Math.max(8, chapters / 180))}%`);
  document.querySelector("[data-profile-adult-bar]")?.style.setProperty("width", `${Math.min(100, Math.max(8, adultItems.length * 6))}%`);

  renderProfileHeatmap(allItems);
  renderProfileGenres(allItems);
  renderProfileReadData({ animeItems, mangaItems, adultItems, episodes, chapters, adultChapters });
  renderProfileFavorites(document.querySelector("[data-profile-favorites]"));
  renderProfileFullStats({ allItems, animeItems, mangaItems, adultItems, episodes, chapters, adultChapters, meanScore });
  renderProfileFeed(document.querySelector("[data-profile-feed]"), allItems.slice(0, 6));
}

function favoriteProfileItems(items) {
  const rated = items.filter((item) => Number(item.rating || 0) >= 8);
  const completed = items.filter((item) => item.status === "completed");
  return mergeItems([...rated, ...completed, ...items]).slice(0, 8);
}

function renderProfileHeatmap(items) {
  const container = document.querySelector("[data-profile-heatmap]");
  if (!container) return;
  const activeDays = new Set(items.map((item) => Math.floor(Number(item.updatedAt || Date.now()) / 86400000) % 95));
  container.innerHTML = Array.from({ length: 140 }, (_, index) => {
    const active = activeDays.has(index % 95) || (index * 7) % 31 === 0;
    return `<span class="${active ? "active" : ""}"></span>`;
  }).join("");
}

function renderProfileGenres(items) {
  const chips = document.querySelector("[data-profile-genres]");
  const bar = document.querySelector("[data-profile-genre-bar]");
  if (!chips || !bar) return;
  const counts = new Map();
  items.forEach((item) => (item.genres || []).forEach((genre) => counts.set(genre, (counts.get(genre) || 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const fallback = [["Action", 231], ["Fantasy", 192], ["Adventure", 126], ["Drama", 81]];
  const genres = top.length ? top : fallback;
  const colors = ["#62e53c", "#12a7ed", "#9254ef", "#ef6b9f"];
  chips.innerHTML = genres.map(([genre, count], index) => `
    <div style="--genre-color:${colors[index % colors.length]}"><strong>${escapeHtml(genre)}</strong><span>${count} Entries</span></div>
  `).join("");
  const total = genres.reduce((sum, [, count]) => sum + count, 0) || 1;
  bar.innerHTML = genres.map(([, count], index) => `<span style="width:${(count / total) * 100}%; background:${colors[index % colors.length]}"></span>`).join("");
}

function renderProfilePreview(container, items) {
  if (!container) return;
  if (!items.length) return renderEmpty(container, "Add and rate titles to build your favorites.");
  container.innerHTML = items.map((item) => `
    <button class="profile-mini-card" data-id="${escapeAttr(item.id)}" type="button">
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <span>${escapeHtml(item.title)}</span>
    </button>
  `).join("");
  container.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => openLibraryItem(state.library[button.dataset.id])));
}

function renderProfileFavorites(container) {
  if (!container) return;
  const groups = new Map();
  const query = normalizeSearchText(state.profileFavoriteSearch || "");
  const items = sortProfileFavoriteItems(favoriteItems()
    .filter((item) => favoriteMatchesProfileFilter(item))
    .filter((item) => !query || normalizeSearchText(`${item.title || ""} ${favoriteGroupLabel(item)} ${(item.genres || []).join(" ")}`).includes(query)));
  items.forEach((item) => {
    const label = favoriteGroupLabel(item);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(item);
  });
  if (!groups.size) return renderEmpty(container, state.profileFavoriteFilter === "all" ? "Use the Favorite button on details pages to pin anime, manga, doujin, hentai, pornhwa, artists, and groups here." : "No favorites match this filter yet.");
  container.innerHTML = [...groups.entries()].map(([label, items]) => `
    <section class="profile-favorite-group">
      <h3><span>${escapeHtml(label)}</span><small>${items.length}</small></h3>
      <div class="profile-mini-library">${items.map((item) => `
        <button class="profile-mini-card ${item.favoriteType === "doujin-artist" ? "profile-artist-card" : ""}" data-id="${escapeAttr(item.id)}" type="button">
          ${item.favoriteType === "doujin-artist" ? `<div class="profile-artist-avatar">${escapeHtml(profileArtistInitials(item.title))}</div>` : `<img src="${escapeAttr(item.image || fallbackImage)}" alt="${escapeAttr(item.title)} poster" loading="lazy">`}
          <span>${escapeHtml(item.title)}</span>
        </button>
      `).join("")}</div>
    </section>
  `).join("");
  container.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => {
    const item = favoriteItems().find((favorite) => favorite.id === button.dataset.id);
    if (item) openFavoriteProfileItem(item);
  }));
}

function sortProfileFavoriteItems(items) {
  const sort = state.profileFavoriteSort || "recent";
  const copy = [...items];
  if (sort === "title") return copy.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  if (sort === "type") return copy.sort((a, b) => favoriteGroupLabel(a).localeCompare(favoriteGroupLabel(b)) || String(a.title || "").localeCompare(String(b.title || "")));
  return copy.sort((a, b) => Number(b.favoriteAt || b.updatedAt || 0) - Number(a.favoriteAt || a.updatedAt || 0));
}

function favoriteMatchesProfileFilter(item) {
  const filter = state.profileFavoriteFilter || "all";
  if (filter === "all") return true;
  if (filter === "artists") return item.favoriteType === "doujin-artist";
  if (filter === "doujin") return item.favoriteType !== "doujin-artist" && isDoujinLibraryItem(item);
  if (filter === "pornhwa") return item.favoriteType !== "doujin-artist" && isPornhwaLibraryItem(item);
  if (filter === "hentai") return item.favoriteType !== "doujin-artist" && isHentaiLibraryItem(item);
  if (filter === "manga") return item.favoriteType !== "doujin-artist" && item.type === "manga" && !isAdultLibraryItem(item);
  if (filter === "anime") return item.favoriteType !== "doujin-artist" && item.type === "anime" && !isAdultLibraryItem(item);
  return true;
}

function openFavoriteProfileItem(item) {
  if (item.favoriteType === "doujin-artist") {
    window.location.href = doujinTagUrl(item.category || "artists", item.tag || item.title);
    return;
  }
  openLibraryItem(item);
}

function profileArtistInitials(name) {
  return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "★";
}

function favoriteGroupLabel(item) {
  if (item.favoriteType === "doujin-artist") return "Artists";
  if (isDoujinLibraryItem(item)) return "Doujin";
  if (isPornhwaLibraryItem(item)) return "Pornhwa";
  if (isHentaiLibraryItem(item) || isAdultLibraryItem(item)) return "Hentai";
  return item.type === "manga" ? "Manga / Manhwa" : "Anime";
}

function renderProfileReadData({ mangaItems, adultItems, chapters, adultChapters }) {
  const container = document.querySelector("[data-profile-read-data]");
  if (!container) return;
  const normalCompleted = mangaItems.filter((item) => item.status === "completed").length;
  const adultManga = adultItems.filter((item) => item.type === "manga");
  const doujinRead = adultItems.filter(isDoujinLibraryItem).reduce((sum, item) => sum + Number(item.progress || 0), 0);
  container.innerHTML = `
    <div><strong>${chapters}</strong><span>Manga chapters</span></div>
    <div><strong>${normalCompleted}</strong><span>Manga completed</span></div>
    ${state.settings.allowAdult ? `<div><strong>${adultChapters}</strong><span>Adult chapters</span></div><div><strong>${adultManga.length}</strong><span>Adult manga saved</span></div><div><strong>${doujinRead}</strong><span>Doujin read</span></div>` : ""}
  `;
}

function renderProfileFullStats({ allItems, animeItems, mangaItems, adultItems, episodes, chapters, adultChapters, meanScore }) {
  const container = document.querySelector("[data-profile-full-stats]");
  if (!container) return;
  const completed = allItems.filter((item) => item.status === "completed").length;
  const planning = allItems.filter((item) => item.status === "planning").length;
  const current = allItems.filter((item) => ["watching", "reading"].includes(item.status)).length;
  const hentai = adultItems.filter(isHentaiLibraryItem).length;
  const pornhwa = adultItems.filter(isPornhwaLibraryItem).length;
  const doujin = adultItems.filter(isDoujinLibraryItem).length;
  const daysWatched = episodes ? (episodes * 24 / 1440).toFixed(1) : "0";
  const stats = [
    ["Total titles", allItems.length],
    ["Anime", animeItems.length],
    ["Manga / Manhwa", mangaItems.length],
    ["Episodes watched", episodes],
    ["Days watched", daysWatched],
    ["Manga chapters", chapters],
    ["Completed", completed],
    ["In progress", current],
    ["Planning", planning],
    ["Mean score", meanScore],
    ["Favorites", favoriteItems().length],
  ];
  if (state.settings.allowAdult) stats.push(["Adult titles", adultItems.length], ["Adult chapters", adultChapters], ["Hentai", hentai], ["Pornhwa", pornhwa], ["Doujin", doujin]);
  container.innerHTML = stats.map(([label, value]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join("");
}

function renderProfileFeed(container, items) {
  if (!container) return;
  const storedActivities = loadActivity().filter(activityVisibleItem).slice(0, 6);
  const feedItems = storedActivities.length
    ? storedActivities.map((activity) => ({ item: activity.item, text: activity.text || activityTextForItem(activity.item, activity.action), time: activity.time }))
    : items.filter(contentVisibleItem).slice(0, 6).map((item) => ({ item, text: `${statusLabel(item.status || (item.type === "manga" ? "reading" : "watching"))} ${item.type === "anime" ? "to watch" : "to read"}`, time: item.updatedAt }));
  if (!feedItems.length) return renderEmpty(container, "Your recent activity will appear here.");
  container.innerHTML = feedItems.map(({ item, text, time }) => `
    <button class="profile-feed-item" data-id="${escapeAttr(item.id)}" type="button">
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <div><span>${escapeHtml(text)} <b>${escapeHtml(item.title)}</b></span></div>
      <time>${escapeHtml(time ? relativeTime(time) : "Just now")}</time>
    </button>
  `).join("");
  container.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => {
    const item = state.library[button.dataset.id] || feedItems.find((entry) => entry.item.id === button.dataset.id)?.item || samples.find((sample) => sample.id === button.dataset.id);
    if (item) openLibraryItem(item);
  }));
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
  const activityFeed = document.querySelector("[data-home-activity]");
  const progressGrids = homeProgressGrids();
  const hasProgressGrids = Object.values(progressGrids).some(Boolean);
  const featuredRail = document.querySelector("[data-home-featured]");
  const animeGrid = document.querySelector("[data-home-anime]");
  const mangaGrid = document.querySelector("[data-home-manga]");
  const latestAnime = document.querySelector("[data-home-latest-anime]");
  const latestManga = document.querySelector("[data-home-latest-manga]");
  const rankingList = document.querySelector("[data-home-ranking]");
  const editorPick = document.querySelector("[data-home-editor]");
  const localLibraryItems = Object.values(state.library).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  if (activityFeed) setListLoading(activityFeed, 4);
  renderAllHomeProgress(localLibraryItems, progressGrids);
  if (featuredRail) setRailLoading(featuredRail, 8);
  if (animeGrid) setLoading(animeGrid, 4);
  if (mangaGrid) setLoading(mangaGrid, 4);
  if (latestAnime) setRailLoading(latestAnime, 3);
  if (latestManga) setRailLoading(latestManga, 3);
  if (rankingList) setListLoading(rankingList, 4);

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
  if (activityFeed || hasProgressGrids) {
    const homeItems = mergeItems([...Object.values(state.library), ...featuredItems, ...animeItems, ...mangaItems, ...rankingItems]);
    renderHomeActivity(activityFeed, homeItems);
    renderAllHomeProgress(localLibraryItems, progressGrids);
  }
  if (featuredRail) renderPosterRail(featuredRail, featuredItems.length ? featuredItems : [...animeItems, ...mangaItems]);
  if (animeGrid) renderCards(animeGrid, animeItems);
  if (mangaGrid) renderCards(mangaGrid, mangaItems);
  if (rankingList) renderRankingList(rankingList, rankingItems);
  if (editorPick) renderEditorPick(editorPick, mangaItems[0] || animeItems[0]);
  syncHomePanelHeights();
  window.setTimeout(syncHomePanelHeights, 250);
  if (!activityFeed && !hasProgressGrids) window.setTimeout(loadInitialHomeUpdates, 350);
}

function homeProgressGrids() {
  return {
    anime: document.querySelector("[data-home-progress]"),
    manga: document.querySelector("[data-home-manga-progress]"),
    pornhwa: document.querySelector("[data-home-pornhwa-progress]"),
    hentai: document.querySelector("[data-home-hentai-progress]"),
    doujin: document.querySelector("[data-home-doujin-progress]"),
  };
}

function renderAllHomeProgress(items, grids = homeProgressGrids()) {
  const buckets = { anime: [], manga: [], pornhwa: [], hentai: [], doujin: [] };
  items.filter(homeProgressVisibleItem).forEach((item) => {
    const bucket = homeProgressBucket(item);
    if (bucket && buckets[bucket]) buckets[bucket].push(item);
  });
  Object.entries(grids).forEach(([bucket, grid]) => {
    const section = document.querySelector(`[data-home-progress-section="${bucket}"]`);
    const adultBucket = ["pornhwa", "hentai", "doujin"].includes(bucket);
    const progressItems = buckets[bucket] || [];
    if (section) section.hidden = !progressItems.length || (adultBucket && !state.settings.allowAdult);
    renderHomeProgress(grid, buckets[bucket] || [], bucket);
  });
}

function homeProgressVisibleItem(item) {
  if (!contentVisibleItem(item)) return false;
  const progress = Number(item?.progress || 0);
  const status = String(item?.status || "").toLowerCase();
  return progress > 0 || ["watching", "reading"].includes(status);
}

function homeProgressBucket(item) {
  if (isDoujinLibraryItem(item)) return "doujin";
  if (isPornhwaLibraryItem(item)) return "pornhwa";
  if (isHentaiLibraryItem(item)) return "hentai";
  if (item?.type === "anime") return "anime";
  if (item?.type === "manga") return "manga";
  return "";
}

function renderHomeActivity(container, items) {
  if (!container) return;
  const stored = loadActivity().filter(activityVisibleItem);
  const sourceItems = (items.length ? items : samples).filter(contentVisibleItem);
  state.homeActivityItems = stored.length ? stored : activityFromItems(sourceItems);
  state.homeActivityPage = 1;
  renderHomeActivityPage(container);
}

function renderHomeActivityPage(container, append = false) {
  if (!container) return;
  const end = state.homeActivityPage * ACTIVITY_PAGE_SIZE;
  const feedItems = state.homeActivityItems.slice(0, end);
  const html = feedItems.map((activity) => homeActivityHtml(activity)).join("");
  const hasMore = end < state.homeActivityItems.length;
  container.innerHTML = `${html}${hasMore ? `<div class="home-activity-sentinel" data-home-activity-sentinel>Loading more activity...</div>` : ""}`;
  observeHomeActivitySentinel(container);
}

function homeActivityHtml(activity) {
  const item = activity.item || activity;
  const isManga = item.type === "manga";
  const verb = activity.text || (item.status === "completed" ? "Completed" : item.progress ? `${isManga ? "Read chapter" : "Watched episode"} ${escapeHtml(item.progress)}` : `Plans to ${isManga ? "read" : "watch"}`);
  return `
    <button class="home-activity-card" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.type)}" data-api-id="${escapeAttr(item.apiId || item.id)}" data-title="${escapeAttr(item.title)}" data-image="${escapeAttr(item.image)}" type="button">
      <img class="home-activity-avatar" src="${escapeAttr(item.image || fallbackImage)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <div class="home-activity-copy">
        <div><strong>${escapeHtml(profileDisplayName())}</strong><time>${escapeHtml(relativeTime(activity.time || item.updatedAt))}</time></div>
        <p>${verb} <span>${escapeHtml(item.title)}</span></p>
        <img src="${escapeAttr(item.image || fallbackImage)}" alt="${escapeAttr(item.title)} thumbnail" loading="lazy">
      </div>
      <div class="home-activity-actions"><span>☁</span><span>♥</span></div>
    </button>
  `;
}

function activityFromItems(items) {
  return items.filter(contentVisibleItem).slice(0, ACTIVITY_LIMIT).map((item, index) => ({
    id: `${item.id || item.apiId || index}:${item.updatedAt || index}`,
    time: Number(item.updatedAt || Date.now() - index * 3600000),
    text: activityTextForItem(item),
    item,
  }));
}

function activityVisibleItem(activity) {
  return contentVisibleItem(activity?.item || activity);
}

function setupHomeActivityInfiniteScroll(container) {
  if (!container || container.homeActivityObserver) return;
  container.homeActivityObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    if (state.homeActivityPage * ACTIVITY_PAGE_SIZE >= state.homeActivityItems.length) return;
    state.homeActivityPage += 1;
    renderHomeActivityPage(container, true);
  }, { rootMargin: "240px" });
}

function observeHomeActivitySentinel(container) {
  const sentinel = container.querySelector("[data-home-activity-sentinel]");
  if (!sentinel || !container.homeActivityObserver) return;
  container.homeActivityObserver.disconnect();
  container.homeActivityObserver.observe(sentinel);
}

function legacyRenderHomeActivity(container, items) {
  if (!container) return;
  const feedItems = items.length ? items.slice(0, 8) : samples;
  container.innerHTML = feedItems.map((item, index) => {
    const isManga = item.type === "manga";
    const verb = item.status === "completed" ? "Completed" : item.progress ? `Read ${isManga ? "chapter" : "episode"} ${escapeHtml(item.progress)}` : `Plans to ${isManga ? "read" : "watch"}`;
    return `
      <button class="home-activity-card" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.type)}" data-api-id="${escapeAttr(item.apiId || item.id)}" data-title="${escapeAttr(item.title)}" data-image="${escapeAttr(item.image)}" type="button">
        <img class="home-activity-avatar" src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
        <div class="home-activity-copy">
          <div><strong>${escapeHtml(profileDisplayName())}</strong><time>${index ? `${index + 2} hours ago` : "3 hours ago"}</time></div>
          <p>${verb} <span>${escapeHtml(item.title)}</span></p>
          <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} thumbnail" loading="lazy">
        </div>
        <div class="home-activity-actions"><span>☁</span><span>♥</span></div>
      </button>
    `;
  }).join("");
}

function renderHomeProgress(container, items, mediaType = "anime") {
  if (!container) return;
  const progressItems = items.slice(0, 20);
  if (!progressItems.length) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = progressItems.map((item, index) => {
    const isManga = item.type === "manga" || ["manga", "pornhwa", "doujin"].includes(mediaType);
    const total = Number(item.total || 0);
    const progress = Number(item.progress || 0);
    const percent = total ? Math.min(100, Math.round((progress / total) * 100)) : index === 0 ? 72 : 0;
    const label = progress ? `${isManga ? "Ch" : "Ep"} ${progress}` : total ? `0/${total}` : item.year || "TBA";
    const time = total && progress ? `${Math.max(1, total - progress)} ${isManga ? "chapters" : "episodes"} left` : item.format || (isManga ? "Manga" : "Anime");
    const image = item.image || fallbackImage;
    return `
      <button class="home-progress-card" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.type)}" data-api-id="${escapeAttr(item.apiId || item.id)}" data-title="${escapeAttr(item.title)}" data-image="${escapeAttr(image)}" style="--progress:${percent}%" type="button">
        <img src="${escapeAttr(image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
        <span>${escapeHtml(label)}<small>${escapeHtml(time)}</small></span>
      </button>
    `;
  }).join("");
}

function homeProgressLabel(type) {
  return ({ anime: "anime", manga: "manga", pornhwa: "pornhwa", hentai: "hentai", doujin: "doujin" }[type] || "titles");
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
  if (browseHasActiveFilters()) renderBrowseSpotlight([]);
  setLoading(grid, BROWSE_PAGE_SIZE);

  try {
    state.currentItems = state.browseCache.get(cacheKey) || await fetchBrowseItems(pageNumber);
    state.browseCache.set(cacheKey, state.currentItems);
    if (token !== state.browseToken) return;
    state.browseHasMore = state.currentItems.length >= BROWSE_PAGE_SIZE;
    heading.textContent = headingText();
    renderBrowseSpotlight(browseHasActiveFilters() ? [] : state.currentItems.slice(0, 10));
    renderBrowseCards(grid, state.currentItems);
    updateBrowsePager();
    preloadAdjacentBrowsePages();
    updateBrowseSentinel();
  } catch (error) {
    if (token !== state.browseToken) return;
    state.currentItems = samples.filter((item) => item.type === page);
    state.browseHasMore = false;
    renderBrowseSpotlight(browseHasActiveFilters() ? [] : state.currentItems.slice(0, 10));
    renderBrowseCards(grid, state.currentItems);
    updateBrowsePager();
    updateBrowseSentinel();
    showToast("Live data could not load. Showing sample titles.");
  }
}

function browseHasActiveFilters() {
  return Boolean(
    state.browseQuery
    || state.genres.length
    || state.adultGenreOnly
    || state.year
    || state.status
  );
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
  const idArg = apiSource === "jikan" ? "idMal: $id" : "id: $id";
  const filter = animeFilterArgs([idArg, "type: ANIME"], false);
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(${filter}) {
        ...DetailMediaCard
        synonyms
        studios(isMain: true) { nodes { name } }
        streamingEpisodes { title thumbnail site }
        relations { edges { relationType(version: 2) node { ...DetailMediaCard } } }
        recommendations(sort: RATING_DESC, perPage: 12) { nodes { rating mediaRecommendation { ...DetailMediaCard } } }
      }
    }
    ${ANILIST_DETAIL_MEDIA_FRAGMENT}`,
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
  const idArg = apiSource === "jikan" ? "idMal: $id" : "id: $id";
  const filter = animeFilterArgs([idArg, "type: MANGA"], false);
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(${filter}) {
        ...DetailMediaCard
        synonyms
        staff(perPage: 1) { nodes { name { full } } }
        relations { edges { relationType(version: 2) node { ...DetailMediaCard } } }
        recommendations(sort: RATING_DESC, perPage: 12) { nodes { rating mediaRecommendation { ...DetailMediaCard } } }
      }
    }
    ${ANILIST_DETAIL_MEDIA_FRAGMENT}`,
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
          id title { romaji english native } synonyms description(asHtml: false) chapters volumes averageScore popularity seasonYear status format genres bannerImage coverImage { extraLarge large color }
        }
      }
    }`,
    variables
  );
  return data.Page.media.map(mapAniListManga);
}

async function anilistQuery(query, variables) {
  const request = {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  };
  let response;
  try {
    response = await fetch(apiRequestUrl(ANILIST_URL), request);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  } catch (error) {
    response = await fetch(ANILIST_DIRECT_URL, request);
  }
  assertOk(response);
  const payload = await response.json();
  if (payload.errors) throw new Error(payload.errors.map((error) => error.message).join(", "));
  return payload.data;
}

function assertOk(response) {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}

function mapAniListMedia(item) {
  if (!item) return null;
  return String(item.type || "").toLowerCase() === "manga" ? mapAniListManga(item) : mapAniList(item);
}

function mapAniListRelations(edges) {
  return (edges || [])
    .map((edge) => ({ relationType: edge?.relationType || "RELATED", media: mapAniListMedia(edge?.node) }))
    .filter((entry) => entry.media && contentVisibleItem(entry.media));
}

function mapAniListRecommendations(nodes) {
  return (nodes || [])
    .map((node) => ({ rating: node?.rating || 0, media: mapAniListMedia(node?.mediaRecommendation) }))
    .filter((entry) => entry.media && contentVisibleItem(entry.media));
}

function mapAniList(item) {
  const apiSource = item.dataSource === "jikan" ? "jikan" : "anilist";
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
    image: item.coverImage?.extraLarge || item.coverImage?.large || fallbackImage,
    banner: item.bannerImage || "",
    accent: item.coverImage?.color || colorFromString(title || String(item.id)),
    score: item.averageScore ? `${item.averageScore}%` : "N/A",
    year: item.seasonYear || "TBA",
    total: item.episodes || 0,
    duration: item.duration || 0,
    unit: "eps",
    genres: item.genres || [],
    isAdult: Boolean(item.isAdult),
    format: item.format || "Anime",
    statusText: item.status || "Unknown",
    extra: [item.duration ? `${item.duration} min` : "", item.popularity ? `${item.popularity.toLocaleString()} popular` : "", item.studios?.nodes?.[0]?.name || ""].filter(Boolean),
    episodesList: item.streamingEpisodes?.map((episode, index) => ({
      title: episode.title || `Episode ${index + 1}`,
      time: episode.site || "Episode",
      image: episode.thumbnail || "",
    })) || [],
    relations: mapAniListRelations(item.relations?.edges),
    recommendations: mapAniListRecommendations(item.recommendations?.nodes),
  };
}

function mapAniListManga(item) {
  const apiSource = item.dataSource === "jikan" ? "jikan" : "anilist";
  const englishTitle = item.title.english || "";
  const romajiTitle = item.title.romaji || "";
  const nativeTitle = item.title.native || "";
  const title = englishTitle || romajiTitle || nativeTitle || "Untitled";
  const alternativeTitles = uniqueStrings([englishTitle, ...(item.synonyms || []), romajiTitle, nativeTitle]).filter((name) => normalizeSearchText(name) !== normalizeSearchText(title));
  return {
    id: `manga-${item.id}`,
    apiId: item.id,
    apiSource,
    malId: item.idMal || "",
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
    image: item.coverImage?.extraLarge || item.coverImage?.large || fallbackImage,
    banner: item.bannerImage || "",
    accent: item.coverImage?.color || colorFromString(title),
    score: item.averageScore ? `${item.averageScore}%` : "N/A",
    year: item.seasonYear || "TBA",
    total: item.chapters || 0,
    unit: "ch",
    genres: item.genres || [],
    isAdult: Boolean(item.isAdult),
    format: item.format || "Manga",
    statusText: item.status || "Unknown",
    extra: [item.volumes ? `${item.volumes} volumes` : "", item.popularity ? `${item.popularity.toLocaleString()} popular` : "", item.staff?.nodes?.[0]?.name?.full || ""].filter(Boolean),
    relations: mapAniListRelations(item.relations?.edges),
    recommendations: mapAniListRecommendations(item.recommendations?.nodes),
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
  const activityItem = card.classList.contains("home-activity-card") ? homeActivityItemById(card.dataset.id) : null;
  const item = activityItem || state.currentItems.find((entry) => entry.id === card.dataset.id) || itemFromDataset(card);
  openLibraryItem(resolveNavigableItem(item));
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
  const activityItem = start.card.classList.contains("home-activity-card") ? homeActivityItemById(start.id) : null;
  const item = activityItem || state.currentItems.find((entry) => entry.id === start.id) || itemFromDataset(start.card);
  openLibraryItem(resolveNavigableItem(item));
}

function homeActivityItemById(id) {
  return state.homeActivityItems.find((activity) => (activity.item || activity)?.id === id)?.item || null;
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
  const adultList = document.querySelector('[data-library-list="adult"]');
  if (!animeList && !mangaList && !adultList) return;

  const allItems = Object.values(state.library).sort((a, b) => b.updatedAt - a.updatedAt);
  const query = normalizeSearchText(state.librarySearch);
  const searchedItems = query ? allItems.filter((item) => normalizeSearchText(`${item.title} ${item.nativeTitle || ""}`).includes(query)) : allItems;
  const statusItems = state.filter === "all" ? searchedItems : searchedItems.filter((item) => item.status === state.filter);
  const advancedItems = statusItems.filter((item) => {
    if (state.libraryFormat !== "all" && normalizedFilterValue(item.format || item.displayType) !== state.libraryFormat) return false;
    if (state.libraryStatusText !== "all" && normalizedFilterValue(item.statusText) !== state.libraryStatusText) return false;
    if (state.libraryGenre !== "all" && !(item.genres || []).some((genre) => normalizedFilterValue(genre) === state.libraryGenre)) return false;
    if (state.libraryYear !== "all" && String(item.year || "") !== state.libraryYear) return false;
    return true;
  });
  const items = sortLibraryItems(advancedItems);
  const animeItems = items.filter((item) => item.type === "anime" && !isAdultLibraryItem(item));
  const mangaItems = items.filter((item) => item.type === "manga" && !isAdultLibraryItem(item));
  const adultItems = items.filter((item) => {
    if (!isAdultLibraryItem(item)) return false;
    if (state.libraryAdultFilter === "doujin") return isDoujinLibraryItem(item);
    if (state.libraryAdultFilter === "hentai") return isHentaiAnimeItem(item);
    if (state.libraryAdultFilter === "pornhwa") return isPornhwaLibraryItem(item);
    return true;
  });

  if (animeList) renderLibraryGroup(animeList, animeItems, allItems.length ? "No anime match this filter." : "No anime tracked yet. Add titles from the Anime page.");
  if (mangaList) renderLibraryGroup(mangaList, mangaItems, allItems.length ? "No manga match this filter." : "No manga tracked yet. Add titles from the Manga page.");
  if (adultList) renderLibraryGroup(adultList, adultItems, allItems.length ? "No adult titles match this filter." : "No adult titles tracked yet. Add hentai or doujin from adult sources.");
  setText("[data-anime-count]", `${animeItems.length} ${animeItems.length === 1 ? "title" : "titles"}`);
  setText("[data-manga-count]", `${mangaItems.length} ${mangaItems.length === 1 ? "title" : "titles"}`);
  const pageItems = state.libraryType === "adult" ? adultItems : state.libraryType === "manga" ? mangaItems : animeItems;
  const allPageItems = allItems.filter((item) => state.libraryType === "adult" ? isAdultLibraryItem(item) : item.type === state.libraryType && !isAdultLibraryItem(item));
  setText("[data-library-summary]", state.libraryType === "adult" ? `${allPageItems.length} adult titles saved locally` : state.libraryType === "manga" ? `${allPageItems.length} manga saved locally` : `${allPageItems.length} anime saved locally`);
  setText("[data-library-total-count]", String(pageItems.length));
  setText("[data-library-adult-count]", String(pageItems.filter(isAdultLibraryItem).length));
  setText("[data-library-normal-count]", String(pageItems.filter((item) => !isAdultLibraryItem(item)).length));
  const heading = document.querySelector(".profile-library-head h2");
  if (heading) heading.textContent = state.filter === "all" ? (state.libraryType === "adult" ? "Adult Library" : state.libraryType === "manga" ? "Reading" : "Watching") : statusLabel(state.filter);

  updateStats();
}

function populateLibraryAdvancedFilters() {
  const kind = document.body.dataset.libraryKind || "anime";
  const pageItems = Object.values(state.library).filter((item) => kind === "adult" ? isAdultLibraryItem(item) : item.type === kind && !isAdultLibraryItem(item));
  populateLibrarySelect("Format", uniqueStrings(pageItems.map((item) => item.format || item.displayType).filter(Boolean)), "Format");
  populateLibrarySelect("StatusText", uniqueStrings(pageItems.map((item) => item.statusText).filter(Boolean)), "Status");
  populateLibrarySelect("Genre", uniqueStrings(pageItems.flatMap((item) => item.genres || [])), "Genres");
  populateLibrarySelect("Year", uniqueStrings(pageItems.map((item) => String(item.year || "")).filter((value) => value && value !== "TBA")), "Year");
}

function populateLibrarySelect(key, values, placeholder) {
  const select = document.querySelector(`[data-library-advanced-filter="${key}"]`);
  if (!select) return;
  const stateKey = `library${key}`;
  const selected = state[stateKey] || "all";
  select.innerHTML = `<option value="all">${escapeHtml(placeholder)}</option>${values.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })).map((value) => `<option value="${escapeAttr(normalizedFilterValue(value))}">${escapeHtml(value)}</option>`).join("")}`;
  select.value = [...select.options].some((option) => option.value === selected) ? selected : "all";
  state[stateKey] = select.value;
}

function normalizedFilterValue(value) {
  return normalizeSearchText(String(value || "all")).replace(/\s+/g, "-") || "all";
}

function sortLibraryItems(items) {
  const copy = [...items];
  if (state.librarySort === "title") return copy.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  if (state.librarySort === "score") return copy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number.parseFloat(b.score || 0) - Number.parseFloat(a.score || 0));
  if (state.librarySort === "progress") return copy.sort((a, b) => Number(b.progress || 0) - Number(a.progress || 0));
  if (state.librarySort === "year") return copy.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  return copy.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
}

function isAdultLibraryItem(item) {
  return Boolean(item?.isAdult)
    || /doujinshi|adult|hentai|pornhwa/i.test(`${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")}`)
    || isAdultMangaProvider(item?.provider)
    || isAdultMangaProvider(String(item?.providerId || item?.apiId || "").split(":")[0]);
}

function contentVisibleItem(item) {
  if (state.settings.allowAdult) return true;
  if (!item) return false;
  if (item.favoriteType === "doujin-artist") return false;
  return !isAdultLibraryItem(item);
}

function isDoujinLibraryItem(item) {
  return /doujinshi/i.test(`${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")}`)
    || DOUJIN_SOURCES.some((source) => String(item?.apiId || item?.providerId || "").startsWith(`${source.id}:`));
}

function isHentaiLibraryItem(item) {
  if (!isAdultLibraryItem(item) || isDoujinLibraryItem(item) || isPornhwaLibraryItem(item)) return false;
  return item?.type === "anime" || /hentai|adult/i.test(`${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")} ${item?.provider || ""} ${item?.providerId || ""} ${item?.apiId || ""}`);
}

function isPornhwaLibraryItem(item) {
  if (!isAdultLibraryItem(item) || isDoujinLibraryItem(item)) return false;
  const provider = String(item?.provider || String(item?.providerId || item?.apiId || "").split(":")[0]).toLowerCase();
  const text = `${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")} ${item?.provider || ""} ${item?.providerId || ""} ${item?.apiId || ""}`;
  return ["pornhwaz", "pornhwapro"].includes(provider)
    || isAdultMangaProvider(provider)
    || (item?.type === "manga" && /hentai|adult|pornhwa|manhwa/i.test(text))
    || /pornhwa|adult manhwa/i.test(text);
}

function doujinLibraryApiId(item) {
  const id = String(item?.apiId || item?.providerId || "");
  if (DOUJIN_SOURCES.some((source) => id.startsWith(`${source.id}:`))) return id;
  return String(item?.id || "").replace(/^doujin-/, "");
}

function openLibraryItem(item) {
  if (!item) return;
  if (isDoujinLibraryItem(item)) {
    sessionStorage.setItem("doujin-preview-manga", JSON.stringify(item));
    window.location.href = `doujin-preview.html?id=${encodeURIComponent(doujinLibraryApiId(item))}`;
    return;
  }
  goToDetails(item);
}

function resolveNavigableItem(item) {
  if (!item) return null;
  const libraryId = item.libraryId || item.id;
  if (libraryId && state.library[libraryId]) return state.library[libraryId];
  if (item.item) return resolveNavigableItem(item.item);
  return item.type && (item.apiId || item.id) ? item : null;
}

function renderLibraryGroup(container, items, emptyMessage) {
  container.innerHTML = "";
  container.dataset.libraryViewMode = state.libraryView;
  if (!items.length) return renderEmpty(container, emptyMessage);

  if (state.libraryView === "compact" || state.libraryView === "text") {
    container.append(renderLibraryTable(items, state.libraryView));
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.append(renderLibraryItem(item)));
  container.append(fragment);
}

function renderLibraryTable(items, view) {
  const table = create("div", `library-table library-table-${view}`);
  table.setAttribute("role", "table");
  table.innerHTML = `
    <div class="library-table-head" role="row">
      <span>Title</span>
      <span>Score</span>
      <span>Progress</span>
      <span>Type</span>
    </div>
  `;
  items.forEach((item) => table.append(renderLibraryTableRow(item, view)));
  return table;
}

function renderLibraryTableRow(item, view) {
  const row = create("div", "library-table-row");
  row.setAttribute("role", "row");
  row.tabIndex = 0;
  setMediaDataset(row, item);
  row.innerHTML = `
    <span class="library-table-title" role="cell">
      ${view === "compact" ? `<img src="${escapeAttr(item.image || fallbackImage)}" alt="${escapeAttr(item.title)} poster" loading="lazy">` : ""}
      <b>${escapeHtml(item.title)}</b>
    </span>
    <span role="cell">${escapeHtml(libraryScoreText(item))}</span>
    <span role="cell">${escapeHtml(libraryProgressText(item))}</span>
    <span role="cell">${escapeHtml(libraryTypeText(item))}</span>
  `;
  row.addEventListener("click", (event) => {
    event.stopPropagation();
    openLibraryItem(item);
  });
  row.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openLibraryItem(item);
  });
  return row;
}

function libraryScoreText(item) {
  const rating = Number(item.rating || 0);
  if (rating > 0) return String(rating);
  const score = String(item.score || "").trim();
  return score && !/^n\/?a$/i.test(score) ? score : "";
}

function libraryProgressText(item) {
  const progress = Number(item.progress || 0);
  const total = Number(item.total || 0);
  return total > 0 ? `${progress}/${total}` : String(progress || 0);
}

function libraryTypeText(item) {
  const text = String(item.displayType || item.format || item.unit || "").trim();
  if (/episodes?|eps/i.test(text)) return "TV";
  if (/chapters?|chapter/i.test(text)) return isDoujinLibraryItem(item) ? "Doujin" : "Manga";
  return text || (item.type === "anime" ? "TV" : "Manga");
}

function renderLibraryItem(item) {
  const total = item.total || 0;
  const percent = total ? Math.min(100, Math.round(((item.progress || 0) / total) * 100)) : 0;
  const progressText = `${item.progress || 0}${total ? ` / ${total}` : ""} ${item.unit}`;
  const row = create("button", `library-item ${isAdultLibraryItem(item) ? "adult" : "normal"}`);
  row.type = "button";
  setMediaDataset(row, item);
  row.innerHTML = `
    <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
    <div class="library-card-overlay">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(progressText)}</p>
      <span class="library-card-percent" style="--percent:${percent}%">${percent}%</span>
    </div>
  `;
  const openItem = () => openLibraryItem(item);
  row.addEventListener("click", (event) => {
    event.stopPropagation();
    openItem();
  });
  row.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openItem();
  });
  return row;
}

function updateLibraryItemStatus(id, status) {
  const item = state.library[id];
  if (!item || !status) return;
  item.status = status;
  item.updatedAt = Date.now();
  recordActivity(item, "updated");
  persistLibrary();
  renderLibrary();
}

function detailActionIcon(type) {
  const icons = {
    play: '<svg class="detail-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.7v14.6L18.6 12 7 4.7Z"/></svg>',
    edit: '<svg class="detail-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16.9-.7 2.8 2.8-.7L17.8 8.3 15.7 6.2 5 16.9Zm14.4-10.2-2.1-2.1 1.1-1.1a1.5 1.5 0 0 1 2.1 0 1.5 1.5 0 0 1 0 2.1l-1.1 1.1Z"/></svg>',
    heart: '<svg class="detail-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 20.6-1.2-1.1C6.4 15.5 3.5 12.8 3.5 9.5A4.4 4.4 0 0 1 8 5c1.6 0 3.1.8 4 2 1-1.2 2.4-2 4-2a4.4 4.4 0 0 1 4.5 4.5c0 3.3-2.9 6-7.3 10L12 20.6Zm0-2.7c3.9-3.5 6.3-5.8 6.3-8.4 0-1.5-1-2.4-2.3-2.4-1 0-2.1.7-2.7 1.7L12 11l-1.3-2.2C10.1 7.8 9 7.1 8 7.1c-1.3 0-2.3.9-2.3 2.4 0 2.6 2.4 4.9 6.3 8.4Z"/></svg>',
    star: '<svg class="detail-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3L7.4 14 2.8 9.5l6.4-.9L12 2.8Z"/></svg>',
    share: '<svg class="detail-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.1c-1 0-1.9.4-2.5 1.1L8.8 13.3a3.8 3.8 0 0 0 0-2.6l6.6-3.8A3.3 3.3 0 1 0 14.5 5c0 .2 0 .4.1.6L8 9.5a3.4 3.4 0 1 0 0 5l6.6 3.9a3.1 3.1 0 0 0-.1.7 3.5 3.5 0 1 0 3.5-3.5Z"/></svg>'
  };
  return icons[type] || "";
}

function detailTabsHtml(active, chapters) {
  const primaryKey = active.type === "anime" ? "episodes" : "chapters";
  const primaryLabel = active.type === "anime" ? "Episodes" : "Chapters";
  return `
    <section class="detail-episodes ${active.type === "anime" ? "detail-anime-episodes" : ""}">
      <div class="detail-tab-strip" role="tablist" aria-label="Details sections">
        ${detailTabButtonHtml(primaryKey, primaryLabel, true)}
        ${detailTabButtonHtml("relations", "Relations")}
        <button type="button" disabled>Themes</button>
        ${detailTabButtonHtml("recommendations", "Recommendations")}
      </div>
      ${active.type === "anime" ? detailAnimeEpisodesPanelHtml() : detailMangaChaptersPanelHtml(active, chapters)}
      ${detailMediaPanelHtml(active, "relations")}
      ${detailMediaPanelHtml(active, "recommendations")}
    </section>`;
}

function detailTabButtonHtml(tab, label, active = false) {
  return `<button class="${active ? "active" : ""}" type="button" role="tab" data-detail-tab="${escapeAttr(tab)}" aria-selected="${active}">${escapeHtml(label)}</button>`;
}

function detailAnimeEpisodesPanelHtml() {
  return `
    <div class="detail-tab-panel active" data-detail-panel="episodes">
      <div class="detail-episode-head">
        <h2>Episodes</h2>
        <label class="detail-source-picker">Source <select data-detail-anime-source><option>Loading sources...</option></select></label>
        <span data-detail-anime-source-count>Loading episodes...</span>
        <label>Find source as <input data-detail-anime-query type="search" placeholder="Custom source title" autocomplete="off"></label>
      </div>
      <div class="chapter-list detail-chapter-list detail-anime-episode-list" data-detail-anime-episode-list><div class="empty">Choose a source to load real episodes.</div></div>
    </div>`;
}

function detailMangaChaptersPanelHtml(active, chapters) {
  return `
    <div class="detail-tab-panel active" data-detail-panel="chapters">
      <div class="detail-episode-head">
        <h2>Chapters</h2>
        <label class="detail-source-picker">Source <select data-detail-manga-source><option>Loading sources...</option></select></label>
        <span data-detail-manga-source-count>Loading chapters...</span>
        <span>${chapters.length ? "1" : "0"} / 1</span>
      </div>
      <form class="detail-source-search" data-detail-source-search>
        <label>Find source as <input data-detail-source-query type="search" placeholder="Custom site title, e.g. Reveries of the Moonlight" autocomplete="off"></label>
        <button class="btn secondary" type="submit">Add Source</button>
        <span data-detail-source-search-status></span>
      </form>
      <div class="detail-list-filter">All ⌕ <span>|</span> ${escapeHtml(active.title)}</div>
      <div class="detail-chapter-list detail-manga-card-grid" data-detail-chapter-list>${chapters.map((chapter, index) => detailMangaChapterCardHtml(chapter, active, index)).join("")}</div>
    </div>`;
}

function detailMediaEntries(active, section) {
  const source = section === "relations" ? active.relations : active.recommendations;
  return (source || [])
    .map((entry) => {
      const media = entry?.media || entry?.item || (entry?.id ? entry : null);
      return media && contentVisibleItem(media) ? { ...entry, media } : null;
    })
    .filter(Boolean);
}

function detailMediaPanelHtml(active, section) {
  const entries = detailMediaEntries(active, section);
  const isRelations = section === "relations";
  const title = isRelations ? "Relations" : "Recommendations";
  const eyebrow = isRelations ? "Connected timeline" : "More like this";
  const description = isRelations ? "Sequels, prequels, side stories, and alternate versions from AniList." : "Community recommendations connected to this title.";
  const empty = isRelations ? "No connected titles returned by AniList." : "No recommendations returned by AniList.";
  return `
    <div class="detail-tab-panel detail-media-panel" data-detail-panel="${escapeAttr(section)}" hidden>
      <div class="detail-panel-heading">
        <div><span>${escapeHtml(eyebrow)}</span><h2>${escapeHtml(title)}</h2></div>
        <p>${escapeHtml(description)}</p>
      </div>
      ${entries.length ? (isRelations ? detailRelationTreeHtml(active, entries) : `<div class="detail-related-grid">${entries.map((entry, index) => detailMediaCardHtml(entry, section, index)).join("")}</div>`) : `<div class="empty detail-related-empty">${escapeHtml(empty)}</div>`}
    </div>`;
}

function detailRelationTreeHtml(active, entries) {
  const orderedEntries = orderRelationEntries(entries);
  return `
    <div class="detail-relation-tree" aria-label="Relation tree">
      <div class="detail-relation-origin">
        <span class="detail-relation-origin-kicker">Current title</span>
        <div class="detail-relation-origin-card">
          <img src="${escapeAttr(active.image || fallbackImage)}" alt="${escapeAttr(active.title)} poster" loading="lazy">
          <div>
            <strong>${escapeHtml(active.title)}</strong>
            <span>${escapeHtml([active.format || mediaLabel(active), active.year, active.total ? `${active.total} ${active.unit}` : ""].filter(Boolean).join(" / "))}</span>
          </div>
        </div>
      </div>
      <div class="detail-relation-branches">
        ${orderedEntries.map(({ entry, index }) => detailRelationBranchHtml(entry, index)).join("")}
      </div>
    </div>`;
}

function detailRelationBranchHtml(entry, index) {
  const media = entry.media;
  const label = relationTypeLabel(entry.relationType);
  return `
    <a class="detail-relation-branch" href="${escapeAttr(detailUrl(media))}" data-detail-media-section="relations" data-detail-media-index="${index}">
      <span class="detail-relation-connector"><b>${escapeHtml(label)}</b></span>
      <span class="detail-relation-node">
        <img src="${escapeAttr(media.image || fallbackImage)}" alt="${escapeAttr(media.title)} poster" loading="lazy">
        <span class="detail-relation-copy">
          <strong>${escapeHtml(media.title)}</strong>
          <small>${metaHtml([mediaLabel(media), media.year, media.score, media.total ? `${media.total} ${media.unit}` : ""])}</small>
        </span>
      </span>
    </a>`;
}

function orderRelationEntries(entries) {
  const priority = {
    PREQUEL: 0,
    PARENT: 1,
    ADAPTATION: 2,
    SOURCE: 3,
    SEQUEL: 4,
    SIDE_STORY: 5,
    SPIN_OFF: 6,
    ALTERNATIVE: 7,
    SUMMARY: 8,
    CHARACTER: 9,
    OTHER: 10,
  };
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => (priority[a.entry.relationType] ?? 20) - (priority[b.entry.relationType] ?? 20));
}

function detailMediaCardHtml(entry, section, index) {
  const media = entry.media;
  const label = section === "relations" ? relationTypeLabel(entry.relationType) : recommendationLabel(entry.rating);
  return `
    <a class="detail-related-card" href="${escapeAttr(detailUrl(media))}" data-detail-media-section="${escapeAttr(section)}" data-detail-media-index="${index}">
      <img src="${escapeAttr(media.image || fallbackImage)}" alt="${escapeAttr(media.title)} poster" loading="lazy">
      <span class="detail-related-chip">${escapeHtml(label)}</span>
      <div class="detail-related-copy">
        <strong>${escapeHtml(media.title)}</strong>
        <div class="meta">${metaHtml([mediaLabel(media), media.year, media.score, media.total ? `${media.total} ${media.unit}` : ""])}</div>
      </div>
    </a>`;
}

function relationTypeLabel(value) {
  return String(value || "Related").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function recommendationLabel(value) {
  const rating = Number(value || 0);
  return rating > 0 ? `${rating.toLocaleString()} likes` : "Recommended";
}

function bindDetailTabs(root) {
  const tabs = [...root.querySelectorAll("[data-detail-tab]")];
  const panels = [...root.querySelectorAll("[data-detail-panel]")];
  tabs.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.detailTab;
      tabs.forEach((tab) => {
        const active = tab.dataset.detailTab === target;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.detailPanel !== target;
        panel.classList.toggle("active", panel.dataset.detailPanel === target);
      });
    });
  });
}

function bindDetailMediaLinks(root, active) {
  const entries = {
    relations: detailMediaEntries(active, "relations"),
    recommendations: detailMediaEntries(active, "recommendations"),
  };
  root.querySelectorAll("[data-detail-media-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const entry = entries[link.dataset.detailMediaSection]?.[Number(link.dataset.detailMediaIndex)];
      if (!entry?.media) return;
      event.preventDefault();
      goToDetails(entry.media);
    });
  });
}

function renderDetails(root, item, isTemporary = false) {
  const tracked = state.library[item.id];
  const active = { ...item, ...tracked };
  const favoriteActive = isFavoriteItem(active);
  const progress = Number(active.progress || 0);
  const total = Number(active.total || 0);
  const progressPercent = total ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  const accent = normalizeColor(state.settings.themeColor || active.accent || colorFromString(active.title));
  const accentRgb = hexToRgb(accent);
  const chapters = active.type === "manga" ? buildChapterRows(active) : [];
  const countLabel = active.total ? `${active.total} ${active.type === "anime" ? "episodes" : "chapters"}` : active.type === "anime" ? "Episodes TBA" : "Chapters TBA";
  const audience = (active.extra || []).find((value) => /popular|members/i.test(value)) || "Library ready";
  const backdrop = active.banner || "";
  const heroImage = backdrop || active.image || fallbackImage;
  const posterImage = active.image || fallbackImage;
  const primaryAction = active.type === "anime" ? "Watch Now" : "Read Now";
  const primaryActionAttr = active.type === "anime" ? "data-watch-button" : "data-read-button";
  const detailPills = [countLabel, active.format || mediaLabel(active), active.statusText, active.year, active.score].filter((value) => value && !/^n\/?a$/i.test(String(value)));
  const detailTags = uniqueStrings([...(active.genres || []), ...(active.extra || []).filter((value) => !/popular|members/i.test(value))]).slice(0, 14);
  state.current = active;
  document.body.dataset.detailType = active.type;
  document.title = `AniTrack | ${active.title}`;

  root.innerHTML = `
    <section class="detail-pro" style="--detail-bg: url('${escapeAttr(heroImage)}'); --detail-accent: ${accent}; --detail-accent-rgb: ${accentRgb};">
      <div class="detail-backdrop">
        <img src="${escapeAttr(heroImage)}" alt="${escapeAttr(active.title)} backdrop">
      </div>
      <div class="detail-pro-top">
        <aside class="detail-cover-stack">
          <button class="detail-poster-button" data-detail-poster-open type="button" aria-label="Open ${escapeAttr(active.title)} poster">
            <img class="detail-pro-cover" src="${escapeAttr(posterImage)}" alt="${escapeAttr(active.title)} poster">
            <span class="detail-poster-expand" aria-hidden="true">↗</span>
          </button>
          <button class="btn detail-primary-watch" ${primaryActionAttr} type="button">${detailActionIcon("play")}<span>${escapeHtml(primaryAction)}</span></button>
        </aside>
        <main class="detail-pro-main">
          <div class="detail-title-block">
            <span class="detail-source">${escapeHtml(active.romajiTitle || active.nativeTitle || mediaLabel(active))}${isTemporary ? " / saved copy" : ""}</span>
            <h1>${escapeHtml(active.title)}</h1>
            ${active.nativeTitle ? `<p class="detail-native">${escapeHtml(active.nativeTitle)}</p>` : ""}
          </div>
          <div class="detail-meta-line">
            ${detailPills.map((pill, index) => `<span class="${index === detailPills.length - 1 && /%|score|rating/i.test(String(pill)) ? "score-pill" : ""}">${escapeHtml(pill)}</span>`).join("")}
          </div>
          <div class="detail-description"><p>${escapeHtml(active.description)}</p></div>
          <section class="detail-library-inline" aria-label="Library controls">
            <div class="detail-library-popover-wrap">
              <button class="detail-square-action detail-library-toggle" data-library-editor-toggle type="button" aria-expanded="false" aria-label="${tracked ? "Edit library" : "Add to library"}">${detailActionIcon("edit")}</button>
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
            <button class="detail-square-action detail-favorite-toggle ${favoriteActive ? "active" : ""}" data-favorite-toggle type="button" aria-label="Favorite title" aria-pressed="${favoriteActive}">${detailActionIcon(favoriteActive ? "star" : "heart")}</button>
            <button class="detail-square-action" data-detail-share type="button" aria-label="Copy details link">${detailActionIcon("share")}</button>
            <span class="detail-api-badge">${escapeHtml(active.source || (active.apiSource === "jikan" ? "Jikan" : "AniList"))}</span>
            <span class="detail-audience-pill">${escapeHtml(audience)}</span>
          </section>
          <div class="detail-genre-line">${detailTags.map((genre) => `<span>${escapeHtml(genre)}</span>`).join("")}</div>
        </main>
      </div>
      ${detailTabsHtml(active, chapters)}
      <div class="detail-poster-modal" data-detail-poster-modal hidden>
        <button class="detail-poster-modal-backdrop" data-detail-poster-close type="button" aria-label="Close poster preview"></button>
        <figure class="detail-poster-modal-card">
          <button class="detail-poster-close" data-detail-poster-close type="button" aria-label="Close poster preview">×</button>
          <img src="${escapeAttr(posterImage)}" alt="${escapeAttr(active.title)} full poster">
        </figure>
      </div>
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
  root.querySelector("[data-favorite-toggle]")?.addEventListener("click", () => {
    const activeFavorite = toggleFavoriteItem(state.current);
    const button = root.querySelector("[data-favorite-toggle]");
    button.classList.toggle("active", activeFavorite);
    button.innerHTML = detailActionIcon(activeFavorite ? "star" : "heart");
    button.setAttribute("aria-pressed", String(activeFavorite));
  });
  root.querySelector("[data-detail-share]")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Details link copied");
    } catch (error) {
      showToast("Could not copy details link");
    }
  });
  bindDetailsPosterLightbox(root);
  bindDetailTabs(root);
  bindDetailMediaLinks(root, active);
  root.querySelector("[data-watch-button]")?.addEventListener("click", () => {
    openPlayerForResume(active);
  });
  root.querySelector("[data-read-button]")?.addEventListener("click", () => {
    openReaderForResume(active);
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

function bindDetailsPosterLightbox(root) {
  const modal = root.querySelector("[data-detail-poster-modal]");
  const open = root.querySelector("[data-detail-poster-open]");
  if (!modal || !open) return;

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("detail-poster-modal-open");
    document.removeEventListener("keydown", onKeyDown);
  };
  const show = () => {
    modal.hidden = false;
    document.body.classList.add("detail-poster-modal-open");
    document.addEventListener("keydown", onKeyDown);
  };
  function onKeyDown(event) {
    if (event.key === "Escape") close();
  }

  open.addEventListener("click", show);
  root.querySelectorAll("[data-detail-poster-close]").forEach((button) => button.addEventListener("click", close));
}

function renderDetailsError(root, message) {
  root.innerHTML = `<div class="details-loading panel"><h2>Details unavailable</h2><p class="muted">${escapeHtml(message)}</p><a class="btn" href="anime.html">Discover Anime</a></div>`;
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
    const enabledProviders = preferredMangaProviderOrder(manga, enabledMangaProviderIds());
    const sourceResults = enabledProviders.map((provider) => ({
      optionId: provider,
      provider,
      title: providerLabel(provider),
      chapters: null,
      chapterCount: 0,
      searched: false,
      searching: false,
      searchPromise: null,
    }));
    const savedSource = localStorage.getItem(mangaSourceKey(manga));
    if (savedSource) {
      const savedProvider = firstProviderFromSourceId(savedSource);
      const cachedSource = sourceResults.find((source) => source.provider === savedProvider);
      if (cachedSource) {
        Object.assign(cachedSource, sourceResultWithCache({ id: savedSource, provider: savedProvider, title: providerLabel(savedProvider) }, manga), { searched: true });
      }
    }
    if (sourceSearchInput) sourceSearchInput.value = localStorage.getItem(mangaSourceCustomQueryKey(manga)) || "";

    const renderOptions = () => {
      if (!sourceResults.length) {
        sourceSelect.innerHTML = '<option value="">No sources</option>';
        sourceSelect.disabled = true;
        return;
      }
      sourceSelect.disabled = false;
      syncSelectOptions(sourceSelect, sourceResults.map((item) => {
        const count = Array.isArray(item.chapters) ? item.chapters.length : item.chapterCount || null;
        const status = item.searching ? "Searching..." : item.searched ? "No match" : "Queued";
        const label = item.id ? mangaSourceOptionLabel(item, count) : `${providerLabel(item.provider)}: ${status}`;
        return { value: item.optionId, label };
      }), sourceSelect.value);
    };

    const resolveSource = async (source, customTitle = "", force = false) => {
      if (!source) return null;
      if (source.id && !customTitle) return source;
      if (source.searchPromise && !force) return source.searchPromise;
      if (customTitle && force) {
        source.id = "";
        source.chapters = null;
        source.chapterCount = 0;
        source.searched = false;
        source.searchPromise = null;
      }
      source.searching = true;
      renderOptions();
      source.searchPromise = (async () => {
        try {
          const match = await searchMangaProviderMatch(manga, source.provider, customTitle);
          if (!match) {
            source.chapters = [];
            source.chapterCount = 0;
            return source;
          }
          Object.assign(source, sourceResultWithCache(match, manga), { optionId: source.provider });
          return source;
        } catch (error) {
          source.chapters = [];
          source.chapterCount = 0;
          return source;
        } finally {
          source.searched = true;
          source.searching = false;
          source.searchPromise = null;
          renderOptions();
        }
      })();
      return source.searchPromise;
    };

    const prefetchSources = () => {
      const query = sourceSearchInput?.value.trim() || "";
      sourceResults.forEach((source) => {
        if (source.id || source.searched || source.searching) return;
        resolveSource(source, query).then(() => {
          renderOptions();
          if (sourceSelect.value === source.optionId && !Array.isArray(source.chapters)) renderSource();
        });
      });
    };

    let renderToken = 0;
    const renderSource = async () => {
      const token = ++renderToken;
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
        if (token !== renderToken || sourceSelect.value !== source.optionId) return;
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
          if (token !== renderToken || sourceSelect.value !== source.optionId) return;
        } catch (error) {
          if (token !== renderToken || sourceSelect.value !== source.optionId) return;
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
        await resolveSource(source, query, true);
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
    prefetchSources();
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

  const sources = animePlaybackSources(anime);

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
    syncSelectOptions(sourceSelect, sources.map((source) => {
      const state = sourceStates.get(source.id);
      const suffix = state?.status === "loading" ? " - loading" : state?.status === "loaded" ? ` - ${state.episodes.length}` : state?.status === "empty" ? " - none" : state?.status === "error" ? " - failed" : "";
      return { value: source.id, label: source.name + suffix };
    }), sourceSelect.value);
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
  const preferredSource = preferredAnimeDetailSource(sources, savedSource, anime);
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
    duration: episode.duration || episode.runtime || "",
  };
}

function episodeDurationBadge(episode, anime) {
  const value = episode?.duration || episode?.runtime || anime?.duration || "";
  const minutes = durationValueToMinutes(value);
  if (minutes) return `${minutes} min`;
  const text = String(value || "").trim();
  if (/\b\d+\s*(min|mins|minute|minutes|m)\b/i.test(text)) return text.replace(/minutes?/i, "min").replace(/mins/i, "min");
  const extraDuration = (anime?.extra || []).find((item) => /\b\d+\s*(min|mins|minute|minutes|m)\b/i.test(String(item)));
  if (extraDuration) return String(extraDuration).replace(/minutes?/i, "min").replace(/mins/i, "min");
  return "24 min";
}

function durationValueToMinutes(value) {
  if (typeof value === "number" && value > 0) return normalizeDurationNumber(value);
  const text = String(value || "").trim();
  if (!text) return 0;
  const seconds = /^([\d.]+)\s*(?:sec|secs|second|seconds|s)$/i.exec(text);
  if (seconds) return Math.max(1, Math.round(Number(seconds[1]) / 60));
  const minutes = /^([\d.]+)\s*(?:min|mins|minute|minutes|m)$/i.exec(text);
  if (minutes) return Math.max(1, Math.round(Number(minutes[1])));
  if (/^\d+(?:\.\d+)?$/.test(text)) return normalizeDurationNumber(Number(text));
  const timestamp = /^(\d+):([0-5]\d)(?::([0-5]\d))?$/.exec(text);
  if (timestamp) {
    const hours = timestamp[3] ? Number(timestamp[1]) : 0;
    const mins = timestamp[3] ? Number(timestamp[2]) : Number(timestamp[1]);
    const secs = Number(timestamp[3] || timestamp[2]);
    return Math.max(1, Math.round((hours * 3600 + mins * 60 + secs) / 60));
  }
  return 0;
}

function normalizeDurationNumber(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.max(1, Math.round(value > 300 ? value / 60 : value));
}

function renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches = [], pageNumber = 1, searchQuery = "") {
  if (!episodes.length) {
    container.innerHTML = '<div class="empty">No real episodes returned by this source.</div>';
    return;
  }
  state.detailAnimeResume = { animeId: anime.id, sourceId, episodes, sourceMatches };

  const audioOptions = animeEpisodeAudioOptions(episodes);
  const selectedAudio = sourceId === "animedex" && audioOptions.length > 1 ? selectedAnimeEpisodeAudio(anime, episodes) : "";
  const filteredEpisodes = filterDetailRows(selectedAudio ? episodes.filter((episode) => episodeAudioKey(episode) === selectedAudio) : [...episodes], searchQuery, "Episode");
  const visibleEpisodes = filteredEpisodes.sort(compareEpisodesAsc);
  const pageSize = detailListPageSize();
  const totalPages = Math.max(1, Math.ceil(visibleEpisodes.length / pageSize));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);
  const pageEpisodes = visibleEpisodes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  container.innerHTML = `
    <label class="detail-list-search">Search episodes <input data-detail-episode-search type="search" placeholder="Episode number or title" value="${escapeAttr(searchQuery)}" autocomplete="off"></label>
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
        const number = episode.number || absoluteIndex + 1;
        const title = episode.title || `Episode ${number}`;
        const displayTitle = stripLeadingEpisodeNumber(title, number);
        const image = episode.image || anime.banner || anime.image || fallbackImage;
        const meta = [episode.airDate || episode.date || episode.time, episodeAudioLabel(episode.audio)].filter(Boolean).join(" / ") || "Source episode";
        const durationBadge = episodeDurationBadge(episode, anime);
        const description = episode.description || `${providerLabel(sourceId)} episode source.`;
        return `
          <button type="button" class="chapter-row detail-chapter-row detail-anime-episode-row" data-detail-watch-episode data-episode-index="${episodeIndex}">
            <figure class="detail-episode-art">
              <img class="detail-episode-thumb" src="${escapeAttr(image)}" alt="${escapeAttr(title)} thumbnail" loading="lazy">
              <span>${escapeHtml(durationBadge)}</span>
            </figure>
            <div class="detail-chapter-text detail-episode-copy">
              <strong>${escapeHtml(number)}. ${escapeHtml(displayTitle)}</strong>
              <p>${escapeHtml(shortText(description, 126))}</p>
              <small>${escapeHtml(meta)}</small>
            </div>
          </button>
        `;
      }).join("")}
      ${!pageEpisodes.length ? `<div class="empty">No episodes match this search.</div>` : ""}
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
      renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches, 1, searchQuery);
    });
  });

  container.querySelector("[data-detail-episode-search]")?.addEventListener("input", (event) => renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches, 1, event.target.value.trim()));
  if (searchQuery) window.requestAnimationFrame(() => {
    const input = container.querySelector("[data-detail-episode-search]");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
  container.querySelector("[data-detail-anime-prev]")?.addEventListener("click", () => renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches, currentPage - 1, searchQuery));
  container.querySelector("[data-detail-anime-next]")?.addEventListener("click", () => renderAnimeDetailEpisodeList(container, anime, sourceId, episodes, sourceMatches, currentPage + 1, searchQuery));
}

function filterDetailRows(rows, query, prefix) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return rows;
  return rows.filter((row, index) => normalizeSearchText(`${row.number || index + 1} ${row.title || `${prefix} ${row.number || index + 1}`} ${row.date || row.time || ""}`).includes(normalized));
}

function stripLeadingEpisodeNumber(title, number) {
  const text = String(title || "").trim();
  const prefix = String(number || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return prefix ? text.replace(new RegExp(`^${prefix}\\.?\\s*`), "") || text : text;
}

function compareEpisodesAsc(a, b) {
  const left = Number.parseFloat(a?.number);
  const right = Number.parseFloat(b?.number);
  if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
  return String(a?.number || a?.title || "").localeCompare(String(b?.number || b?.title || ""), undefined, { numeric: true });
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

function openPlayerForAnimeTarget(anime, sourceId, episodeNumber) {
  sessionStorage.setItem("player-anime", JSON.stringify(anime));
  sessionStorage.setItem("player-start-episode", JSON.stringify({ episode: null, sourceId }));
  sessionStorage.removeItem("player-source-matches");
  const episodeQuery = episodeNumber ? `&episode=${encodeURIComponent(episodeNumber)}` : "";
  const sourceQuery = sourceId ? `&source=${encodeURIComponent(sourceId)}` : "";
  const apiSourceQuery = anime.apiSource ? `&apiSource=${encodeURIComponent(anime.apiSource)}` : "";
  window.location.href = `player.html?type=${anime.type}&id=${anime.apiId}${episodeQuery}${sourceQuery}${apiSourceQuery}`;
}

function openPlayerForResume(anime) {
  const resumeNumber = resumeUnitNumber(anime);
  const resume = state.detailAnimeResume?.animeId === anime.id ? state.detailAnimeResume : null;
  const sourceId = resume?.sourceId || localStorage.getItem(animeSourceKey(anime)) || preferredAnimeDetailSource(animePlaybackSources(anime), "", anime);
  const episodes = resume?.episodes || buildEpisodes(anime);
  const episode = findUnitByNumber(episodes, resumeNumber);
  if (episode) {
    openPlayerForAnime(anime, episode, sourceId, sourceId === "hstream" ? resume?.sourceMatches || [] : episodes);
    return;
  }
  openPlayerForAnimeTarget(anime, sourceId, resumeNumber);
}

function resumeUnitNumber(item) {
  const progress = Number(item?.progress || state.library[item?.id]?.progress || 0);
  const total = Number(item?.total || state.library[item?.id]?.total || 0);
  const value = progress > 0 ? progress : 1;
  return String(total ? Math.min(total, value) : value);
}

function findUnitByNumber(items, number) {
  const target = String(number || "");
  return (items || []).find((item, index) => String(item?.number || index + 1) === target)
    || (items || []).find((item, index) => Number(item?.number || index + 1) === Number(target));
}

function animeSourceKey(anime) {
  return `anime-source:${anime.id || anime.apiId}`;
}

function animeSourceCustomQueryKey(anime) {
  return `${animeSourceKey(anime)}:custom-title`;
}

function preferredAnimeDetailSource(sources, savedSource = "", item = null) {
  const ids = sources.map((source) => source.id);
  if (savedSource && ids.includes(savedSource)) return savedSource;
  const preferred = isHentaiAnimeItem(item) ? state.settings.defaultHentaiSource || "hstream" : state.settings.defaultAnimeSource || "animedex";
  if (ids.includes(preferred)) return preferred;
  return ["animedex", "anizone", "anilibria", "tokyoinsider", "hstream"].find((id) => ids.includes(id)) || ids[0] || "";
}

function isHentaiAnimeItem(item) {
  return item?.type === "anime" && (isAdultLibraryItem(item) || /hentai|adult/i.test(`${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")} ${item?.title || ""}`));
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
  const cacheKey = mangaSourceMatchesCacheKey(manga, customTitle, [provider]);
  const cached = readSessionCache(cacheKey, MANGA_CHAPTER_CACHE_TTL_MS);
  if (cached) return cached[0] || null;
  const results = await Promise.allSettled(searchTitles.map((title) =>
    fetchApiJson(`/api/manga/search?title=${encodeURIComponent(title)}&providers=${encodeURIComponent(provider)}`)
      .then((matches) => matches.map((match) => ({ ...match, searchTitle: title })))
  ));
  const matches = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const best = bestMangaSourceMatches(matches, searchTitles, [provider]);
  writeSessionCache(cacheKey, best);
  return best[0] || null;
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

function renderMangaDetailChapterList(container, manga, source, pageNumber = 1, searchQuery = "") {
  if (!source.chapters.length) {
    container.innerHTML = '<div class="empty">No chapters returned by this source.</div>';
    return;
  }
  state.detailMangaResume = { mangaId: manga.id, source, chapters: source.chapters };

  const chapters = filterDetailRows([...source.chapters], searchQuery, "Chapter").sort(compareChaptersDesc);
  const pageSize = detailListPageSize();
  const totalPages = Math.max(1, Math.ceil(chapters.length / pageSize));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);
  const pageChapters = chapters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  container.classList.add("detail-manga-card-grid");
  container.innerHTML = `
    <label class="detail-list-search detail-manga-search">Search chapters <input data-detail-chapter-search type="search" placeholder="Chapter number or title" value="${escapeAttr(searchQuery)}" autocomplete="off"></label>
    ${pageChapters.map((chapter) => `
    <button type="button" class="detail-manga-chapter-card" data-detail-read-chapter data-chapter-data="${escapeAttr(JSON.stringify(chapter))}">
      ${detailMangaChapterCardInnerHtml(chapter, manga)}
    </button>
    `).join("")}
    ${!pageChapters.length ? `<div class="empty">No chapters match this search.</div>` : ""}
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

  container.querySelector("[data-detail-chapter-search]")?.addEventListener("input", (event) => renderMangaDetailChapterList(container, manga, source, 1, event.target.value.trim()));
  if (searchQuery) window.requestAnimationFrame(() => {
    const input = container.querySelector("[data-detail-chapter-search]");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
  container.querySelector("[data-detail-chapter-prev]")?.addEventListener("click", () => renderMangaDetailChapterList(container, manga, source, currentPage - 1, searchQuery));
  container.querySelector("[data-detail-chapter-next]")?.addEventListener("click", () => renderMangaDetailChapterList(container, manga, source, currentPage + 1, searchQuery));
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

function openReaderForResume(manga) {
  const resumeNumber = resumeUnitNumber(manga);
  const resume = state.detailMangaResume?.mangaId === manga.id ? state.detailMangaResume : null;
  const source = resume?.source || null;
  const chapter = findUnitByNumber(resume?.chapters || [], resumeNumber);
  const readerManga = source ? { ...manga, provider: source.provider, providerId: source.id, providerTitle: source.title } : manga;
  sessionStorage.setItem("reader-manga", JSON.stringify(readerManga));
  sessionStorage.setItem("reader-start-chapter", JSON.stringify({
    mangaKey: mangaSourceKey(manga),
    providerId: source?.id || "",
    chapterId: chapter?.id || "",
    chapterNumber: String(chapter?.number || resumeNumber),
  }));
  if (source?.id) localStorage.setItem(mangaSourceKey(manga), source.id);
  const apiSourceQuery = manga.apiSource ? `&apiSource=${encodeURIComponent(manga.apiSource)}` : "";
  window.location.href = `manga-reader.html?type=${manga.type}&id=${manga.apiId}${apiSourceQuery}`;
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

  const existed = Boolean(state.library[saved.id]);
  state.library[saved.id] = saved;
  state.current = saved;
  recordActivity(saved, existed ? "updated" : "added");
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
  if (state.library[state.current.id]) recordActivity(state.library[state.current.id], "removed");
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
  if (!overlay || !type) return;
  if (state.settings.allowAdult && ![...type.options].some((option) => option.value === "doujin")) {
    type.insertAdjacentHTML("beforeend", '<option value="doujin">Doujin</option>');
  }
  if (!state.settings.allowAdult) type.querySelector('option[value="doujin"]')?.remove();
  overlay.classList.add("show");
  const preferred = state.current?.type === "manga" ? (isDoujinLibraryItem(state.current) ? "doujin" : "manga") : page === "manga" || page === "reader" ? "manga" : page === "doujin" || page === "doujin-preview" ? "doujin" : "anime";
  type.value = [...type.options].some((option) => option.value === preferred) ? preferred : "anime";
  window.setTimeout(() => document.querySelector("[data-overlay-search-input]")?.focus(), 0);
}

function closeSearchOverlay() {
  document.querySelector("[data-search-overlay]")?.classList.remove("show");
}

function toggleProfileMenu(event) {
  event.stopPropagation();
  closeNotifications();
  closeHistory();
  const menu = event.currentTarget.closest(".profile-menu");
  const popover = menu?.querySelector("[data-profile-popover]");
  if (!popover) return;
  const shouldOpen = !popover.classList.contains("show");
  closeProfileMenu();
  popover.classList.toggle("show", shouldOpen);
  event.currentTarget.setAttribute("aria-expanded", String(shouldOpen));
}

function closeProfileMenu() {
  document.querySelectorAll("[data-profile-popover]").forEach((popover) => popover.classList.remove("show"));
  document.querySelectorAll("[data-profile-toggle]").forEach((button) => button.setAttribute("aria-expanded", "false"));
}

function toggleNotifications(event) {
  event.stopPropagation();
  closeProfileMenu();
  closeHistory();
  const popover = document.querySelector("[data-notification-popover]");
  const button = document.querySelector("[data-notification-toggle]");
  if (!popover || !button) return;
  const shouldOpen = !popover.classList.contains("show");
  popover.classList.toggle("show", shouldOpen);
  button.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) {
    localStorage.setItem(NOTIFICATION_READ_KEY, String(Date.now()));
    state.notificationPage = 1;
    renderNotifications();
    popover.classList.add("show");
  }
}

function closeNotifications() {
  document.querySelector("[data-notification-popover]")?.classList.remove("show");
  document.querySelector("[data-notification-toggle]")?.setAttribute("aria-expanded", "false");
}

function renderNotifications() {
  const popover = document.querySelector("[data-notification-popover]");
  const count = document.querySelector("[data-notification-count]");
  const button = document.querySelector("[data-notification-toggle]");
  if (!popover || !count || !button) return;
  const readAt = Number(localStorage.getItem(NOTIFICATION_READ_KEY) || 0);
  const items = notificationItems();
  const unread = items.filter((item) => Number(item.updatedAt || 0) > readAt).length;
  const visibleItems = items.slice(0, state.notificationPage * ACTIVITY_PAGE_SIZE);
  const hasMore = visibleItems.length < items.length;
  count.textContent = unread > 99 ? "99+" : String(unread);
  count.hidden = unread === 0;
  button.classList.toggle("has-unread", unread > 0);
  button.setAttribute("aria-label", unread ? `Open notifications, ${unread} unread` : "Open notifications");
  popover.innerHTML = `
    <strong>Notifications</strong>
    ${visibleItems.length ? visibleItems.map((item) => `
      <button class="notification-row" data-notification-index="${visibleItems.indexOf(item)}" type="button">
        <img src="${escapeAttr(item.image || fallbackImage)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
        <span>${escapeHtml(notificationText(item))}<small>${escapeHtml(relativeTime(item.updatedAt))}</small></span>
      </button>
    `).join("") : `<p class="notification-empty">No notifications yet.</p>`}
    ${hasMore ? `<button class="notification-more" data-notification-more type="button">Load more notifications</button>` : ""}
  `;
  popover.querySelectorAll("[data-notification-index]").forEach((row) => row.addEventListener("click", () => {
    const item = resolveNavigableItem(visibleItems[Number(row.dataset.notificationIndex)]);
    if (item) openLibraryItem(item);
  }));
  popover.querySelector("[data-notification-more]")?.addEventListener("click", () => {
    state.notificationPage += 1;
    renderNotifications();
    popover.classList.add("show");
  });
  popover.onscroll = () => {
    if (!hasMore || popover.scrollTop + popover.clientHeight < popover.scrollHeight - 32) return;
    state.notificationPage += 1;
    renderNotifications();
    popover.classList.add("show");
  };
}

function notificationItems() {
  return loadNotificationsStore().filter(contentVisibleItem);
}

function toggleHistory(event) {
  event.stopPropagation();
  closeProfileMenu();
  closeNotifications();
  const popover = document.querySelector("[data-history-popover]");
  const button = document.querySelector("[data-history-toggle]");
  if (!popover || !button) return;
  const shouldOpen = !popover.classList.contains("show");
  popover.classList.toggle("show", shouldOpen);
  button.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) {
    state.historyPage = 1;
    renderHistory();
  }
}

function closeHistory() {
  document.querySelector("[data-history-popover]")?.classList.remove("show");
  document.querySelector("[data-history-toggle]")?.setAttribute("aria-expanded", "false");
}

function renderHistory() {
  const popover = document.querySelector("[data-history-popover]");
  if (!popover) return;
  const items = historyItems();
  const visibleItems = items.slice(0, state.historyPage * ACTIVITY_PAGE_SIZE);
  const hasMore = visibleItems.length < items.length;
  popover.innerHTML = `
    <strong>History</strong>
    ${visibleItems.length ? visibleItems.map((item) => `
      <button class="history-row" data-history-index="${visibleItems.indexOf(item)}" type="button">
        <img src="${escapeAttr(item.image || fallbackImage)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
        <span>${escapeHtml(historyText(item))}<small>${escapeHtml(relativeTime(item.activityTime || item.updatedAt))}</small></span>
      </button>
    `).join("") : `<p class="notification-empty">No library history yet.</p>`}
    ${hasMore ? `<button class="notification-more" data-history-more type="button">Load more history</button>` : ""}
    <a class="notification-more history-details-link" href="history.html">Details</a>
  `;
  popover.querySelectorAll("[data-history-index]").forEach((row) => row.addEventListener("click", () => {
    const item = resolveNavigableItem(visibleItems[Number(row.dataset.historyIndex)]);
    if (item) openLibraryItem(item);
  }));
  popover.querySelector("[data-history-more]")?.addEventListener("click", () => {
    state.historyPage += 1;
    renderHistory();
    popover.classList.add("show");
  });
  popover.onscroll = () => {
    if (!hasMore || popover.scrollTop + popover.clientHeight < popover.scrollHeight - 32) return;
    state.historyPage += 1;
    renderHistory();
    popover.classList.add("show");
  };
}

function initHistoryPage() {
  const list = document.querySelector("[data-history-list]");
  const count = document.querySelector("[data-history-count]");
  if (!list) return;
  const items = historyItems();
  if (count) count.textContent = `${items.length} ${items.length === 1 ? "entry" : "entries"}`;
  if (!items.length) {
    list.innerHTML = `<div class="empty"><h3>No history yet</h3><p class="muted">Library activity will appear here after you update saved titles.</p></div>`;
    return;
  }
  list.innerHTML = items.map((item, index) => `
    <button class="history-page-row" data-history-page-index="${index}" type="button">
      <img src="${escapeAttr(item.image || fallbackImage)}" alt="${escapeAttr(item.title)} poster" loading="lazy">
      <span>
        <strong>${escapeHtml(item.title || "Untitled")}</strong>
        <small>${escapeHtml(historyText(item))} &middot; ${escapeHtml(relativeTime(item.activityTime || item.updatedAt))}</small>
      </span>
      <em>${escapeHtml(libraryTypeText(item))}</em>
    </button>
  `).join("");
  list.querySelectorAll("[data-history-page-index]").forEach((row) => row.addEventListener("click", () => {
    const item = resolveNavigableItem(items[Number(row.dataset.historyPageIndex)]);
    if (item) openLibraryItem(item);
  }));
}

function historyItems() {
  return loadActivity().filter(activityVisibleItem).map((activity) => ({ ...activity.item, activityTime: activity.time, activityText: activity.text }));
}

function historyText(item) {
  return item.activityText || notificationText(item);
}

function notificationText(item) {
  if (item.kind === "chapter") return `${item.newCount || "New"} new chapter${Number(item.newCount) === 1 ? "" : "s"} for ${item.title}`;
  const action = item.status === "completed" ? "Completed" : item.status === "planning" ? "Planned" : item.type === "manga" ? "Reading" : "Watching";
  return `${action} ${item.title}`;
}

async function checkLibraryChapterNotifications() {
  const mangaItems = Object.values(state.library).filter((item) => item?.type === "manga" && !isDoujinLibraryItem(item));
  if (!mangaItems.length) return;
  const seen = readSeenChapterCounts();
  const notifications = loadNotificationsStore();
  let changed = false;
  for (const item of mangaItems.slice(0, 30)) {
    const source = await notificationMangaSource(item);
    if (!source?.id || !source.provider) continue;
    try {
      const chapters = await fetchMangaChaptersCached(source, item);
      const count = chapters.length;
      if (!count) continue;
      const key = `${item.id}:${source.id}`;
      const previous = Number(seen[key] || 0);
      if (!previous) {
        seen[key] = count;
        changed = true;
        continue;
      }
      if (count > previous) {
        const newCount = count - previous;
        notifications.unshift({
          id: `chapter:${key}:${count}`,
          kind: "chapter",
          libraryId: item.id,
          title: item.title,
          image: item.image || fallbackImage,
          provider: source.provider,
          newCount,
          chapterCount: count,
          updatedAt: Date.now(),
        });
        seen[key] = count;
        changed = true;
      }
    } catch (error) {
      // Source checks are best-effort and should never block page chrome.
    }
  }
  if (!changed) return;
  writeSeenChapterCounts(seen);
  saveNotificationsStore(dedupeNotifications(notifications));
  renderNotifications();
}

async function notificationMangaSource(item) {
  const sourceId = localStorage.getItem(mangaSourceKey(item));
  if (sourceId) {
    return { id: sourceId, provider: firstProviderFromSourceId(sourceId) || localStorage.getItem(`${mangaSourceKey(item)}:provider`) || String(sourceId).split(":")[0] };
  }
  const providers = preferredMangaProviderOrder(item, enabledMangaProviderIds().filter((provider) => !isAdultMangaProvider(provider))).slice(0, 3);
  for (const provider of providers) {
    try {
      const match = await searchMangaProviderMatch(item, provider, localStorage.getItem(mangaSourceCustomQueryKey(item)) || "");
      if (!match?.id) continue;
      localStorage.setItem(mangaSourceKey(item), match.id);
      localStorage.setItem(`${mangaSourceKey(item)}:provider`, match.provider || provider);
      return { id: match.id, provider: match.provider || provider };
    } catch (error) {
      // Try the next enabled source.
    }
  }
  return null;
}

function readSeenChapterCounts() {
  try {
    return JSON.parse(localStorage.getItem(CHAPTER_SEEN_KEY) || "{}") || {};
  } catch (error) {
    return {};
  }
}

function writeSeenChapterCounts(value) {
  try {
    localStorage.setItem(CHAPTER_SEEN_KEY, JSON.stringify(value));
  } catch (error) {
    // Ignore storage limits.
  }
}

function dedupeNotifications(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, ACTIVITY_LIMIT);
}

function relativeTime(timestamp) {
  const diff = Math.max(0, Date.now() - Number(timestamp || 0));
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function toggleMobileMenu(event) {
  event.stopPropagation();
  const expanded = document.body.classList.toggle("mobile-menu-open");
  event.currentTarget.setAttribute("aria-expanded", String(expanded));
  syncMenuToggleVisibility();
}

function closeMobileMenu() {
  document.body.classList.remove("mobile-menu-open");
  document.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");
  syncMenuToggleVisibility();
}

function toggleBrowseFilters(event) {
  if (page !== "anime" && page !== "manga" && page !== "doujin") {
    return;
  }

  event.stopPropagation();
  const isOpen = document.body.classList.toggle("browse-filters-open");
  document.querySelectorAll("[data-browse-filter-toggle]").forEach((button) => button.setAttribute("aria-expanded", String(isOpen)));
  if (isOpen) window.setTimeout(() => document.querySelector("[data-browse-search], [data-doujin-search]")?.focus(), 0);
}

function closeBrowseFilters() {
  if (page !== "anime" && page !== "manga" && page !== "doujin") return;
  document.body.classList.remove("browse-filters-open");
  document.querySelectorAll("[data-browse-filter-toggle]").forEach((button) => button.setAttribute("aria-expanded", "false"));
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
    loadDoujinSourcesNew();
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
  document.querySelector("[data-search-overlay]")?.classList.contains("show") ? closeSearchOverlay() : openSearchOverlay();
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  document.querySelector("[data-theme-toggle]").innerHTML = themeIcon();
  scheduleAccountSync();
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
      doujinSources: { ...defaults.doujinSources, ...(saved.doujinSources || {}) },
      subtitleStyle: { ...defaults.subtitleStyle, ...(saved.subtitleStyle || {}) },
      ambientStyle: { ...defaults.ambientStyle, ...(saved.ambientStyle || {}) },
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
    doujinSources: defaultDoujinSources(),
    preferredQuality: "auto",
    subtitleLanguage: "english",
    autoPlay: true,
    autoPlayNext: false,
    playerAmbient: false,
    ambientStyle: defaultAmbientStyle(),
    defaultAnimeSource: "animedex",
    defaultHentaiSource: "hstream",
    defaultMangaSource: "weebcentral",
    defaultPornhwaSource: "pornhwaz",
    playerSpeed: "1",
    profileAvatarUrl: "",
    profileBannerUrl: "",
    subtitleStyle: defaultSubtitleStyle(),
  };
}

function defaultSubtitleStyle() {
  return { ...DEFAULT_SUBTITLE_STYLE };
}

function defaultAmbientStyle() {
  return { blur: 34, opacity: 58, spread: 34, saturation: 135, brightness: 82 };
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

function defaultDoujinSources() {
  return Object.fromEntries(DOUJIN_SOURCES.map((source) => [source.id, source.defaultEnabled !== false]));
}

function accountModalHtml() {
  return `
    <div class="account-modal" data-account-modal hidden>
      <div class="account-modal-backdrop" data-account-close></div>
      <section class="account-modal-card" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
        <button class="account-modal-close" data-account-close type="button" aria-label="Close account dialog">×</button>
        <span class="eyebrow">AniTrack Sync</span>
        <h2 id="account-modal-title">Keep your library everywhere</h2>
        <p class="muted">Register or log in with a username and password to sync library, activity, preferences, sources, theme, and reader mode across devices.</p>
        <div class="account-status modal-status"><strong data-account-title>${state.account?.username ? `@${escapeHtml(state.account.username)}` : "Guest"}</strong><span data-account-status>${state.account?.username ? "Sync enabled" : "Local library only"}</span></div>
        <form class="account-form" data-account-form ${state.account?.token ? "hidden" : ""}>
          <label>Username<input data-account-username type="text" autocomplete="username" placeholder="fluffy" minlength="3" maxlength="32"></label>
          <label>Password<input data-account-password type="password" autocomplete="current-password" placeholder="At least 6 characters" minlength="6"></label>
          <div class="account-buttons">
            <button class="btn" data-account-action="login" type="submit">Log in</button>
            <button class="btn secondary" data-account-action="register" type="submit">Register</button>
          </div>
        </form>
        <div class="account-actions" data-account-actions ${state.account?.token ? "" : "hidden"}>
          <button class="btn" data-account-sync type="button">Sync now</button>
          <button class="btn secondary" data-account-logout type="button">Log out</button>
        </div>
      </section>
    </div>
  `;
}

function enabledMangaProviderIds() {
  const enabled = { ...defaultMangaSources(), ...(state.settings.mangaSources || {}) };
  return MANGA_SOURCES.filter((source) => enabled[source.id] && (!source.adult || state.settings.allowAdult)).map((source) => source.id);
}

function preferredMangaProviderOrder(item, providers = enabledMangaProviderIds()) {
  const preferred = preferredMangaProvider(item);
  if (!preferred || !providers.includes(preferred)) return providers;
  return [preferred, ...providers.filter((provider) => provider !== preferred)];
}

function preferredMangaProvider(item) {
  if (isPornhwaSourceItem(item)) return state.settings.defaultPornhwaSource || "pornhwaz";
  return state.settings.defaultMangaSource || "weebcentral";
}

function isPornhwaSourceItem(item) {
  return isPornhwaLibraryItem(item) || /pornhwa|adult manhwa/i.test(`${item?.displayType || ""} ${item?.format || ""} ${(item?.genres || []).join(" ")} ${item?.provider || ""} ${item?.providerId || ""} ${item?.apiId || ""} ${item?.title || ""}`);
}

function enabledDoujinProviderIds() {
  const enabled = { ...defaultDoujinSources(), ...(state.settings.doujinSources || {}) };
  return DOUJIN_SOURCES.filter((source) => enabled[source.id] && state.settings.allowAdult).map((source) => source.id);
}

function persistSettings(sync = true) {
  if (sync) state.settings.updatedAt = Date.now();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  if (sync) scheduleAccountSync();
}

function profileInitials() {
  const username = state.account?.username || "";
  return username ? escapeHtml(username.slice(0, 2).toUpperCase()) : "AT";
}

function initAccountControls() {
  const form = document.querySelector("[data-account-form]");
  document.querySelectorAll("[data-account-open]").forEach((button) => button.addEventListener("click", () => {
    closeProfileMenu();
    openAccountModal();
  }));
  document.querySelectorAll("[data-account-close]").forEach((button) => button.addEventListener("click", closeAccountModal));
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const action = event.submitter?.dataset.accountAction || "login";
    await handleAccountSubmit(action);
  });
  document.querySelector("[data-account-sync]")?.addEventListener("click", () => syncAccountNow(true));
  document.querySelector("[data-account-logout]")?.addEventListener("click", () => {
    state.account = null;
    persistAccount();
    stopAccountAutoSync();
    renderAccountState("Logged out. Local library is still on this device.");
  });
  setupAccountAutoSync();
  if (state.account?.token) syncAccountNow(false);
}

function openAccountModal() {
  const modal = document.querySelector("[data-account-modal]");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => modal.querySelector("[data-account-username]")?.focus(), 0);
}

function closeAccountModal() {
  const modal = document.querySelector("[data-account-modal]");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

async function handleAccountSubmit(action) {
  const username = document.querySelector("[data-account-username]")?.value || "";
  const password = document.querySelector("[data-account-password]")?.value || "";
  setAccountStatus(action === "register" ? "Creating account..." : "Logging in...");
  try {
    const body = { username, password };
    if (action === "register") body.data = accountSyncPayload();
    const result = await accountApi(`/api/account/${action}`, "POST", body, false);
    state.account = { username: result.username, token: result.token };
    persistAccount();
    applyAccountData(result.data || {});
    renderAccountState(action === "register" ? "Account created and synced." : "Logged in and synced.");
    startAccountAutoSync();
    await syncAccountNow(false);
  } catch (error) {
    setAccountStatus(error.message || "Account request failed.");
  }
}

async function syncAccountNow(showStatus = false) {
  if (!state.account?.token) return;
  if (syncAccountNow.inFlight) return;
  if (showStatus) setAccountStatus("Syncing...");
  syncAccountNow.inFlight = (async () => {
    const remote = await accountApi("/api/account/sync", "GET");
    applyAccountData(remote.data || {});
    await accountApi("/api/account/sync", "PUT", { data: accountSyncPayload() });
    syncAccountNow.lastRun = Date.now();
    if (showStatus) setAccountStatus("Synced library, activity, preferences, and sources.");
  })();
  try {
    await syncAccountNow.inFlight;
  } catch (error) {
    if (showStatus) setAccountStatus(error.message || "Sync failed.");
  } finally {
    syncAccountNow.inFlight = null;
  }
}

function scheduleAccountSync() {
  if (!state.account?.token) return;
  clearTimeout(scheduleAccountSync.timer);
  scheduleAccountSync.timer = setTimeout(() => accountApi("/api/account/sync", "PUT", { data: accountSyncPayload() }).catch(() => null), 800);
}

function setupAccountAutoSync() {
  if (setupAccountAutoSync.ready) {
    startAccountAutoSync();
    return;
  }
  setupAccountAutoSync.ready = true;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) syncAccountWhenActive(true);
  });
  window.addEventListener("focus", () => syncAccountWhenActive(true));
  window.addEventListener("online", () => syncAccountWhenActive(true));
  startAccountAutoSync();
}

function startAccountAutoSync() {
  stopAccountAutoSync();
  if (!state.account?.token) return;
  setupAccountAutoSync.timer = window.setInterval(() => syncAccountWhenActive(false), ACCOUNT_AUTO_SYNC_INTERVAL_MS);
}

function stopAccountAutoSync() {
  if (!setupAccountAutoSync.timer) return;
  window.clearInterval(setupAccountAutoSync.timer);
  setupAccountAutoSync.timer = null;
}

function syncAccountWhenActive(force = false) {
  if (!state.account?.token || document.hidden) return;
  if (!force && Date.now() - Number(syncAccountNow.lastRun || 0) < ACCOUNT_AUTO_SYNC_MIN_MS) return;
  syncAccountNow(false);
}

async function accountApi(path, method = "GET", body = null, requireToken = true) {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(requireToken && state.account?.token ? { Authorization: `Bearer ${state.account.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Account request failed: ${response.status}`);
  return data;
}

function accountSyncPayload() {
  return {
    library: state.library,
    activity: loadActivity(),
    favorites: state.favorites,
    favoriteRemovals: state.favoriteRemovals,
    settings: state.settings,
    theme: localStorage.getItem(THEME_KEY) || document.documentElement.dataset.theme || "",
    readerMode: localStorage.getItem("reader-mode") || "",
    updatedAt: Date.now(),
  };
}

function applyAccountData(data) {
  if (!data || typeof data !== "object") return;
  state.library = mergeLibraryData(state.library, data.library || {});
  saveActivity(mergeActivityData(loadActivity(), data.activity || []), false);
  const favoriteSync = mergeFavoriteSyncData(state.favorites, data.favorites || [], state.favoriteRemovals, data.favoriteRemovals || []);
  state.favorites = favoriteSync.favorites;
  state.favoriteRemovals = favoriteSync.removals;
  persistFavorites(false);
  state.settings = mergeSettingsData(state.settings, data.settings || {});
  if (data.theme) {
    localStorage.setItem(THEME_KEY, data.theme);
    document.documentElement.dataset.theme = data.theme;
    document.querySelector("[data-theme-toggle]")?.replaceChildren();
    const themeButton = document.querySelector("[data-theme-toggle]");
    if (themeButton) themeButton.innerHTML = themeIcon();
  }
  if (data.readerMode) localStorage.setItem("reader-mode", data.readerMode);
  persistLibrary(false);
  persistSettings(false);
  renderHistory();
  if (page === "profile") renderProfileOverview();
  if (page === "history") initHistoryPage();
  applyThemeColor();
  hydrateProfileShell();
  syncAdultControls();
  updateStats();
  if (page === "library") renderLibrary();
}

function mergeLibraryData(local, remote) {
  const merged = { ...(local || {}) };
  Object.entries(remote || {}).forEach(([id, item]) => {
    if (!merged[id] || Number(item?.updatedAt || 0) >= Number(merged[id]?.updatedAt || 0)) merged[id] = item;
  });
  return merged;
}

function mergeActivityData(local, remote) {
  const byKey = new Map();
  [...(local || []), ...(remote || [])].forEach((activity) => {
    if (!activity?.item?.id) return;
    const key = activity.id || `${activity.item.id}:${activity.action || "updated"}:${activity.time || 0}`;
    const current = byKey.get(key);
    if (!current || Number(activity.time || 0) >= Number(current.time || 0)) byKey.set(key, activity);
  });
  return compactActivityTimeline([...byKey.values()].sort((a, b) => Number(b.time || 0) - Number(a.time || 0))).slice(0, ACTIVITY_LIMIT);
}

function mergeFavoriteSyncData(localFavorites, remoteFavorites, localRemovals, remoteRemovals) {
  const removals = mergeFavoriteRemovals(localRemovals, remoteRemovals);
  const removedAt = new Map(removals.map((item) => [favoriteSyncKey(item), Number(item.removedAt || 0)]));
  const byKey = new Map();
  [...(localFavorites || []), ...(remoteFavorites || [])].forEach((favorite) => {
    if (!favorite?.id) return;
    const key = favoriteSyncKey(favorite);
    const favoriteAt = Number(favorite.favoriteAt || favorite.updatedAt || 0);
    if (Number(removedAt.get(key) || 0) > favoriteAt) return;
    const current = byKey.get(key);
    if (!current || favoriteAt >= Number(current.favoriteAt || current.updatedAt || 0)) byKey.set(key, favorite);
  });
  return {
    favorites: [...byKey.values()].sort((a, b) => Number(b.favoriteAt || b.updatedAt || 0) - Number(a.favoriteAt || a.updatedAt || 0)).slice(0, ACTIVITY_LIMIT),
    removals,
  };
}

function mergeFavoriteRemovals(localRemovals, remoteRemovals) {
  const byKey = new Map();
  [...(localRemovals || []), ...(remoteRemovals || [])].forEach((item) => {
    if (!item?.id) return;
    const key = favoriteSyncKey(item);
    const current = byKey.get(key);
    if (!current || Number(item.removedAt || 0) >= Number(current.removedAt || 0)) byKey.set(key, item);
  });
  return [...byKey.values()].sort((a, b) => Number(b.removedAt || 0) - Number(a.removedAt || 0)).slice(0, ACTIVITY_LIMIT);
}

function mergeSettingsData(local, remote) {
  const defaults = defaultSettings();
  const localData = local || {};
  const remoteData = remote || {};
  const localUpdated = Number(localData.updatedAt || 0);
  const remoteUpdated = Number(remoteData.updatedAt || 0);
  const base = remoteUpdated > localUpdated ? remoteData : localData;
  const fallback = remoteUpdated > localUpdated ? localData : remoteData;
  return {
    ...defaults,
    ...fallback,
    ...base,
    animeSources: { ...defaults.animeSources, ...(fallback.animeSources || {}), ...(base.animeSources || {}) },
    mangaSources: { ...defaults.mangaSources, ...(fallback.mangaSources || {}), ...(base.mangaSources || {}) },
    doujinSources: { ...defaults.doujinSources, ...(fallback.doujinSources || {}), ...(base.doujinSources || {}) },
    subtitleStyle: { ...defaults.subtitleStyle, ...(fallback.subtitleStyle || {}), ...(base.subtitleStyle || {}) },
  };
}

function renderAccountState(message) {
  const signedIn = Boolean(state.account?.token);
  document.querySelector("[data-account-form]")?.toggleAttribute("hidden", signedIn);
  document.querySelector("[data-account-actions]")?.toggleAttribute("hidden", !signedIn);
  setText("[data-account-title]", signedIn ? `@${state.account.username}` : "Guest");
  document.querySelectorAll("[data-profile-toggle]").forEach((button) => {
    button.textContent = profileInitials();
  });
  document.querySelectorAll("[data-account-open]").forEach((button) => {
    button.textContent = signedIn ? "Manage Account" : "Log in / Register";
  });
  setAccountStatus(message || (signedIn ? "Sync enabled" : "Local library only"));
}

function setAccountStatus(message) {
  setText("[data-account-status]", message);
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
  return { top: "Top Manga / Manhwa", popular: "Popular Manga / Manhwa", publishing: "Publishing Manga / Manhwa" }[state.feed];
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
  const count = total ? Math.min(total, window.matchMedia?.("(max-width: 720px)").matches ? 8 : 24) : window.matchMedia?.("(max-width: 720px)").matches ? 6 : 12;
  return Array.from({ length: count }, (_, index) => {
    const number = total ? total - index : count - index;
    return {
      title: `${item.type === "anime" ? "Episode" : "Chapter"} ${number}`,
      time: index === 0 ? "Latest" : index < 4 ? `${index + 1} days ago` : `${index} weeks ago`,
      image: item.type === "manga" ? item.image || item.banner || fallbackImage : item.banner || item.image || fallbackImage,
    };
  });
}

function detailListPageSize() {
  return window.matchMedia?.("(max-width: 720px)").matches ? 12 : 40;
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

function syncSelectOptions(select, options, preferredValue = "") {
  if (!select) return;
  const current = preferredValue || select.value;
  const sameShape = select.options.length === options.length && options.every((option, index) => select.options[index]?.value === option.value);
  if (!sameShape) {
    select.innerHTML = options.map((option) => `<option value="${escapeAttr(option.value)}">${escapeHtml(option.label)}</option>`).join("");
  } else {
    options.forEach((option, index) => {
      if (select.options[index].textContent !== option.label) select.options[index].textContent = option.label;
    });
  }
  if (options.some((option) => option.value === current)) select.value = current;
}

function setActive(parent, activeButton) {
  parent.querySelectorAll(".chip, [data-filter]").forEach((button) => button.classList.remove("active"));
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

function persistLibrary(sync = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.library));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.setItem(key, JSON.stringify(state.library)));
    if (sync) scheduleAccountSync();
    renderNotifications();
    renderHistory();
    return true;
  } catch (error) {
    return false;
  }
}

function loadAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || null;
  } catch (error) {
    return null;
  }
}

function loadActivity() {
  return compactActivityTimeline(readStoredArray(ACTIVITY_KEY)).slice(0, ACTIVITY_LIMIT);
}

function compactActivityTimeline(items) {
  const compacted = [];
  (items || []).forEach((activity) => {
    const item = activity?.item;
    const progress = Number(item?.progress || 0);
    const previous = compacted[compacted.length - 1];
    if (activity?.action === "updated" && previous?.action === "updated" && item?.id && previous.item?.id === item.id && progress > 0) {
      const ranges = mergeActivityRanges([...activityRangesFromItem(previous.item), ...activityRangesFromItem(item, progress)]);
      previous.item = { ...item, ...previous.item, progressRanges: ranges, progress: activityRangesMax(ranges) || previous.item.progress || progress };
      previous.text = activityTextForItem(previous.item, "updated");
      previous.time = Math.max(Number(previous.time || 0), Number(activity.time || 0));
      return;
    }
    compacted.push(activity);
  });
  return compacted;
}

function activityRangesFromItem(item, fallbackProgress = 0) {
  const ranges = [];
  if (Array.isArray(item?.progressRanges)) {
    item.progressRanges.forEach((range) => {
      const start = Number(Array.isArray(range) ? range[0] : range?.start);
      const end = Number(Array.isArray(range) ? range[1] : range?.end);
      if (Number.isFinite(start) && start > 0) ranges.push({ start, end: Number.isFinite(end) && end > 0 ? end : start });
    });
  }

  if (!ranges.length) {
    const start = Number(item?.progressStart || 0);
    const end = Number(item?.progressEnd || item?.progress || fallbackProgress || 0);
    if (end > 0) ranges.push({ start: start > 0 ? start : end, end });
  }

  const progress = Number(fallbackProgress || item?.progress || 0);
  if (progress > 0 && !ranges.some((range) => progress >= range.start && progress <= range.end)) ranges.push({ start: progress, end: progress });
  return mergeActivityRanges(ranges);
}

function addProgressToActivityRanges(item, progress) {
  const value = Number(progress || 0);
  if (!value) return activityRangesFromItem(item);
  return mergeActivityRanges([...activityRangesFromItem(item), { start: value, end: value }]);
}

function mergeActivityRanges(ranges) {
  const sorted = (ranges || [])
    .map((range) => ({ start: Math.min(Number(range.start), Number(range.end)), end: Math.max(Number(range.start), Number(range.end)) }))
    .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end) && range.end > 0)
    .sort((a, b) => a.start - b.start);
  const merged = [];
  sorted.forEach((range) => {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end + 1) {
      previous.end = Math.max(previous.end, range.end);
      return;
    }
    merged.push({ start: range.start, end: range.end });
  });
  return merged;
}

function activityRangesMax(ranges) {
  return Math.max(0, ...(ranges || []).map((range) => Number(range.end || 0)));
}

function formatActivityRanges(item) {
  const ranges = activityRangesFromItem(item);
  return ranges.map((range) => range.start === range.end ? formatProgressNumber(range.start) : `${formatProgressNumber(range.start)}-${formatProgressNumber(range.end)}`).join(", ");
}

function formatProgressNumber(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : String(number).replace(/\.0+$/, "");
}

function loadFavorites() {
  return readStoredArray(FAVORITES_KEY);
}

function loadFavoriteRemovals() {
  return readStoredArray(FAVORITE_REMOVALS_KEY).slice(0, ACTIVITY_LIMIT);
}

function persistFavorites(sync = true) {
  writeStoredArray(FAVORITES_KEY, state.favorites);
  writeStoredArray(FAVORITE_REMOVALS_KEY, state.favoriteRemovals || []);
  if (sync) scheduleAccountSync();
}

function favoriteSyncKey(item) {
  return `${item?.favoriteType || "title"}:${item?.id || ""}`;
}

function recordFavoriteRemoval(item) {
  if (!item?.id) return;
  const removal = { id: item.id, favoriteType: item.favoriteType || "title", removedAt: Date.now() };
  state.favoriteRemovals = mergeFavoriteRemovals(state.favoriteRemovals, [removal]);
}

function clearFavoriteRemoval(item) {
  const key = favoriteSyncKey(item);
  state.favoriteRemovals = (state.favoriteRemovals || []).filter((removal) => favoriteSyncKey(removal) !== key);
}

function favoriteItems() {
  return state.favorites
    .map((item) => ({ ...item, ...(state.library[item.id] || {}) }))
    .filter((item) => item?.id && (state.settings.allowAdult || (item.favoriteType !== "doujin-artist" && !isAdultLibraryItem(item))));
}

function compactFavoriteItem(item) {
  return {
    id: item.id,
    favoriteType: item.favoriteType || "title",
    apiId: item.apiId,
    apiSource: item.apiSource,
    providerId: item.providerId,
    provider: item.provider,
    type: item.type,
    title: item.title,
    image: item.image || fallbackImage,
    banner: item.banner || "",
    displayType: item.displayType,
    format: item.format,
    genres: item.genres,
    total: item.total,
    unit: item.unit,
    isAdult: item.isAdult,
    favoriteAt: Date.now(),
  };
}

function isFavoriteItem(item) {
  return Boolean(item?.id && state.favorites.some((favorite) => favorite.id === item.id));
}

function toggleFavoriteDoujinArtist(artist) {
  return toggleFavoriteDoujinCreator("artists", artist);
}

function toggleFavoriteDoujinCreator(category, nameValue) {
  const categoryKey = doujinCreatorFavoriteCategory(category);
  const label = categoryKey === "groups" ? "group" : "artist";
  const name = String(nameValue || "").trim();
  if (!name) return false;
  const id = doujinCreatorFavoriteId(categoryKey, name);
  const index = state.favorites.findIndex((favorite) => favorite.favoriteType === "doujin-artist" && favorite.id === id);
  if (index >= 0) {
    recordFavoriteRemoval(state.favorites[index]);
    state.favorites.splice(index, 1);
    persistFavorites();
    showToast(`Removed favorite ${label}.`);
    return false;
  }
  const favorite = { id, favoriteType: "doujin-artist", type: "artist", title: name, category: categoryKey, tag: name, isAdult: true, favoriteAt: Date.now() };
  clearFavoriteRemoval(favorite);
  state.favorites = [favorite, ...state.favorites].slice(0, ACTIVITY_LIMIT);
  persistFavorites();
  showToast(`Added favorite ${label}.`);
  return true;
}

function toggleFavoriteItem(item = state.current) {
  if (!item?.id) return false;
  const index = state.favorites.findIndex((favorite) => favorite.id === item.id);
  if (index >= 0) {
    recordFavoriteRemoval(state.favorites[index]);
    state.favorites.splice(index, 1);
    persistFavorites();
    showToast("Removed from favorites.");
    return false;
  }
  const favorite = compactFavoriteItem({ ...item, ...(state.library[item.id] || {}) });
  clearFavoriteRemoval(favorite);
  state.favorites = [favorite, ...state.favorites].slice(0, ACTIVITY_LIMIT);
  persistFavorites();
  showToast("Added to favorites.");
  return true;
}

function saveActivity(items, sync = true) {
  writeStoredArray(ACTIVITY_KEY, items.slice(0, ACTIVITY_LIMIT));
  if (sync) scheduleAccountSync();
}

function recordActivity(item, action = "updated") {
  if (!item?.id) return;
  const existing = loadActivity();
  const compact = compactActivityItem(item);
  const latest = existing[0];
  const progress = Number(compact.progress || 0);
  if (action === "updated" && progress > 0 && latest?.action === "updated" && latest.item?.id === item.id) {
    const ranges = addProgressToActivityRanges(latest.item, progress);
    latest.time = Date.now();
    latest.item = {
      ...latest.item,
      ...compact,
      progressRanges: ranges,
      progress: activityRangesMax(ranges) || progress,
    };
    latest.text = activityTextForItem(latest.item, action);
    saveActivity(existing);
    return;
  }
  const activity = {
    id: `${item.id}:${Date.now()}`,
    time: Date.now(),
    action,
    text: activityTextForItem(item, action),
    item: compact,
  };
  saveActivity([activity, ...existing].slice(0, ACTIVITY_LIMIT));
}

function compactActivityItem(item) {
  return {
    id: item.id,
    apiId: item.apiId,
    apiSource: item.apiSource,
    providerId: item.providerId,
    provider: item.provider,
    type: item.type,
    title: item.title,
    image: item.image || fallbackImage,
    displayType: item.displayType,
    format: item.format,
    genres: item.genres,
    status: item.status,
    progress: item.progress,
    progressStart: item.progressStart,
    progressEnd: item.progressEnd,
    progressRanges: item.progressRanges,
    total: item.total,
    unit: item.unit,
    updatedAt: item.updatedAt,
    isAdult: item.isAdult,
  };
}

function activityTextForItem(item, action = "updated") {
  const isManga = item.type === "manga";
  if (action === "added") return `Added`;
  if (action === "removed") return `Removed`;
  if (item.status === "completed") return "Completed";
  const ranges = formatActivityRanges(item);
  if (ranges) {
    const isMultiple = ranges.includes(",") || ranges.includes("-");
    return `${isManga ? `Read chapter${isMultiple ? "s" : ""}` : `Watched episode${isMultiple ? "s" : ""}`} ${ranges}`;
  }
  return `Plans to ${isManga ? "read" : "watch"}`;
}

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function writeStoredArray(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    // Ignore storage limits.
  }
}

function loadNotificationsStore() {
  return readStoredArray(NOTIFICATION_STORE_KEY).slice(0, ACTIVITY_LIMIT);
}

function saveNotificationsStore(items) {
  writeStoredArray(NOTIFICATION_STORE_KEY, items.slice(0, ACTIVITY_LIMIT));
}

function persistAccount() {
  if (state.account?.token) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(state.account));
  else localStorage.removeItem(ACCOUNT_KEY);
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
    const mangaId = url.searchParams.get("mangaId") || "";
    const chapterId = url.searchParams.get("chapterId") || "";
    const doujinProviders = DOUJIN_SOURCES.map((source) => source.id);
    return providers.some((provider) => doujinProviders.includes(provider))
      || doujinProviders.some((provider) => mangaId.startsWith(`${provider}:`))
      || doujinProviders.some((provider) => chapterId.startsWith(`${provider}:`));
  } catch (error) {
    return false;
  }
}

async function fetchSameOriginJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
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
    if (sectionName === "doujin-sources") loadDoujinSourcesNew();
  };

  nav?.addEventListener("click", (event) => {
    const button = event.target.closest(".settings-nav-btn[data-section]");
    if (!button) return;
    event.preventDefault();
    showSettingsSection(button.dataset.section);
  });

  const requestedSection = new URLSearchParams(window.location.search).get("section") || window.location.hash.replace(/^#/, "");
  if (requestedSection && navButtons.some((button) => button.dataset.section === requestedSection)) showSettingsSection(requestedSection);

  initProfileMediaSettings(settingsRoot);

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
  initAmbientStyleSettings();

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

  bindDefaultSourceSelect("[data-default-hentai-source]", "defaultHentaiSource", "hstream", animeSourceLabel, "Default hentai source");
  bindDefaultSourceSelect("[data-default-manga-source]", "defaultMangaSource", "weebcentral", providerLabel, "Default manga source");
  bindDefaultSourceSelect("[data-default-pornhwa-source]", "defaultPornhwaSource", "pornhwaz", providerLabel, "Default pornhwa source");

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
  loadDoujinSourcesNew();
}

function initProfileMediaSettings(root = document) {
  const avatarInput = root.querySelector("[data-profile-avatar-url]");
  const bannerInput = root.querySelector("[data-profile-banner-url]");
  if (!avatarInput || !bannerInput) return;
  const avatarPreview = root.querySelector("[data-profile-avatar-preview]");
  const bannerPreview = root.querySelector("[data-profile-banner-preview]");

  const sync = () => {
    avatarInput.value = state.settings.profileAvatarUrl || "";
    bannerInput.value = state.settings.profileBannerUrl || "";
    if (avatarPreview) avatarPreview.src = profileAvatarUrl();
    if (bannerPreview) bannerPreview.style.setProperty("--profile-bg", `url("${profileBannerUrl().replace(/"/g, "%22")}")`);
  };
  const save = () => {
    state.settings.profileAvatarUrl = avatarInput.value.trim();
    state.settings.profileBannerUrl = bannerInput.value.trim();
    persistSettings();
    hydrateProfileShell();
    sync();
  };

  avatarInput.addEventListener("change", save);
  bannerInput.addEventListener("change", save);
  root.querySelector("[data-profile-media-reset]")?.addEventListener("click", () => {
    state.settings.profileAvatarUrl = "";
    state.settings.profileBannerUrl = "";
    persistSettings();
    hydrateProfileShell();
    sync();
    showToast("Profile images reset.");
  });
  sync();
}

function bindDefaultSourceSelect(selector, key, fallback, labeler, toastPrefix) {
  const select = document.querySelector(selector);
  if (!select) return;
  if (![...select.options].some((option) => option.value === state.settings[key])) {
    state.settings[key] = fallback;
    persistSettings();
  }
  select.value = state.settings[key] || fallback;
  select.addEventListener("change", (event) => {
    state.settings[key] = event.target.value;
    persistSettings();
    showToast(`${toastPrefix} set to ${labeler(event.target.value)}`);
  });
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

function initAmbientStyleSettings() {
  const enabled = document.querySelector("[data-ambient-enabled]");
  const blur = document.querySelector("[data-ambient-blur]");
  const blurValue = document.querySelector("[data-ambient-blur-value]");
  const opacity = document.querySelector("[data-ambient-opacity]");
  const opacityValue = document.querySelector("[data-ambient-opacity-value]");
  const spread = document.querySelector("[data-ambient-spread]");
  const spreadValue = document.querySelector("[data-ambient-spread-value]");
  const saturation = document.querySelector("[data-ambient-saturation]");
  const saturationValue = document.querySelector("[data-ambient-saturation-value]");
  const brightness = document.querySelector("[data-ambient-brightness]");
  const brightnessValue = document.querySelector("[data-ambient-brightness-value]");
  const reset = document.querySelector("[data-reset-ambient]");
  if (!enabled || !blur || !opacity || !spread || !saturation || !brightness || !reset) return;

  const sync = () => {
    const style = { ...defaultAmbientStyle(), ...(state.settings.ambientStyle || {}) };
    enabled.checked = Boolean(state.settings.playerAmbient);
    blur.value = style.blur;
    opacity.value = style.opacity;
    spread.value = style.spread;
    saturation.value = style.saturation;
    brightness.value = style.brightness;
    if (blurValue) blurValue.textContent = `${style.blur}px`;
    if (opacityValue) opacityValue.textContent = `${style.opacity}%`;
    if (spreadValue) spreadValue.textContent = `${style.spread}px`;
    if (saturationValue) saturationValue.textContent = `${style.saturation}%`;
    if (brightnessValue) brightnessValue.textContent = `${style.brightness}%`;
  };

  const save = () => {
    state.settings.playerAmbient = enabled.checked;
    state.settings.ambientStyle = {
      blur: Number(blur.value),
      opacity: Number(opacity.value),
      spread: Number(spread.value),
      saturation: Number(saturation.value),
      brightness: Number(brightness.value),
    };
    sync();
    persistSettings();
  };

  [blur, opacity, spread, saturation, brightness].forEach((control) => control.addEventListener("input", save));
  enabled.addEventListener("change", save);
  reset.addEventListener("click", () => {
    state.settings.ambientStyle = defaultAmbientStyle();
    persistSettings();
    sync();
    showToast("Ambient style reset.");
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

async function loadDoujinSourcesNew() {
  const container = document.querySelector("[data-doujin-sources]");
  if (!container) return;
  if (!state.settings.allowAdult) {
    container.innerHTML = '<div class="empty">Enable 18+ content in Content settings to manage Doujin sources.</div>';
    return;
  }

  const enabled = { ...defaultDoujinSources(), ...(state.settings.doujinSources || {}) };
  container.innerHTML = DOUJIN_SOURCES.map((source) => `
    <div class="extension-card adult-source-card">
      <h4>${escapeHtml(source.name)} <span class="extension-nsfw">+18</span></h4>
      <p>${escapeHtml(source.description || "English doujin gallery source with direct page images when available.")}</p>
      <div class="extension-footer">
        <span class="extension-version">Doujin source</span>
        <input type="checkbox" class="extension-toggle" data-doujin-source-toggle="${escapeAttr(source.id)}" aria-label="Enable ${escapeAttr(source.name)}" ${enabled[source.id] ? "checked" : ""}>
      </div>
      ${source.defaultEnabled === false ? '<span class="source-note">Off by default: upstream may block production</span>' : ""}
    </div>
  `).join("");

  container.querySelectorAll("[data-doujin-source-toggle]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      state.settings.doujinSources = { ...defaultDoujinSources(), ...(state.settings.doujinSources || {}) };
      state.settings.doujinSources[toggle.dataset.doujinSourceToggle] = toggle.checked;
      persistSettings();
      showToast(`${toggle.checked ? "Enabled" : "Disabled"} ${providerLabel(toggle.dataset.doujinSourceToggle)}`);
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
  const currentSourceId = params.get("source") || startData?.sourceId || localStorage.getItem(animeSourceKey(anime)) || "";

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

  setupPlayerSourceSelector(anime, currentSourceId);
  setupPlayerEpisodeSearchControls();

  const targetEpisode = params.get("episode") || startData?.episode?.number || "";
  if (!episodes.length) {
    const loaded = await switchPlayerSource(anime, currentSourceId || preferredAnimeDetailSource(animePlaybackSources(anime), "", anime), targetEpisode, { silent: true });
    if (loaded) return;
  }

  renderEpisodesList(episodes, anime);

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
    document.querySelector("[data-video-player]").innerHTML = '<div class="player-loading"><p>No real episodes available.</p><p class="muted" style="font-size: 12px;">Use the source dropdown below the player when a provider exposes episode entries.</p></div>';
    document.querySelector("[data-streaming-sources]").innerHTML = '<div class="empty">No episode list was returned by AniList or the selected source.</div>';
  }
}

function setupPlayerEpisodeSearchControls() {
  const searchInput = document.querySelector("[data-episodes-search] input");
  const searchToggle = document.querySelector("[data-episodes-search-toggle]");
  const searchContainer = document.querySelector("[data-episodes-search]");
  if (!searchInput || !searchToggle || !searchContainer || searchInput.dataset.bound) return;
  searchInput.dataset.bound = "true";

  searchToggle.addEventListener("click", () => {
    searchContainer.classList.toggle("show");
    if (searchContainer.classList.contains("show")) searchInput.focus();
  });

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    document.querySelectorAll("[data-episode-item]").forEach((item) => {
      const title = item.dataset.episodeTitle.toLowerCase();
      const number = item.dataset.episodeNumber;
      const matches = title.includes(query) || number.includes(query);
      item.style.display = matches ? "" : "none";
    });
  });
}

function animePlaybackSources(item = null) {
  const sources = [];
  if (animeSourceEnabled("animedex")) sources.push({ id: "animedex", name: "AnimeDex" });
  if (animeSourceEnabled("anizone")) sources.push({ id: "anizone", name: "AniZone" });
  if (animeSourceEnabled("anilibria")) sources.push({ id: "anilibria", name: "AniLibria" });
  if (animeSourceEnabled("tokyoinsider")) sources.push({ id: "tokyoinsider", name: "TokyoInsider" });
  if (animeSourceEnabled("hstream") && state.settings.allowAdult) sources.push({ id: "hstream", name: "hstream.moe" });
  const preferred = preferredAnimeDetailSource(sources, "", item);
  return preferred ? [sources.find((source) => source.id === preferred), ...sources.filter((source) => source.id !== preferred)].filter(Boolean) : sources;
}

function setupPlayerSourceSelector(anime, currentSourceId = "") {
  const select = document.querySelector("[data-player-source-select]");
  const status = document.querySelector("[data-player-source-status]");
  const query = document.querySelector("[data-player-source-query]");
  if (!select || !status) return;

  const sources = animePlaybackSources(anime);
  if (!sources.length) {
    select.innerHTML = '<option value="">No enabled sources</option>';
    select.disabled = true;
    if (query) query.disabled = true;
    status.textContent = "Enable anime sources in Settings";
    return;
  }

  select.disabled = false;
  select.innerHTML = sources.map((source) => `<option value="${escapeAttr(source.id)}">${escapeHtml(source.name)}</option>`).join("");
  const saved = currentSourceId || localStorage.getItem(animeSourceKey(anime)) || preferredAnimeDetailSource(sources, "", anime);
  select.value = sources.some((source) => source.id === saved) ? saved : sources[0].id;
  if (query) query.value = localStorage.getItem(animeSourceCustomQueryKey(anime)) || "";
  status.textContent = playerRuntime.episodes.length ? `${playerRuntime.episodes.length} episode${playerRuntime.episodes.length === 1 ? "" : "s"} loaded` : "Choose a source";

  const loadSelected = () => switchPlayerSource(anime, select.value, playerRuntime.currentEpisodeNumber || "");
  select.onchange = loadSelected;
  if (query) {
    query.onchange = () => {
      localStorage.setItem(animeSourceCustomQueryKey(anime), query.value.trim());
      loadSelected();
    };
  }
}

async function switchPlayerSource(anime, sourceId, targetEpisode = "", options = {}) {
  const select = document.querySelector("[data-player-source-select]");
  const status = document.querySelector("[data-player-source-status]");
  const videoPlayer = document.querySelector("[data-video-player]");
  const sources = document.querySelector("[data-streaming-sources]");
  const playbackSources = animePlaybackSources(anime);
  const source = playbackSources.find((item) => item.id === sourceId) || playbackSources[0];
  if (!source) return false;
  const sourceToken = ++playerRuntime.sourceToken;

  if (select) select.value = source.id;
  if (status) status.textContent = `Loading ${source.name}...`;
  if (videoPlayer) videoPlayer.innerHTML = '<div class="player-loading"><div class="spinner"></div><p>Loading source episodes...</p></div>';
  if (sources) sources.innerHTML = `<p class="muted">Loading ${escapeHtml(source.name)}...</p>`;
  localStorage.setItem(animeSourceKey(anime), source.id);

  try {
    let episodes = [];
    if (source.id === "hstream") {
      const matches = await searchAdultAnime({ ...anime, sourceQuery: document.querySelector("[data-player-source-query]")?.value.trim() || "" });
      if (sourceToken !== playerRuntime.sourceToken || (select && select.value !== source.id)) return false;
      episodes = hstreamMatchesToEpisodes(matches);
      playerRuntime.currentSourceMatches = matches;
      playerRuntime.allSourceEpisodes = [];
    } else {
      const match = await searchAnimeProviderMatch(anime, source.id, document.querySelector("[data-player-source-query]")?.value.trim() || "");
      if (sourceToken !== playerRuntime.sourceToken || (select && select.value !== source.id)) return false;
      episodes = match ? await fetchAnimeProviderEpisodes(match) : [];
      if (sourceToken !== playerRuntime.sourceToken || (select && select.value !== source.id)) return false;
      playerRuntime.currentSourceMatches = [];
      playerRuntime.allSourceEpisodes = episodes;
      if (source.id === "animedex") {
        const preferredAudio = selectedAnimeEpisodeAudio(anime, episodes);
        episodes = filterEpisodesByAudio(episodes, preferredAudio);
      }
    }

    if (!episodes.length) throw new Error("No episodes");
    playerRuntime.episodes = episodes;
    renderEpisodesList(episodes, anime);
    if (status) status.textContent = `${source.name} / ${episodes.length} episode${episodes.length === 1 ? "" : "s"}`;
    const target = String(targetEpisode || "");
    const button = target ? [...document.querySelectorAll("[data-episode-item]")].find((item) => item.dataset.episodeNumber === target) : null;
    (button || document.querySelector("[data-episode-item]"))?.click();
    return true;
  } catch (error) {
    if (status) status.textContent = `${source.name} returned no episodes`;
    if (!options.silent) showToast(`No episodes found on ${source.name}`);
    renderEpisodesList([], anime);
    if (videoPlayer) videoPlayer.innerHTML = '<div class="player-loading"><p style="color: var(--red);">No playable episodes from this source</p></div>';
    return false;
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
    container.innerHTML = '<div class="empty" style="min-width: 260px;">No real episode list is available for this title. Choose a source from the dropdown below the player.</div>';
    return;
  }

  container.innerHTML = episodes
    .map((ep, index) => {
      const isWatched = state.library[anime.id]?.progress >= ep.number;
      const image = ep.image || anime.banner || anime.image || fallbackImage;
      return `<button
        type="button"
        class="episode-item ${index === 0 ? "active" : ""} ${isWatched ? "watched" : ""}"
        data-episode-item
        data-episode-number="${ep.number}"
        data-episode-title="${escapeAttr(ep.title)}"
        data-episode-data="${escapeAttr(JSON.stringify(ep))}"
      >
        <span class="episode-thumb-wrap">
          <img class="episode-thumb" src="${escapeAttr(image)}" alt="${escapeAttr(ep.title || `Episode ${ep.number}`)} thumbnail" loading="lazy">
          <span class="episode-number">Ep ${ep.number}</span>
        </span>
        <h4 class="episode-title">${escapeHtml(ep.title)}</h4>
        <span class="episode-air-date">${escapeHtml([episodeAudioLabel(ep.audio), ep.airDate].filter(Boolean).join(" / "))}</span>
        ${isWatched ? '<span class="episode-state muted">✓ Watched</span>' : ""}
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
  markAnimeEpisodeWatched(anime, episodeNumber);

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
      const subtitleParams = animeStreamSubtitleParams(anime, episodeNumber);
      const data = episode.source === "animedex"
        ? await fetchApiJson(`/api/anime/animedex/streams?episodeId=${encodeURIComponent(episode.episodeId || episode.id || "")}${subtitleParams}`)
        : episode.source === "tokyoinsider"
          ? await fetchApiJson(`/api/anime/tokyoinsider/streams?episodeUrl=${encodeURIComponent(episode.episodeUrl || episode.id || "")}${subtitleParams}`)
          : episode.source === "anilibria"
            ? await fetchApiJson(`/api/anime/anilibria/streams?releaseId=${encodeURIComponent(episode.providerId || "")}&episodeId=${encodeURIComponent(episode.episodeId || episode.id || "")}${subtitleParams}`)
          : await fetchApiJson(`/api/anime/anizone/streams?episodeUrl=${encodeURIComponent(episode.episodeUrl || episode.id || "")}${subtitleParams}`);
      renderDirectAnimeStreams(sources, data, episode.source, playerAutoPlayEnabled());
    } catch (error) {
      sources.innerHTML = `<div class="empty">Could not load ${escapeHtml(animeSourceLabel(episode.source))} streams for this episode.</div>`;
      videoPlayer.innerHTML = '<div class="player-loading"><p style="color: var(--red);">No playable source found</p></div>';
    }
    return;
  }

  try {
    const [aniwavesMatches, animeKaiMatches, adultMatches] = await Promise.all([
      animeSourceEnabled("aniwaves") ? searchAniwavesAnime(anime.title) : [],
      animeSourceEnabled("animekai") ? searchAnimeKaiAnime(anime.title) : [],
      animeSourceEnabled("hstream") ? searchAdultAnime(anime) : [],
    ]);
    renderStreamingSources(sources, anime, episodeNumber, aniwavesMatches, animeKaiMatches, adultMatches);
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

function animeStreamSubtitleParams(anime, episodeNumber) {
  const params = new URLSearchParams();
  const anilistId = anime?.anilistId || (/^\d+$/.test(String(anime?.id || "")) ? anime.id : "");
  if (anilistId) params.set("anilistId", anilistId);
  if (anime?.title) params.set("title", anime.title);
  if (episodeNumber) params.set("episode", episodeNumber);
  const query = params.toString();
  return query ? `&${query}` : "";
}

function setupMarkWatchedButton(anime, episodeNumber) {
  document.querySelector("[data-mark-watched]").onclick = () => {
    markAnimeEpisodeWatched(anime, episodeNumber);
    showToast(`Marked Episode ${episodeNumber} as watched`);
  };
}

function markAnimeEpisodeWatched(anime, episodeNumber) {
  if (!state.current && anime) state.current = anime;
  const progress = document.querySelector("[data-track-progress]");
  if (progress) progress.value = episodeNumber;
  if (!anime?.id || !state.library[anime.id]) {
    document.querySelector(`[data-episode-item][data-episode-number="${episodeNumber}"]`)?.classList.add("watched");
    return;
  }
  const selectedProgress = Number(episodeNumber) || 0;
  state.library[anime.id].progress = Math.max(state.library[anime.id].progress || 0, selectedProgress);
  state.library[anime.id].status = "watching";
  state.library[anime.id].updatedAt = Date.now();
  recordActivity({ ...state.library[anime.id], progress: selectedProgress }, "updated");
  persistLibrary();
  document.querySelector(`[data-episode-item][data-episode-number="${episodeNumber}"]`)?.classList.add("watched");
}

async function searchAniwavesAnime(animeTitle) {
  try {
    return await fetchApiJson(`/api/anime/search?title=${encodeURIComponent(animeTitle)}`);
  } catch (error) {
    return [];
  }
}

async function searchAnimeKaiAnime(animeTitle) {
  try {
    return await fetchApiJson(`/api/anime/animekai/search?title=${encodeURIComponent(animeTitle)}`);
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

function renderStreamingSources(container, anime, episodeNumber, aniwavesMatches = [], animeKaiMatches = [], adultMatches = []) {
  const extensionHtml = extensionSourceCards("anime");
  const externalHtml = externalAnimeSourceCards(anime, episodeNumber, { aniwaves: aniwavesMatches, animekai: animeKaiMatches });
  const adultHtml = adultSourceCards(adultMatches);
  if (!externalHtml && !adultMatches.length) {
    container.innerHTML = `
      ${extensionHtml}
      ${externalHtml}
      ${adultHtml}
      <div class="empty" style="padding: 16px; text-align: center;">
        <p class="muted">No sources available</p>
        <p class="muted" style="font-size: 12px;">Try AnimeDex/AniZone on the details page, or enable another provider in Settings.</p>
      </div>
    `;
    bindExtensionSourceButtons(container);
    bindExternalAnimeSourceButtons(container);
    bindAdultSourceButtons(container);
    document.querySelector("[data-video-player]").innerHTML = `
      <div class="player-loading">
        <p style="color: var(--red);">No provider sources found</p>
        <p class="muted" style="font-size: 12px;">Try another episode or search the title manually.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `${extensionHtml}${externalHtml}${adultHtml}`;

  // Add play button handlers
  bindExtensionSourceButtons(container);
  bindExternalAnimeSourceButtons(container);
  bindAdultSourceButtons(container);
  document.querySelector("[data-video-player]").innerHTML = `
    <div class="player-loading">
      <p>Select a stream below</p>
      <p class="muted" style="font-size: 12px;">Provider links may open externally when raw browser-playable streams are not available.</p>
    </div>
  `;
}

function externalAnimeSourceCards(anime, episodeNumber, matchesByProvider = {}) {
  const sections = [];
  if (animeSourceEnabled("aniwaves") && matchesByProvider.aniwaves?.length) sections.push(matchedExternalAnimeSourceCards("aniwaves", matchesByProvider.aniwaves, episodeNumber));
  if (animeSourceEnabled("animekai") && matchesByProvider.animekai?.length) sections.push(matchedExternalAnimeSourceCards("animekai", matchesByProvider.animekai, episodeNumber));
  if (animeSourceEnabled("allanime")) sections.push(searchExternalAnimeSourceCard("allanime", anime, episodeNumber, `https://allmanga.to/anime?search=${encodeURIComponent(anime?.title || "")}`));
  if (animeSourceEnabled("miruro")) sections.push(searchExternalAnimeSourceCard("miruro", anime, episodeNumber, `https://www.miruro.tv/search?query=${encodeURIComponent(anime?.title || "")}`));
  return sections.filter(Boolean).join("");
}

function matchedExternalAnimeSourceCards(provider, matches, episodeNumber) {
  return `
    <div class="aniwaves-source-list" style="display: grid; gap: 8px; margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px; font-size: 14px;">${escapeHtml(animeSourceLabel(provider))} matches</h4>
      ${matches.slice(0, 5).map((match) => externalAnimeSourceItem(provider, match, episodeNumber)).join("")}
    </div>
  `;
}

function externalAnimeSourceItem(provider, match, episodeNumber) {
  const meta = [match.type, match.date, match.rating].filter(Boolean).join(" / ");
  return `
    <div class="source-item">
      <div class="source-info">
        <h4>${escapeHtml(match.title || animeSourceLabel(provider))}</h4>
        <p>${escapeHtml(meta || "Open provider page")}</p>
        <p style="font-size: 11px; margin-top: 4px;">${escapeHtml(episodeNumber ? `Select episode ${episodeNumber} on ${animeSourceLabel(provider)}` : "Episode selection opens on the provider")}</p>
      </div>
      <button class="source-open-external-anime" data-external-anime-url="${escapeAttr(match.url)}" data-external-anime-provider="${escapeAttr(provider)}" type="button" style="padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, var(--blue), var(--mint)); color: #06101a; border: none; font-weight: 700; cursor: pointer; font-size: 12px; white-space: nowrap;">Open</button>
    </div>
  `;
}

function searchExternalAnimeSourceCard(provider, anime, episodeNumber, url) {
  if (!url || !anime?.title) return "";
  return `
    <div class="aniwaves-source-list" style="display: grid; gap: 8px; margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px; font-size: 14px;">${escapeHtml(animeSourceLabel(provider))} search</h4>
      ${externalAnimeSourceItem(provider, { title: anime.title, url, type: "Search", date: episodeNumber ? `Find episode ${episodeNumber}` : "Open provider search" }, episodeNumber)}
    </div>
  `;
}

function bindExternalAnimeSourceButtons(container) {
  container.querySelectorAll("[data-external-anime-url]").forEach((button) => {
    button.addEventListener("click", () => {
      window.open(button.dataset.externalAnimeUrl, "_blank", "noreferrer");
      showToast(`Opening ${animeSourceLabel(button.dataset.externalAnimeProvider)} source`);
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

function sortSubtitleTracks(tracks = []) {
  const seen = new Set();
  return tracks
    .filter((track) => track?.url)
    .map((track, index) => ({ track, index, score: subtitleTrackPreferenceScore(track) }))
    .filter((item) => {
      const key = String(item.track.url || "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((item) => item.track);
}

function subtitleTrackPreferenceScore(track) {
  const preference = state.settings.subtitleLanguage || "english";
  if (preference === "both") return 0;
  const code = String(track?.srclang || track?.lang || "").toLowerCase();
  const label = String(track?.label || "").toLowerCase();
  const isEnglish = /^(en|eng|english)$/.test(code) || /english|\beng\b/.test(label);
  const isNative = /^(ja|jp|jpn|japanese)$/.test(code) || /japanese|\bjp\b|\bjpn\b/.test(label);
  if (preference === "native") return isNative ? 0 : isEnglish ? 1 : 2;
  return isEnglish ? 0 : isNative ? 2 : 1;
}

function playerAutoPlayEnabled() {
  return state.settings.autoPlay !== false;
}

async function playHttpStream(url, tracks = [], options = {}) {
  const player = document.querySelector("[data-video-player]");
  const subtitleTracks = sortSubtitleTracks(tracks);
  const resumeState = options.resumeState || playerRuntime.resumeState || null;
  playerRuntime.resumeState = null;
  const streamToken = ++playerRuntime.streamToken;
  destroyActiveStreamEngines();
  player.innerHTML = `
    <video data-active-video playsinline crossorigin="anonymous" preload="auto" style="width: 100%; height: 100%; background: #000;"></video>
    <div class="player-ambient-backdrop" data-player-ambient-backdrop></div>
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
        <label class="player-check"><input data-player-ambient-toggle type="checkbox"> Ambient mode</label>
      </div>
    </div>
  `;
  setSubtitleToggleAvailable(false);
  const video = player.querySelector("[data-active-video]");
  const shouldAutoplay = !resumeState?.paused;
  const sourceOptions = Array.isArray(options.sources) ? options.sources : [{ url, name: "Current stream", tracks: subtitleTracks }];
  const currentIndex = Number.isFinite(Number(options.currentIndex)) ? Number(options.currentIndex) : Math.max(0, sourceOptions.findIndex((source) => source.url === url));
  setupCustomVideoControls(video);
  setupCustomSubtitles(video, subtitleTracks);
  applyPlayerAmbientMode(video);
  setupPlayerSettingsControls(video, subtitleTracks, sourceOptions, currentIndex);
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
  const ambient = document.querySelector("[data-player-ambient-toggle]");

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

  if (ambient) {
    ambient.checked = Boolean(state.settings.playerAmbient);
    ambient.onchange = () => {
      state.settings.playerAmbient = ambient.checked;
      persistSettings();
      applyPlayerAmbientMode(video);
    };
  }
}

function applyPlayerAmbientMode(video = document.querySelector("[data-active-video]")) {
  const player = document.querySelector("[data-video-player]");
  const backdrop = document.querySelector("[data-player-ambient-backdrop]");
  if (!player || !backdrop) return;
  const enabled = Boolean(state.settings.playerAmbient);
  const style = { ...defaultAmbientStyle(), ...(state.settings.ambientStyle || {}) };
  player.classList.toggle("ambient-on", enabled);
  backdrop.hidden = !enabled;
  const image = playerRuntime.currentEpisode?.image || playerRuntime.anime?.banner || playerRuntime.anime?.image || fallbackImage;
  backdrop.style.backgroundImage = enabled ? `url("${String(image).replace(/"/g, "%22")}")` : "";
  backdrop.style.setProperty("--ambient-spread", `${style.spread}px`);
  backdrop.style.setProperty("--ambient-blur", `${style.blur}px`);
  backdrop.style.setProperty("--ambient-opacity", String(style.opacity / 100));
  backdrop.style.setProperty("--ambient-saturation", String(style.saturation / 100));
  backdrop.style.setProperty("--ambient-brightness", String(style.brightness / 100));
  backdrop.style.setProperty("--ambient-scale", String(1 + Math.max(0, style.spread) / 1100));
  if (video) video.classList.toggle("ambient-video", enabled);
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
  overlay.style.setProperty("--subtitle-settings-offset", `${offset + 52}px`);
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
  return /\.(?:ass|ssa)(?:$|[?#])/i.test(String(url)) || /^\s*\[Script Info\]/i.test(text)
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
  const parts = String(value || "").replace(",", ".").split(":");
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

  setupReadingMode(manga);
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
  const sourceQuery = document.querySelector("[data-manga-source-query]");
  if (sourceQuery) sourceQuery.value = localStorage.getItem(mangaSourceCustomQueryKey(manga)) || "";
  const mangaSources = await loadMangaSourceMatches(manga, sourceQuery?.value.trim() || "");
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
    const providers = preferredMangaProviderOrder(manga, enabledMangaProviderIds());
    if (!providers.length) return [];
    const cacheKey = mangaSourceMatchesCacheKey(manga, customTitle, providers);
    const cached = readSessionCache(cacheKey, MANGA_CHAPTER_CACHE_TTL_MS);
    if (cached) return cached;
    const searchTitles = customTitle ? uniqueStrings([customTitle, ...mangaSourceSearchTitles(manga)]) : mangaSourceSearchTitles(manga);
    const results = await Promise.allSettled(searchTitles.map((title) =>
      fetchApiJson(`/api/manga/search?title=${encodeURIComponent(title)}&providers=${encodeURIComponent(providers.join(","))}`)
        .then((matches) => matches.map((match) => ({ ...match, searchTitle: title })))
    ));
    const matches = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    const best = bestMangaSourceMatches(matches, searchTitles, providers);
    writeSessionCache(cacheKey, best);
    return best;
  } catch (error) {
    showToast("Could not search manga sources");
    return [];
  }
}

function mangaSourceMatchesCacheKey(manga, customTitle, providers) {
  return `manga-source-matches:${mangaSourceKey(manga)}:${normalizeSearchText(customTitle || "default")}:${providers.join("|")}`;
}

async function fetchReaderMangaChaptersCached(sourceId) {
  const cached = readCachedMangaChapters(sourceId);
  if (cached) return cached;
  const chapters = await fetchApiJson(`/api/manga/chapters?mangaId=${encodeURIComponent(sourceId)}`);
  writeCachedMangaChapters(sourceId, chapters || []);
  return chapters || [];
}

function readSessionCache(key, ttl) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!cached || Date.now() - Number(cached.time || 0) > ttl) return null;
    return cached.value;
  } catch (error) {
    return null;
  }
}

function writeSessionCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), value }));
  } catch (error) {
    // Ignore storage limits.
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
  const query = document.querySelector("[data-manga-source-query]");
  if (!bar || !select || !status) return;
  if (query) query.value = localStorage.getItem(mangaSourceCustomQueryKey(manga)) || "";
  if (query) {
    query.onchange = async () => {
      localStorage.setItem(mangaSourceCustomQueryKey(manga), query.value.trim());
      status.textContent = "Searching sources...";
      select.disabled = true;
      const nextMatches = await loadMangaSourceMatches(manga, query.value.trim());
      renderMangaSourceSelector(nextMatches, manga);
      await loadMangaSourceChapters(manga, nextMatches);
    };
  }

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
  const loadToken = (loadMangaSourceChapters.token = (loadMangaSourceChapters.token || 0) + 1);
  const container = document.querySelector("[data-chapters-list]");
  const display = document.querySelector("[data-chapter-display]");
  const status = document.querySelector("[data-manga-source-status]");
  const select = document.querySelector("[data-manga-source-select]");
  const preferredSourceId = preferredId || localStorage.getItem(mangaSourceKey(manga));
  const cachedSourceId = preferredSourceId || matches[0]?.id || "";
  const hasCachedChapters = cachedSourceId && readCachedMangaChapters(cachedSourceId);

  container.innerHTML = `
    <div class="chapters-loading">
      <div class="spinner"></div>
      <p>Loading chapters...</p>
    </div>
  `;
  if (!hasCachedChapters) {
    display.innerHTML = `
      <div class="reader-loading">
        <div class="spinner"></div>
        <p>Loading source...</p>
      </div>
    `;
  }

  try {
    const ordered = orderMangaSources(matches, preferredSourceId);

    for (const match of ordered) {
      if (select) select.value = match.id;
      if (status) status.textContent = `Loading ${providerLabel(match.provider)}...`;
      const chapters = await fetchReaderMangaChaptersCached(match.id);
      if (loadToken !== loadMangaSourceChapters.token) return;
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
    if (loadToken !== loadMangaSourceChapters.token) return;
    showToast("Using generated chapter list; providers did not return chapters");
    if (status) status.textContent = "Generated chapter list";
    renderChaptersList(buildChapters(manga), manga);
    const start = readerStartChapter(manga, "");
    const startButton = start ? [...document.querySelectorAll("[data-chapter-item]")].find((button) => button.dataset.chapterNumber === start.chapterNumber) : null;
    (startButton || document.querySelector("[data-chapter-item]"))?.click();
    if (startButton) sessionStorage.removeItem("reader-start-chapter");
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
  return ({ mangadex: "MangaDex", asura: "Asura Scans", mangakatana: "MangaKatana", weebcentral: "WeebCentral", flamecomics: "Flame Comics", rizzcomic: "Rizz Comic", projectsuki: "Project Suki", manhwaz: "ManhwaZ", pornhwaz: "PornhwaZ", hentai20: "Hentai20", pornhwapro: "Pornhwa Pro", hentai18: "Hentai18", hentainame: "Hentai.name", hentaizap: "HentaiZap", hentaifox: "HentaiFox", "3hentai": "3Hentai", hentaiera: "HentaiEra", hentaicity: "HentaiCity", toonily: "Toonily", animedex: "AnimeDex", anizone: "AniZone", anilibria: "AniLibria", tokyoinsider: "TokyoInsider", aniwaves: "Aniwaves", animekai: "AnimeKai", allanime: "AllAnime", miruro: "Miruro", hstream: "hstream.moe" }[provider] || provider || "Source");
}

function animeSourceLabel(source) {
  return ({ animedex: "AnimeDex", anizone: "AniZone", anilibria: "AniLibria", tokyoinsider: "TokyoInsider", aniwaves: "Aniwaves", animekai: "AnimeKai", allanime: "AllAnime", miruro: "Miruro", hstream: "hstream.moe" }[source] || source || "Anime source");
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
    if (!data || data.mangaKey !== mangaSourceKey(manga)) return null;
    if (data.providerId && data.providerId !== providerId) return null;
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

function readerModeKind(manga, provider = "") {
  const providerId = String(provider || manga?.provider || manga?.providerId || manga?.apiId || "").split(":")[0].toLowerCase();
  if (isDoujinLibraryItem(manga) || DOUJIN_SOURCES.some((source) => source.id === providerId)) return "doujin";
  if (["manhwaz", "pornhwaz", "pornhwapro", "toonily"].includes(providerId) || /manhwa|pornhwa|webtoon/i.test(`${manga?.displayType || ""} ${manga?.format || ""} ${(manga?.genres || []).join(" ")} ${manga?.title || ""}`)) return "manhwa";
  return "manga";
}

function defaultReadingModeForKind(kind) {
  return kind === "doujin" ? "single" : "webtoon";
}

function applyReaderDefaultMode(manga, provider = "") {
  const select = document.querySelector("[data-reading-mode]");
  if (!select) return;
  const kind = readerModeKind(manga, provider);
  if (select.dataset.readerModeKind === kind) return;
  const key = `reader-mode-${kind}`;
  const mode = localStorage.getItem(key) || defaultReadingModeForKind(kind);
  select.dataset.readerModeKind = kind;
  select.value = mode;
  localStorage.setItem("reader-mode", mode);
  scheduleAccountSync();
  applyReadingMode(mode);
}

function setupReadingMode(manga = null) {
  const select = document.querySelector("[data-reading-mode]");
  if (!select) return;
  const kind = readerModeKind(manga);
  const key = `reader-mode-${kind}`;
  const saved = localStorage.getItem(key) || defaultReadingModeForKind(kind);
  select.dataset.readerModeKind = kind;
  select.value = saved;
  applyReadingMode(saved);
  select.addEventListener("change", () => {
    localStorage.setItem(`reader-mode-${select.dataset.readerModeKind || "manga"}`, select.value);
    localStorage.setItem("reader-mode", select.value);
    scheduleAccountSync();
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
      const image = ch.image || manga.image || manga.banner || fallbackImage;
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
        <img class="chapter-thumb" src="${escapeAttr(image)}" alt="${escapeAttr(ch.title || `Chapter ${ch.number}`)} thumbnail" loading="lazy">
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
        applyReaderDefaultMode(manga, chapter.provider);
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
  clearTimeout(renderChapterPages.controlsTimer);
  renderChapterPages.controlsTimer = setTimeout(() => document.body.classList.remove("reader-controls-visible"), 1600);
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
      loadImageWithFallback(image, image.dataset.src).finally(() => { delete image.dataset.loading; loadWindow(); });
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
    loadImageWithFallback(image, url).then(() => preloadReaderPages(pages, current + step, step + 1));
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
  setupReaderKeyboardNavigation(step);
}

function setupReaderKeyboardNavigation(step) {
  if (playerRuntime.readerKeyboardHandler) document.removeEventListener("keydown", playerRuntime.readerKeyboardHandler);
  playerRuntime.readerKeyboardHandler = (event) => {
    if (event.target?.closest?.("input, textarea, select, button")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeReaderPage(-step);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      changeReaderPage(step);
    }
  };
  document.addEventListener("keydown", playerRuntime.readerKeyboardHandler);
}

function changeReaderPage(delta) {
  const session = state.readerSession;
  if (!session?.pages?.length) return;
  const next = Math.max(0, Math.min(session.pageIndex + delta, session.pages.length - 1));
  if (next === session.pageIndex) return;
  renderChapterPages(session.display, session.pages, session.chapter, next);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function preloadReaderPages(pages, start, count) {
  for (let index = start; index < Math.min(pages.length, start + count); index += 1) {
    const image = new Image();
    image.decoding = "async";
    loadImageWithFallback(image, pages[index]);
  }
}

function loadImageWithFallback(image, url) {
  const candidates = imageFallbackCandidates(url);
  if (!candidates.length) return Promise.resolve();
  return new Promise((resolve) => {
    let index = 0;
    image.onload = () => resolve();
    image.onerror = () => {
      index += 1;
      if (index < candidates.length) {
        image.src = candidates[index];
        return;
      }
      resolve();
    };
    image.src = candidates[0];
  });
}

function imageFallbackCandidates(url) {
  const value = String(url || "");
  if (!value) return [];
  const match = value.match(/^(https:\/\/(?:i\d*\.hentaifox\.com|m\d+\.hentaiera\.com)\/.*?\/\d+)\.(webp|jpg|jpeg|png)(\?[^?#]*)?$/i);
  if (!match) return [value];
  const [, base, extension, query = ""] = match;
  return uniqueStrings([extension, "webp", "jpg", "png", "jpeg"].map((ext) => `${base}.${ext}${query}`));
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
  if (!manga?.id || !state.library[manga.id]) {
    document.querySelector(`[data-chapter-item][data-chapter-number="${chapterNumber}"]`)?.classList.add("read");
    return;
  }
  state.library[manga.id].progress = Math.max(
    state.library[manga.id].progress || 0,
    Number(chapterNumber)
  );
  state.library[manga.id].status = "reading";
  state.library[manga.id].updatedAt = Date.now();
  recordActivity({ ...state.library[manga.id], progress: Number(chapterNumber) || 0 }, "updated");
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
