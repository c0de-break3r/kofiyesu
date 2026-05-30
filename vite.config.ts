import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import glsl from "vite-plugin-glsl";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    glsl({
      include: ["**/*.glsl", "**/*.vert", "**/*.frag"],
      defaultExtension: "glsl",
      warnDuplicatedImports: false,
    }),
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
        name: "Obed Prince Kofi Yesu — Portfolio",
        short_name: "Kofi Yesu",
        description:
          "Portfolio of Obed Prince Kofi Yesu — projects, about, and chat. Install for quick access and a smoother experience.",
        start_url: "/",
        scope: "/",
        id: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#f6672a",
        background_color: "#ffffff",
        lang: "en",
        categories: ["portfolio", "business", "productivity"],
        icons: [
          { src: "/meta/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/meta/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/meta/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,webp,woff2,svg,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".ogg", ".wav", ".glsl", ".ktx2"],
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
  assetsInclude: ["**/*.svg", "**/*.gltf", "**/*.glb", "**/*.png", "**/*.jpg", "**/*.ktx2"],
  build: {
    outDir: "./dist",
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/@clerk")) return "clerk";
          if (id.includes("node_modules/gsap")) return "gsap";
        },
      },
    },
  },
});
