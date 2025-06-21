// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  // Example API for future use
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  // Weather API calls (if needed for security)
  fetchWeather: (lat, lon) => ipcRenderer.invoke("fetch-weather", lat, lon)
});
//# sourceMappingURL=preload.mjs.map
