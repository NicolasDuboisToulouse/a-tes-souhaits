import pino from "pino";
import pretty from "pino-pretty";


const stream = pretty({
  colorize: true,
  translateTime: "mm-dd HH:MM:ss.l",
});


const logger = pino(
  { level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info" },
  stream,
);

type Args = string | number | object | null | undefined;

function stringify(value: Args): string {
  if (typeof value == "undefined") return "undefined";
  if (typeof value == "string") return value;
  if (typeof value == "number") return value.toString();
  return JSON.stringify(value);
}

function stringifyArgs(...args: Args[]): string {
  let first = true;
  let result = "";
  for (const arg of args) {
    if (first) {
      result = stringify(arg);
      first = false;
      continue;
    }
    result = result + " " + stringify(arg);
  }
  return result;
}

export function trace(...args: Args[]) {
  logger.trace(stringifyArgs(...args));
}

export function debug(...args: Args[]) {
  logger.debug(stringifyArgs(...args));
}

export function info(...args: Args[]) {
  logger.info(stringifyArgs(...args));
}

export function warn(...args: Args[]) {
  logger.warn(stringifyArgs(...args));
}

export function warning(...args: Args[]) {
  logger.warn(stringifyArgs(...args));
}

export function error(...args: Args[]) {
  logger.error(stringifyArgs(...args));
}

export function setLevel(level: string) {
  process.env.LOG_LEVEL = level;
  logger.level = process.env.LOG_LEVEL;
}

export function die(text?: string): never {
  if (text) logger.error(text);
  process.exit(1);
}
