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

// Argument supported by logger functions
type ArgType = string | number | object | null | undefined;

// Options that can be applied to an argument
interface Options { quoted?: boolean; noSpace?: boolean }
class OptionsArg {
  readonly arg: ArgType;
  readonly options: Options;
  constructor(arg: ArgType, options: Options) {
    this.arg = arg;
    this.options = options;
  }
}

export function quote(arg: ArgType | OptionsArg) {
  if (arg instanceof OptionsArg) {
    return new OptionsArg(arg.arg, { ...arg.options, quoted: true });
  } else {
    return new OptionsArg(arg, { quoted: true });
  }
}

export function noSpace(arg: ArgType | OptionsArg) {
  if (arg instanceof OptionsArg) {
    return new OptionsArg(arg.arg, { ...arg.options, noSpace: true });
  } else {
    return new OptionsArg(arg, { noSpace: true });
  }
}


// Convert arguments to string
function stringify(value: ArgType): string {
  if (typeof value == "undefined") return "undefined";
  if (typeof value == "string") return value;
  if (typeof value == "number") return value.toString();
  return JSON.stringify(value);
}

function stringifyArgs(...args: ArgType[]): string {
  let prepend = "";
  let append = "";
  let result = "";
  for (let arg of args) {
    if (arg instanceof OptionsArg) {
      if (arg.options.noSpace) {
        prepend = "";
      }
      if (arg.options.quoted) {
        prepend += "'";
        append = "'" + append;
      }
      arg = arg.arg;
    }
    result += prepend + stringify(arg) + append;
    prepend = " ";
    append = "";
  }
  return result;
}

// Logger methods
export function trace(...args: ArgType[]) {
  logger.trace(stringifyArgs(...args));
}

export function debug(...args: ArgType[]) {
  logger.debug(stringifyArgs(...args));
}

export function info(...args: ArgType[]) {
  logger.info(stringifyArgs(...args));
}

export function warn(...args: ArgType[]) {
  logger.warn(stringifyArgs(...args));
}

export function warning(...args: ArgType[]) {
  logger.warn(stringifyArgs(...args));
}

export function error(...args: ArgType[]) {
  logger.error(stringifyArgs(...args));
}

export function setLevel(level: string) {
  process.env.LOG_LEVEL = level;
  logger.level = process.env.LOG_LEVEL;
}

export function die(...args: ArgType[]): never {
  error(...args);
  process.exit(1);
}
