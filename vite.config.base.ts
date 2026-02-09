import path from "path";

process.env.PROGRAM_ROOT = __dirname;
export const tests_result_dir = path.resolve(process.env.PROGRAM_ROOT, "./tests_result");

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
