const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");

const APP_ROOT = path.resolve(__dirname, "..");
const LOCAL_APP_PORT = 47931;
const BACKEND_ORIGIN = "https://anime-api-proxy.aryanpanwar.workers.dev";
const DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const singleInstanceLock = app.requestSingleInstanceLock();
const frontendApiHandler = require(path.join(APP_ROOT, "api", "adult", "[path].js"));
let appOrigin = "";
let mainWindow = null;

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
