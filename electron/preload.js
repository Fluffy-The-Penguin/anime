const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("anitrackDesktop", {
  experimental: true,
  apiBaseUrl: "https://anime-api-proxy.aryanpanwar.workers.dev",
  platform: process.platform,
  torrents: {
    add: (payload) => ipcRenderer.invoke("torrent:add", payload),
    chooseFile: () => ipcRenderer.invoke("torrent:choose-file"),
    remove: (torrentId) => ipcRenderer.invoke("torrent:remove", { torrentId }),
    status: (torrentId) => ipcRenderer.invoke("torrent:status", { torrentId })
  },
  gpu: {
    get: () => ipcRenderer.invoke("gpu:get"),
    set: (enabled) => ipcRenderer.invoke("gpu:set", { enabled })
  }
});

contextBridge.exposeInMainWorld("ANITRACK_API_BASE_URL", "https://anime-api-proxy.aryanpanwar.workers.dev");

window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.dataset.electron = "true";
});
