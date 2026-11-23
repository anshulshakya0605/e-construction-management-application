import pino from "pino";

import { env } from "./env.js";
import { LOGGER_CONFIG } from "../shared/constants/logger.constant.js";
import path from "node:path";
import fs from 'node:fs'

const isProduction = env.NODE_ENV === "production";

const logDirectory = path.resolve(env.LOG_DIR);
if (isProduction) {
    fs.mkdirSync(logDirectory, {recursive: true})
}

const logger = isProduction
    ? pino(
          {
              level: LOGGER_CONFIG.PRODUCTION_LEVEL,

              redact: {
                  paths: [...LOGGER_CONFIG.REDACT_PATHS],
                  censor: "[REDACTED]",
              },
          },
          pino.multistream([
              {
                  stream: process.stdout,
              },
              {
                  stream: pino.destination(
                      path.join(logDirectory, LOGGER_CONFIG.APP_LOG_FILE),
                  ),
              },
              {
                  level: "error",
                  stream: pino.destination(
                      path.join(logDirectory, LOGGER_CONFIG.ERROR_LOG_FILE),
                  ),
              },
          ]),
      )
    : pino({
          level: LOGGER_CONFIG.DEVELOPMENT_LEVEL,

          redact: {
              paths: [...LOGGER_CONFIG.REDACT_PATHS],
              censor: "[REDACTED]",
          },

          transport: {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "SYS:standard",
                  ignore: "pid,hostname",
              },
          },
      });

export default logger;