import { build } from "esbuild";
import path from "path";

// Build the main Electron process
build({
  entryPoints: ["electron/main.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  external: ["electron", "fsevents", "electron-is-dev", "electron-reloader"],
  outdir: "dist-electron",
  sourcemap: true,
  format: "esm",
  outExtension: { ".js": ".mjs" },
}).catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});

// Build the preload script
build({
  entryPoints: ["electron/preload.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  external: ["electron", "fsevents"],
  outdir: "dist-electron",
  sourcemap: true,
  format: "esm",
  outExtension: { ".js": ".mjs" },
}).catch((err) => {
  console.error("Preload build failed:", err);
  process.exit(1);
});
