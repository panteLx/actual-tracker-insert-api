import rateLimit from "express-rate-limit";
import logger from "./logger.js";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // Limit each IP to 100 requests per minute
  message: "Zu viele Anfragen. Bitte versuche es später erneut.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`${req.method} ${req.url}`, {
      message: "Rate limit exceeded",
      method: req.method,
      url: req.url,
      ip: req.ip,
      userEmail: req.userEmail,
      userGroups: req.userGroups,
    });
    res.status(429).send("Zu viele Anfragen. Bitte versuche es später erneut.");
  },
});

// Specific limiter for transaction endpoints
export const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 3 : 1000, // Limit each IP to 3 transaction request per minute
  handler: (req, res) => {
    const trackerType = req.body.trackerType || "coffee";
    logger.warn(`${req.method} ${req.url}`, {
      message: "Transaction rate limit exceeded",
      method: req.method,
      url: req.url,
      ip: req.ip,
      userEmail: req.userEmail,
      userGroups: req.userGroups,
    });
    res.redirect(
      `/?tracker=${trackerType}&error=${encodeURIComponent(
        "Zu viele Transaktionen erstellt! Bitte versuche es später erneut."
      )}`
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});
