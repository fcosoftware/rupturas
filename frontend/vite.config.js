import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

function preservarContas(outDir) {
  let backup = null;
  const arquivo = () => path.resolve(outDir, "contas.json");
  return {
    name: "preservar-contas",
    buildStart() {
      try {
        backup = fs.readFileSync(arquivo(), "utf8");
      } catch {
        backup = null;
      }
    },
    closeBundle() {
      if (backup) fs.writeFileSync(arquivo(), backup);
    },
  };
}

const outDir = process.env.GITHUB_PAGES === "true" ? path.resolve(__dirname, "../docs") : undefined;

// GitHub Pages: GITHUB_PAGES=true e VITE_ESTATICO=true
export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/rupturas/" : "/",
  build: outDir ? { outDir, emptyOutDir: true } : undefined,
  plugins: outDir ? [preservarContas(outDir)] : [],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },
});
