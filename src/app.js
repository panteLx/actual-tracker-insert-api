import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/config.js";
import { actualService } from "./services/actualService.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import cloudflareAuth from "./middleware/cloudflareAuth.js";
import { limiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/logger.js";
import adminRoutes from "./routes/adminRoutes.js";
import logoutRoutes from "./routes/logoutRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { getLatestCommitHashMiddleware } from "./middleware/getLatestCommitHash.js";
import { csrfProtection, csrfErrorHandler } from "./middleware/csrf.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust only Cloudflare IPs
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

app.use(helmet());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cloudflareAuth);
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
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", transactionRoutes);
app.use("/", adminRoutes);
app.use("/", logoutRoutes);
app.use("/", userRoutes);

const startServer = async () => {
  try {
    await actualService.init();
    await actualService.initializeWithBudget(config.actual.coffeeBudgetId);
    await actualService.initializeWithBudget(config.actual.moneyBudgetId);

    app.listen(config.port, config.host, () => {
      console.log(
        `${config.NODE_ENV} - Server running at http://${config.host}:${config.port}`
      );
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
