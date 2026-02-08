import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(() => {
  const appVersion: string = packageJson.version;
  const dbVersion: number = parseInt(appVersion.replace(/\./g, ""), 10);

  console.log(`[vite.config] Building mode: ${process.env.NODE_ENV}`);
  console.log(`[vite.config] App version:   ${appVersion}`);
  console.log(`[vite.config] DB version:    ${dbVersion.toString()}`);

  return {
    // server: {
    //   open: "index.html",
    //   host: true,
    // },
    root: "src/client",
    publicDir: "static",
    build: {
      outDir: "../../dist",
    },
    resolve: {
      alias: {
        "@client": path.resolve(__dirname, "./src/client"),
        "@server": path.resolve(__dirname, "./src/server")
      },
    },
    plugins: [ react() ],

    // TODO: test
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
