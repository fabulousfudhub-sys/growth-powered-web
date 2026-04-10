import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "frontend"),
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: ["logo.png", "placeholder.svg"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        id: "/",
        name: "ATAPOLY CBT",
        short_name: "ATAPOLY CBT",
        description: "ATAPOLY Computer Based Test Portal",
        theme_color: "#1e3a5f",
        background_color: "#f5f7fa",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/logo-192.png", sizes: "192x192", type: "image/png" },
          { src: "/logo-512.png", sizes: "512x512", type: "image/png" },
          { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        screenshots: [
          { src: "/screenshot.png", sizes: "1280x720", type: "image/png", form_factor: "wide" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend/src"),
    },
  },
}));
