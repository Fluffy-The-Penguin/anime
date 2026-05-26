const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("anitrackDesktop", {
  experimental: true,
  apiBaseUrl: "https://anime-api-proxy.aryanpanwar.workers.dev",
  platform: process.platform
});

contextBridge.exposeInMainWorld("ANITRACK_API_BASE_URL", "https://anime-api-proxy.aryanpanwar.workers.dev");

window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.dataset.electron = "true";
});
