import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/config.js";
import { actualService } from "./services/actualService.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import cloudflareAuth from "./middleware/cloudflareAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(cloudflareAuth);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use("/", transactionRoutes);

const startServer = async () => {
  try {
    await actualService.init();
    await actualService.initializeWithBudget(config.actual.coffeeBudgetId);
    await actualService.initializeWithBudget(config.actual.moneyBudgetId);

    app.listen(config.port, config.host, () => {
      console.log(
        `${process.env.NODE_ENV} - Server running at http://${config.host}:${config.port}`
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
