// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  plugins: [
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      // The guarded wrapper in src/lib/pwa.ts is the only registrar.
      injectRegister: null,
      filename: "sw.js",
      // Manifest is authored by hand in public/manifest.webmanifest.
      manifest: false,
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ["**/*.{js,css,woff,woff2,png,svg,webmanifest}"],
        // No HTML precache/fallback: pages are server-rendered and handled at runtime.
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Pages: always try the network first so nothing stale is shown.
            urlPattern: ({ request, url, sameOrigin }) =>
              request.mode === "navigate" &&
              !!sameOrigin &&
              !url.pathname.startsWith("/~oauth") &&
              !url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "dh-pages",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Hashed build assets and icons only.
            urlPattern: ({ request, sameOrigin }) =>
              !!sameOrigin && ["style", "script", "font", "image"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "dh-assets",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "dh-fonts" },
          },
        ],
      },
    }),
  ],
});
