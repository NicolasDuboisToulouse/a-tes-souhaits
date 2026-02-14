import path from "path";
import { AppConfig, setupEnv } from "./scripts/setup-app";

setupEnv(new AppConfig("test"));
if (typeof process.env.PROGRAM_ROOT !== "string") {
  console.error("env PROGRAM_ROOT is not defined!");
  process.exit(1);
}

export const userConfig = {
  resolve: {
    alias: {
      "@client": path.resolve(process.env.PROGRAM_ROOT, "./src/client"),
      "@server": path.resolve(process.env.PROGRAM_ROOT, "./src/server"),
      "@scripts": path.resolve(process.env.PROGRAM_ROOT, "./scripts"),
      "@tests": path.resolve(process.env.PROGRAM_ROOT, "./tests"),
    },
  },
};
