const { build } = require("esbuild");
const path = require("path");

// Build the main Electron process
build({
  entryPoints: ["electron/main.ts"],
  bundle: true,
  platform: "node",
  target: "node16",
  external: ["electron"],
  outdir: "dist-electron",
  sourcemap: true,
  format: "cjs",
}).catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});

// Build the preload script
build({
  entryPoints: ["electron/preload.ts"],
  bundle: true,
  platform: "node",
  target: "node16",
  external: ["electron"],
  outdir: "dist-electron",
  sourcemap: true,
  format: "cjs",
}).catch((err) => {
  console.error("Preload build failed:", err);
  process.exit(1);
});
