import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  entry: "electron/main.ts",
  outDir: "dist-electron",
  target: "node",
  lib: {
    entry: path.resolve(__dirname, "electron/main.ts"),
    formats: ["cjs"],
    fileName: () => "main.js",
  },
  rollupOptions: {
    external: ["electron"],
  },
  build: {
    minify: false,
    sourcemap: true,
  },
});
