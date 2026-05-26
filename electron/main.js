const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");

const APP_ROOT = path.resolve(__dirname, "..");
const LOCAL_APP_PORT = 47931;
const DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const singleInstanceLock = app.requestSingleInstanceLock();
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

function startLocalServer(port = LOCAL_APP_PORT) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
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
    show: false,
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
  mainWindow.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
