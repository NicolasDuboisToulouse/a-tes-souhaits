import path from "node:path";
import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const appVersion: string = packageJson.version;
  const dbVersion: number = parseInt(appVersion.replace(/\./g, ""), 10);

  console.log(`[vite.config] Building mode: ${process.env.NODE_ENV}`);
  console.log(`[vite.config] App version:   ${appVersion}`);
  console.log(`[vite.config] DB version:    ${dbVersion.toString()}`);

  return {
    defines: {
      APP_VERSION: JSON.stringify(appVersion),
      DB_VERSION: JSON.stringify(dbVersion),
    },
    server: {
      open: "index.html",
      host: true,
    },
    root: "src/client",
    publicDir: "static",
    build: {
      outDir: "../../dist",
      minify: "esbuild",
    },
    resolve: {
      alias: { "/src/client": path.resolve(process.cwd(), "src/client") }
    },
    plugins: [ react() ],

    // test: {
    //   globals: true,
    //   environment: "jsdom",
    //   setupFiles: "./tests/vitest.setup.ts",
    //   css: true,
    //   coverage: {
    //     include: ["src/**/*.{ts,tsx}"],
    //     exclude: ["src/api/protocol/**"],
    //   },
    // },

    // TODO: TSL Certificate
    // https.ServerOptions
  };
});
