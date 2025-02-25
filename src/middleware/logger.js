import winston from "winston";
import { config } from "../config/config.js";

// Custom log format with colors for console
const consoleFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    const metaStr = Object.keys(metadata).length
      ? `\n${JSON.stringify(metadata, null, 2)}`
      : "";

    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
  }
);

// Create the logger
const logger = winston.createLogger({
  level: config.debug ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "actual-tracker" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// Add console transport in non-production environments
if (config.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        consoleFormat
      ),
    })
  );
}

// Create middleware function for HTTP request logging
export const requestLogger = (req, res, next) => {
  // Start timer
  const start = Date.now();

  // Log when the request completes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    if (req.ip !== config.host) {
      logger[logLevel](
        `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
        {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: duration,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          userEmail: req.session?.userEmail,
          referrer: req.get("Referrer"),
        }
      );
    }
  });

  next();
};

// Function logging decorator
export const logFunction = (target, name, descriptor) => {
  const original = descriptor.value;

  descriptor.value = async function (...args) {
    const className = this.constructor.name;
    const functionName = name;
    const start = Date.now();

    logger.debug(`${className}.${functionName} called`, {
      class: className,
      function: functionName,
      arguments: config.debug
        ? JSON.stringify(args)
        : "hidden in non-debug mode",
    });

    try {
      const result = await original.apply(this, args);
      const duration = Date.now() - start;

      logger.debug(`${className}.${functionName} completed in ${duration}ms`, {
        class: className,
        function: functionName,
        duration: duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      logger.error(
        `${className}.${functionName} failed after ${duration}ms: ${error.message}`,
        {
          class: className,
          function: functionName,
          duration: duration,
          error: error.message,
          stack: error.stack,
          success: false,
        }
      );

      throw error;
    }
  };

  return descriptor;
};

// Simple function for logging function calls without decorators
export const logFunctionCall = (functionName, args = {}, startTime = null) => {
  if (startTime === null) {
    // Starting the function
    logger.debug(`Function ${functionName} called`, {
      function: functionName,
      arguments: config.debug ? args : "hidden in non-debug mode",
    });
    return Date.now();
  } else {
    // Ending the function
    const duration = Date.now() - startTime;
    logger.debug(`Function ${functionName} completed in ${duration}ms`, {
      function: functionName,
      duration: duration,
      success: true,
    });
  }
};

// Log function errors
export const logFunctionError = (functionName, error, startTime) => {
  const duration = startTime ? Date.now() - startTime : null;
  logger.error(
    `Function ${functionName} failed${
      duration ? ` after ${duration}ms` : ""
    }: ${error.message}`,
    {
      function: functionName,
      duration: duration,
      error: error.message,
      stack: error.stack,
      success: false,
    }
  );
};

export default logger;
