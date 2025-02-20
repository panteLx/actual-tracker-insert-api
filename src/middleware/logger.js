import winston from "winston";
import { config } from "../config/config.js";

const logger = winston.createLogger({
  level: config.debug ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Create middleware function
export const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    message: "Request received",
    method: req.method,
    url: req.url,
    ip: req.ip,
    userEmail: req.userEmail,
    userGroups: req.userGroups,
  });
  next();
};

export default logger;
