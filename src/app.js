import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/config.js";
import { actualService } from "./services/actualService.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import crypto from "crypto";

import { limiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/logger.js";
import { getLatestCommitHashMiddleware } from "./middleware/getLatestCommitHash.js";
import { csrfProtection, csrfErrorHandler } from "./middleware/csrf.js";
import { isAuthenticated } from "./middleware/authMiddleware.js";

import trackerRoutes from "./routes/trackerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import schedulesRoutes from "./routes/schedulesRoutes.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust all proxies
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.MONGODB_URI,
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: "native",
    }),
    cookie: {
      secure: "auto",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    proxy: true,
  })
);

app.use(helmet());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(express.json());
app.use(getLatestCommitHashMiddleware);
// Apply rate limiting to all requests
app.use(limiter);

// Add after your cookie middleware but before your routes
app.use(csrfProtection);
app.use(csrfErrorHandler);

// Make csrf token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  const nonce = crypto.randomBytes(16).toString("base64"); // Generate a nonce
  res.locals.nonce = nonce; // Make it available in your templates
  res.setHeader(
    "Content-Security-Policy",
    `script-src 'self' 'nonce-${nonce}'`
  );
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Auth routes (unprotected)
app.use("/", authRoutes);

// Protected routes
app.use(isAuthenticated); // Apply authentication to all routes below this
app.use("/", userRoutes);
app.use("/", trackerRoutes);
app.use("/", adminRoutes);
app.use("/", schedulesRoutes);
app.use("/", transactionsRoutes);

const startServer = async () => {
  try {
    await actualService.init();
    await actualService.initializeWithBudget(config.actual.coffeeBudgetId);
    await actualService.initializeWithBudget(config.actual.moneyBudgetId);

    app.listen(config.port, config.host, () => {
      console.log(
        `${config.NODE_ENV} - Server running at http://${config.host}:${config.port}`
      );
      console.log(`Actual API version: ${actualService.apiVersion}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await actualService.shutdown();
  process.exit();
});

startServer();
