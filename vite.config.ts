import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as configBase from "./vite.config.base";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    ...configBase.userConfig,
    root: "src/client",
    publicDir: "static",
    plugins: [ react() ],
  };
});
