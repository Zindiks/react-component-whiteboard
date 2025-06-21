// electron/main.ts
import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
if (isDev) {
  console.log("Development mode - live reload disabled");
}
var mainWindow;
var createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.mjs")
    },
    titleBarStyle: "hiddenInset",
    show: false
  });
  const startUrl = isDev ? "http://localhost:5173" : `file://${path.join(__dirname, "../dist/index.html")}`;
  mainWindow.loadURL(startUrl);
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event2, navigationUrl) => {
    event2.preventDefault();
  });
});
//# sourceMappingURL=main.mjs.map
