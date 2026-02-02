import pino from "pino";
import pretty from "pino-pretty";

const stream = pretty({
  colorize: true,
  translateTime: "mm-dd HH:MM:ss.l",
  destination: process.stdout
});

const logger = pino({ level: "trace" }, stream);

if (process.env.LOG_LEVEL) {
  logger.level = process.env.LOG_LEVEL;
}

export default logger;
