import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Example API for future use
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Weather API calls (if needed for security)
  fetchWeather: (lat: number, lon: number) =>
    ipcRenderer.invoke("fetch-weather", lat, lon),
});

export {};
