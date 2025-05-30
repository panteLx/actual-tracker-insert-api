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
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/actual-tracker",
  debug: persistedSettings.debug ?? process.env.DEBUG === "true",
  sessionSecret: process.env.SESSION_SECRET,
  serverIp: persistedSettings?.serverIp || process.env.SERVER_IP || "127.0.0.1",
  locale: persistedSettings.locale?.locale || process.env.LOCALE || "de-DE",
  timezone:
    persistedSettings.timezone?.timezone ||
    process.env.TIMEZONE ||
    "Europe/Berlin",
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
    pingRoleId:
      persistedSettings.discord?.pingRoleId ||
      process.env.DISCORD_PING_ROLE_ID ||
      "",
    debug:
      persistedSettings.discord?.debug ?? process.env.DISCORD_DEBUG === "true",
  },
  oidc: {
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    appUrl: process.env.OIDC_APP_URL,
    issuer: process.env.OIDC_ISSUER,
  },
  directAddSubscriptions: persistedSettings.directAddSubscriptions ?? false,
};
