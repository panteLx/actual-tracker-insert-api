import rateLimit from "express-rate-limit";
import logger from "./logger.js";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: "Zu viele Anfragen. Bitte versuche es später erneut.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.url}`);
    res.status(429).send("Zu viele Anfragen. Bitte versuche es später erneut.");
  },
});

// Specific limiter for transaction endpoints
export const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 transaction request per minute
  handler: (req, res) => {
    const trackerType = req.body.trackerType || "coffee";
    logger.warn(
      `Transaction rate limit exceeded: ${req.ip} - ${req.method} ${req.url}`
    );
    res.redirect(
      `/?tracker=${trackerType}&error=${encodeURIComponent(
        "Zu viele Transaktionen erstellt! Bitte versuche es später erneut."
      )}`
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});
