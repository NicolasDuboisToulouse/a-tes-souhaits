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

export default logger;
