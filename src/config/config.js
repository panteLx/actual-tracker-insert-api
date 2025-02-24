import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { configService } from "../services/configService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: path.resolve(__dirname, "../../", envFile) });

// Load persisted settings
let persistedSettings = {};
try {
  persistedSettings = await configService.loadSettings();
} catch (error) {
  console.error("Error loading persisted settings:", error);
}

export const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "127.0.0.1",
  appUrl: process.env.APP_URL || "http://127.0.0.1:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  locale: persistedSettings.locale?.locale || process.env.LOCALE || "de-DE",
  timezone:
    persistedSettings.timezone?.timezone ||
    process.env.TIMEZONE ||
    "Europe/Berlin",
  CF_TEAM_DOMAIN: process.env.CF_TEAM_DOMAIN,
  actual: {
    dataDir: process.env.ACTUAL_DATA_DIR,
    serverURL: process.env.ACTUAL_URL,
    password: process.env.ACTUAL_PW,
    coffeeBudgetId: process.env.COFFEE_BUDGET_ID,
    moneyBudgetId: process.env.MONEY_BUDGET_ID,
    coffeeAccountId: process.env.COFFEE_ACCOUNT_ID,
    moneyAccountId: process.env.MONEY_ACCOUNT_ID,
  },
  discord: {
    webhookUrl:
      persistedSettings.discord?.webhookUrl ||
      process.env.DISCORD_WEBHOOK_URL ||
      "",
    debug:
      persistedSettings.discord?.debug ?? process.env.DISCORD_DEBUG === "true",
  },
  debug: persistedSettings.debug ?? process.env.DEBUG === "true",
};
