import { defineConfig } from "vite";

// GitHub Pages: GITHUB_PAGES=true e VITE_API_BASE=http://127.0.0.1:5000
export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/rupturas/" : "/",
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },
});
