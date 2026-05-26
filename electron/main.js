const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");

const APP_ROOT = path.resolve(__dirname, "..");
const LOCAL_APP_PORT = 47931;
const BACKEND_ORIGIN = "https://anime-api-proxy.aryanpanwar.workers.dev";
const DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const DESKTOP_SETTINGS_PATH = path.join(app.getPath("userData"), "desktop-settings.json");
const desktopSettings = readDesktopSettings();
const singleInstanceLock = app.requestSingleInstanceLock();
const frontendApiHandler = require(path.join(APP_ROOT, "api", "adult", "[path].js"));
const ELECTRON_SAFE_AREA_CSS = `
  html, body, * { scrollbar-width: none !important; }
  body { padding-top: 0 !important; }
  .topbar.shell.anilist-topbar { top: 0 !important; padding-top: 18px !important; padding-right: 176px !important; }
  .topbar.shell.anilist-topbar .top-actions { transform: none !important; }
  body[data-page="anime"] .browse-filter-fab, body[data-page="manga"] .browse-filter-fab, body[data-page="doujin"] .browse-filter-fab { right: 24px !important; bottom: 24px !important; }
  ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  ::-webkit-scrollbar-button, ::-webkit-scrollbar-corner { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
  ::-webkit-scrollbar-track { background: transparent !important; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: transparent !important; }
`;
let appOrigin = "";
let mainWindow = null;
let webTorrentClientPromise = null;

const torrentSessions = new Map();
const TORRENT_VIDEO_EXTENSIONS = new Set([".mp4", ".m4v", ".webm", ".mkv", ".mov", ".avi", ".ogv", ".ts"]);

if (desktopSettings.gpuAcceleration === false) {
  app.disableHardwareAcceleration();
}

if (!singleInstanceLock) {
  app.quit();
}

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function readDesktopSettings() {
  try {
    return { gpuAcceleration: true, ...JSON.parse(fs.readFileSync(DESKTOP_SETTINGS_PATH, "utf8")) };
  } catch {
    return { gpuAcceleration: true };
  }
}

function writeDesktopSettings(nextSettings) {
  fs.mkdirSync(path.dirname(DESKTOP_SETTINGS_PATH), { recursive: true });
  Object.assign(desktopSettings, nextSettings);
  fs.writeFileSync(DESKTOP_SETTINGS_PATH, JSON.stringify(desktopSettings, null, 2));
  return desktopSettings;
}

const TORRENT_STREAM_MIME_TYPES = {
  ".avi": "video/x-msvideo",
  ".m4v": "video/x-m4v",
  ".mkv": "video/x-matroska",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".ogv": "video/ogg",
  ".ts": "video/mp2t",
  ".webm": "video/webm"
};

async function getWebTorrentClient() {
  if (!webTorrentClientPromise) {
    webTorrentClientPromise = import("webtorrent").then(({ default: WebTorrent }) => {
      const downloadPath = path.join(app.getPath("userData"), "torrents");
      fs.mkdirSync(downloadPath, { recursive: true });
      return new WebTorrent({ path: downloadPath });
    });
  }

  return webTorrentClientPromise;
}

function isTorrentInput(value = "") {
  const text = String(value || "").trim();
  return /^magnet:\?xt=urn:btih:/i.test(text) || /^https?:\/\//i.test(text);
}

function isTorrentFilePath(value = "") {
  return path.extname(String(value || "")).toLowerCase() === ".torrent";
}

function torrentVideoFiles(torrent) {
  return (torrent.files || [])
    .map((file, index) => ({ file, index, ext: path.extname(file.name || "").toLowerCase() }))
    .filter(({ ext }) => TORRENT_VIDEO_EXTENSIONS.has(ext));
}

function torrentSummary(torrent) {
  const torrentId = torrent.infoHash || torrent.magnetURI || "";
  const files = torrentVideoFiles(torrent).map(({ file, index, ext }) => ({
    index,
    name: file.name,
    path: file.path || file.name,
    size: file.length || 0,
    mimeType: TORRENT_STREAM_MIME_TYPES[ext] || "application/octet-stream",
    streamUrl: `${appOrigin}/__torrent/stream/${encodeURIComponent(torrentId)}/${index}/${encodeURIComponent(path.basename(file.name || `file-${index}`))}`
  }));

  return {
    torrentId,
    infoHash: torrent.infoHash || "",
    name: torrent.name || "Torrent",
    progress: Number(torrent.progress || 0),
    downloadSpeed: Number(torrent.downloadSpeed || 0),
    numPeers: Number(torrent.numPeers || 0),
    ready: Boolean(torrent.ready || torrent.files?.length),
    files
  };
}

function waitForTorrentMetadata(torrent, timeoutMs = 45000) {
  if (torrent.files?.length) return Promise.resolve(torrent);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => cleanup(() => reject(new Error("Timed out waiting for torrent metadata"))), timeoutMs);
    const done = () => cleanup(() => resolve(torrent));
    const fail = (error) => cleanup(() => reject(error));
    const on = (event, handler) => {
      if (typeof torrent.once === "function") torrent.once(event, handler);
      else if (typeof torrent.addEventListener === "function") torrent.addEventListener(event, handler, { once: true });
    };
    const off = (event, handler) => {
      if (typeof torrent.off === "function") torrent.off(event, handler);
      else if (typeof torrent.removeListener === "function") torrent.removeListener(event, handler);
      else if (typeof torrent.removeEventListener === "function") torrent.removeEventListener(event, handler);
    };
    const cleanup = (callback) => {
      clearTimeout(timer);
      off("metadata", done);
      off("ready", done);
      off("error", fail);
      callback();
    };
    on("metadata", done);
    on("ready", done);
    on("error", fail);
  });
}

async function addTorrentSource(payload = {}) {
  const input = String(payload.input || "").trim();
  const filePath = String(payload.filePath || "").trim();
  const savedTorrentId = String(payload.torrentId || "").trim();
  const source = filePath || input;
  if (filePath && !isTorrentFilePath(filePath)) throw new Error("Choose a .torrent file");
  if (!filePath && !isTorrentInput(input)) throw new Error("Paste a magnet link or torrent URL");

  const client = await getWebTorrentClient();
  const existing = (savedTorrentId && torrentSessions.get(savedTorrentId)) || (input && /^magnet:/i.test(input) ? client.get(input) : null);
  const torrent = existing || client.add(source, { path: path.join(app.getPath("userData"), "torrents") });
  await waitForTorrentMetadata(torrent);
  if (torrent.infoHash) torrentSessions.set(torrent.infoHash, torrent);
  torrent.files?.forEach((file) => file.deselect?.());
  return torrentSummary(torrent);
}

async function handleTorrentStreamRequest(request, response) {
  const parsed = new URL(request.url || "/", appOrigin || "http://127.0.0.1");
  const parts = parsed.pathname.split("/").filter(Boolean);
  const torrentId = decodeURIComponent(parts[2] || "");
  const fileIndex = Number(decodeURIComponent(parts[3] || ""));
  const torrent = torrentSessions.get(torrentId);
  const file = torrent?.files?.[fileIndex];
  if (!torrent || !file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Torrent file not found");
    return;
  }

  file.select?.();
  const total = file.length || 0;
  const range = request.headers.range || "";
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range);
  const start = match && match[1] ? Number(match[1]) : 0;
  const end = match && match[2] ? Math.min(Number(match[2]), total - 1) : Math.max(0, total - 1);
  const hasRange = Boolean(match);
  const ext = path.extname(file.name || "").toLowerCase();
  const headers = {
    "Accept-Ranges": "bytes",
    "Access-Control-Allow-Origin": appOrigin,
    "Cache-Control": "no-store",
    "Content-Type": TORRENT_STREAM_MIME_TYPES[ext] || "application/octet-stream"
  };

  if (hasRange) {
    headers["Content-Range"] = `bytes ${start}-${end}/${total}`;
    headers["Content-Length"] = Math.max(0, end - start + 1);
    response.writeHead(206, headers);
  } else {
    headers["Content-Length"] = total;
    response.writeHead(200, headers);
  }

  if ((request.method || "GET") === "HEAD") {
    response.end();
    return;
  }

  const stream = file.createReadStream({ start, end });
  stream.on("error", () => {
    if (!response.headersSent) response.writeHead(500);
    response.end();
  });
  request.on("close", () => stream.destroy?.());
  stream.pipe(response);
}

async function handleSubtitleProxyRequest(request, response) {
  try {
    const parsed = new URL(request.url || "/", appOrigin || "http://127.0.0.1");
    const target = parsed.searchParams.get("url") || "";
    if (!/^https?:\/\//i.test(target)) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Invalid subtitle URL");
      return;
    }

    const subtitleResponse = await fetch(target, {
      headers: {
        accept: "text/vtt,text/plain,*/*",
        "user-agent": DESKTOP_USER_AGENT
      }
    });
    const data = Buffer.from(await subtitleResponse.arrayBuffer());
    response.writeHead(subtitleResponse.status, {
      "Access-Control-Allow-Origin": appOrigin,
      "Cache-Control": "no-store",
      "Content-Type": subtitleResponse.headers.get("content-type") || "text/plain; charset=utf-8"
    });
    response.end(data);
  } catch (error) {
    response.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Subtitle proxy failed");
  }
}

function isLocalAppUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    return parsed.origin === appOrigin;
  } catch {
    return false;
  }
}

function openExternal(targetUrl) {
  if (/^https?:\/\//i.test(targetUrl)) {
    shell.openExternal(targetUrl);
  }
}

function resolveStaticPath(requestUrl) {
  const parsed = new URL(requestUrl, "http://127.0.0.1");
  const pathname = decodeURIComponent(parsed.pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(APP_ROOT, relativePath);
  if (!filePath.startsWith(APP_ROOT)) {
    return null;
  }

  return filePath;
}

function requestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    request.on("error", reject);
  });
}

function proxiedRequestHeaders(headers) {
  const forwarded = { ...headers };
  delete forwarded.host;
  delete forwarded.origin;
  delete forwarded.referer;
  forwarded["user-agent"] = DESKTOP_USER_AGENT;
  return forwarded;
}

function queryObject(searchParams) {
  const query = {};
  searchParams.forEach((value, key) => {
    if (query[key] === undefined) {
      query[key] = value;
    } else if (Array.isArray(query[key])) {
      query[key].push(value);
    } else {
      query[key] = [query[key], value];
    }
  });
  return query;
}

function addVercelResponseHelpers(response) {
  if (response.status) return;
  response.status = (code) => {
    response.statusCode = code;
    return response;
  };
  response.json = (data) => {
    if (!response.headersSent) response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(data));
  };
  response.send = (data) => {
    response.end(data);
  };
}

async function handleFrontendApiRequest(request, response) {
  addVercelResponseHelpers(response);
  const parsed = new URL(request.url || "/", appOrigin || "http://127.0.0.1");
  const query = queryObject(parsed.searchParams);
  if (parsed.pathname.startsWith("/api/anime/")) {
    query.path = "anime";
    query.animePath = parsed.pathname.replace(/^\/api\/anime\//, "");
  } else if (parsed.pathname === "/api/anilist") {
    query.path = "anilist";
  } else {
    return false;
  }

  request.query = query;
  await frontendApiHandler(request, response);
  return true;
}

async function proxyBackendRequest(request, response) {
  try {
    const targetUrl = new URL(request.url || "/", BACKEND_ORIGIN);
    const method = request.method || "GET";
    const responseHeaders = {};
    responseHeaders["access-control-allow-origin"] = appOrigin;
    responseHeaders["access-control-allow-headers"] = "Content-Type, Authorization, Range";
    responseHeaders["access-control-allow-methods"] = "GET, HEAD, POST, PUT, OPTIONS";

    if (method === "OPTIONS") {
      response.writeHead(204, responseHeaders);
      response.end();
      return;
    }

    const body = method === "GET" || method === "HEAD" ? undefined : await requestBody(request);
    const backendResponse = await fetch(targetUrl, {
      method,
      headers: proxiedRequestHeaders(request.headers),
      body,
      redirect: "manual"
    });
    ["accept-ranges", "cache-control", "content-length", "content-range", "content-type", "location"].forEach((header) => {
      const value = backendResponse.headers.get(header);
      if (value) responseHeaders[header] = header === "location" && value.startsWith(BACKEND_ORIGIN) ? value.replace(BACKEND_ORIGIN, appOrigin) : value;
    });

    const data = Buffer.from(await backendResponse.arrayBuffer());
    response.writeHead(backendResponse.status, responseHeaders);
    response.end(data);
  } catch (error) {
    response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Backend proxy failed", detail: error.message || String(error) }));
  }
}

function startLocalServer(port = LOCAL_APP_PORT) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      if ((request.url || "").startsWith("/__subtitle")) {
        handleSubtitleProxyRequest(request, response);
        return;
      }

      if ((request.url || "").startsWith("/__torrent/stream/")) {
        handleTorrentStreamRequest(request, response).catch((error) => {
          response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          response.end(JSON.stringify({ error: "Torrent stream failed", detail: error.message || String(error) }));
        });
        return;
      }

      if ((request.url || "").startsWith("/api/anime/") || (request.url || "").startsWith("/api/anilist")) {
        handleFrontendApiRequest(request, response).catch((error) => {
          response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
          response.end(JSON.stringify({ error: "Frontend API failed", detail: error.message || String(error) }));
        });
        return;
      }

      if ((request.url || "").startsWith("/api/") || (request.url || "") === "/health") {
        proxyBackendRequest(request, response);
        return;
      }

      const filePath = resolveStaticPath(request.url || "/");
      if (!filePath) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(error.code === "ENOENT" ? 404 : 500);
          response.end(error.code === "ENOENT" ? "Not found" : "Server error");
          return;
        }

        response.writeHead(200, {
          "Cache-Control": "no-store",
          "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(data);
      });
    });

    server.once("error", (error) => {
      if (port === LOCAL_APP_PORT && error.code === "EADDRINUSE") {
        startLocalServer(0).then(resolve, reject);
        return;
      }

      reject(error);
    });
    server.listen(port, "127.0.0.1", () => {
      const address = server.address();
      appOrigin = `http://127.0.0.1:${address.port}`;
      resolve(server);
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#05070d",
    title: "AniTrack Experimental",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#05070d00",
      symbolColor: "#ffffff",
      height: 36
    },
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
      webSecurity: false
    }
  });
  mainWindow = win;

  win.webContents.setUserAgent(DESKTOP_USER_AGENT);
  win.webContents.on("did-start-navigation", () => {
    win.webContents.insertCSS(ELECTRON_SAFE_AREA_CSS).catch(() => null);
  });
  win.webContents.on("did-finish-load", () => {
    win.webContents.insertCSS(ELECTRON_SAFE_AREA_CSS).catch(() => null);
  });
  win.once("ready-to-show", () => win.show());
  win.webContents.once("did-finish-load", () => win.show());
  setTimeout(() => {
    if (!win.isDestroyed()) win.show();
  }, 1200);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isLocalAppUrl(url)) {
      win.loadURL(url);
    } else {
      openExternal(url);
    }

    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (isLocalAppUrl(url)) {
      return;
    }

    event.preventDefault();
    openExternal(url);
  });

  win.loadURL(`${appOrigin}/index.html`);
}

ipcMain.handle("torrent:choose-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow || undefined, {
    title: "Choose torrent file",
    properties: ["openFile"],
    filters: [{ name: "Torrent files", extensions: ["torrent"] }]
  });
  if (result.canceled || !result.filePaths?.[0]) return null;
  return { filePath: result.filePaths[0], name: path.basename(result.filePaths[0]) };
});

ipcMain.handle("torrent:add", async (event, payload) => addTorrentSource(payload));

ipcMain.handle("torrent:status", async (event, payload = {}) => {
  const torrentId = String(payload.torrentId || "");
  const torrent = torrentSessions.get(torrentId);
  if (!torrent) return null;
  return torrentSummary(torrent);
});

ipcMain.handle("torrent:remove", async (event, payload = {}) => {
  const torrentId = String(payload.torrentId || "");
  const torrent = torrentSessions.get(torrentId);
  if (!torrent) return false;
  torrentSessions.delete(torrentId);
  torrent.destroy({ destroyStore: false });
  return true;
});

ipcMain.handle("gpu:get", async () => ({
  enabled: desktopSettings.gpuAcceleration !== false,
  restartRequired: false
}));

ipcMain.handle("gpu:set", async (event, payload = {}) => {
  const next = writeDesktopSettings({ gpuAcceleration: payload.enabled !== false });
  return { enabled: next.gpuAcceleration !== false, restartRequired: true };
});

app.whenReady().then(async () => {
  if (!singleInstanceLock) return;
  await startLocalServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("second-instance", () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async () => {
  try {
    const client = webTorrentClientPromise ? await webTorrentClientPromise : null;
    client?.destroy?.();
  } catch {
    // Quit should not be blocked by torrent cleanup failures.
  }
});
