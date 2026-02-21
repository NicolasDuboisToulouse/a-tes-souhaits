export * from "fs";
import fs from "fs";
import path from "path";

//
// lookup for a program in PATH
//
export function pathLookup(seachedFile: string): string | undefined {
  const sys_path = process.env.path || process.env.PATH || "";
  for (const dir of sys_path.split(path.delimiter)) {
    const file = path.join(dir, seachedFile);
    try {
      fs.accessSync(file, fs.constants.F_OK | fs.constants.X_OK);
      return file;
    } catch(_) {
      // process next dir
    }
  }
  return undefined;
}


//
// Return true if frist file is newer (strictly)
//
export function isFirstNewer(firstFile: string, secondFile: string): boolean {
  if (!fs.existsSync(secondFile)) return true;
  const { mtime: firstMtime } = fs.statSync(firstFile);
  const { mtime: secondMtime } = fs.statSync(secondFile);
  return firstMtime > secondMtime;
}
