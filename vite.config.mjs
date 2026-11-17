import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // Production files use a token that docker/entrypoint.sh replaces from the
  // runtime config.js. Development stays rooted at the Vite server.
  base: command === "serve" ? "/" : "https://REPLACE_PUBLIC_URL/",
  plugins: [
    react(),
    {
      name: "runtime-public-url-placeholder",
      transformIndexHtml(html, context) {
        // Docker replaces this production token after the build. During local
        // development assets are served from the Vite server root instead.
        return context.server
          ? html.replaceAll("%REPLACE_PUBLIC_URL%", "")
          : html;
      },
    },
  ],
  resolve: {
    // v1.1.0 advertises an ESM entry that is absent from its published git
    // package; its CommonJS library entry is present and is Vite-compatible.
    alias: {
      // react-bootstrap-table imports Node's EventEmitter; use its browser polyfill.
      events: "events/",
      "pcic-react-external-text": "pcic-react-external-text/lib/index.js",
    },
  },
  oxc: {
    jsx: { runtime: "classic" },
    include: /src\/.*\.js$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      loader: {
        ".js": "jsx",
      },
    },
  },
  define: {
    // shpjs (via react-leaflet-shapefile) still refers to Webpack's legacy
    // browser `global` shim. The browser-native equivalent is globalThis.
    global: "globalThis",
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION ?? "Not specified"),
  },
  build: {
    outDir: "build",
  },
  test: {
    // Match Vite's browser entry so map plugins share one Leaflet instance.
    alias: { "react-leaflet": "react-leaflet/es/index.js" },
    include: [
      "src/**/__tests__/**/*.{js,jsx}",
      "src/**/*.{test,spec}.{js,jsx}",
    ],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    css: true,
    server: {
      deps: {
        inline: [
          "leaflet",
          "react-leaflet",
          "pcic-react-components",
          "proj4",
          "proj4leaflet",
        ],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/**/__tests__*/**",
        "src/setupTests.{js,jsx}",
        // Retired MOTI components retained for reference (#218). They import
        // deleted modules and cannot be transformed for coverage.
        "src/components/MotiApp/MotiApp.jsx",
        "src/components/app-controllers/MotiAppController/MotiAppController.jsx",
        "src/components/data-controllers/MotiDataController/MotiDataController.jsx",
      ],
    },
  },
}));
