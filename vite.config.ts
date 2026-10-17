import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN?.trim();

  return {
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "meta/favicon-16x16.png",
        "meta/favicon-32x32.png",
        "meta/apple-touch-icon.png",
        "meta/icon-192.png",
        "meta/icon-512.png",
      ],
      manifest: {
        name: "Kofi Yesu Portfolio",
        short_name: "Kofi Yesu",
        description:
          "Portfolio of Obed Prince Kofi Yesu — software projects, experience, and contact. Install for quick access.",
        start_url: "/",
        scope: "/",
        id: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#ea5a1e",
        background_color: "#faf9f7",
        lang: "en",
        categories: ["portfolio"],
        icons: [
          { src: "/meta/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/meta/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/meta/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{ico,png,webp,svg,woff2,webmanifest}"],
        globIgnores: ["**/assets/**"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\/assets\/.*\.(?:js|css)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "bundled-assets",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    ...(sentryAuthToken
      ? [
          sentryVitePlugin({
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            authToken: sentryAuthToken,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
  assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.webp"],
  build: {
    outDir: "./dist",
    sourcemap: sentryAuthToken ? "hidden" : false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
  };
});
