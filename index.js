import express from "express";
import api from "@actual-app/api";
import fetch from "node-fetch";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import getCloudflareUser from "./middleware/cloudflareAuth.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

// Load environment variables from the specific .env file
dotenv.config({ path: path.resolve(__dirname, envFile) });

const app = express();

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Security middleware
app.use(helmet());

// Middleware to get the user email from Cloudflare headers
app.use(getCloudflareUser);

// Express's own parser middleware
app.use(express.urlencoded({ extended: true }));

// Configure EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Helper function: current date in YYYY-MM-DD format
const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Helper function: Determine the last modification time of the file and format it as a version
function getFileVersion(filePath) {
  try {
    const stats = fs.statSync(filePath);
    // Formatierung: JahrMonatTag-StundenMinutenSekunden (z.B. v20250214-153045)
    const mtime = new Date(stats.mtime);
    const version =
      "v" +
      mtime.getFullYear() +
      ("0" + (mtime.getMonth() + 1)).slice(-2) +
      ("0" + mtime.getDate()).slice(-2) +
      "-" +
      ("0" + mtime.getHours()).slice(-2) +
      ("0" + mtime.getMinutes()).slice(-2) +
      ("0" + mtime.getSeconds()).slice(-2);
    return version;
  } catch (err) {
    return "v1.0";
  }
}

const jsPath = path.join(__dirname, "public/js/main.js");
const cssPath = path.join(__dirname, "public/css/style.css");
const jsVersion = getFileVersion(jsPath);
const cssVersion = getFileVersion(cssPath);
const isDebugMode = process.env.DEBUG === "true";
const isDiscordDebugMode = process.env.DISCORD_DEBUG === "true";

// Helper function to initialize API with a specific budget
async function initializeApiWithBudget(budgetId) {
  await api.shutdown(); // Ensure any existing connection is closed
  await api.init({
    dataDir: process.env.ACTUAL_DATA_DIR,
    serverURL: process.env.ACTUAL_URL,
    password: process.env.ACTUAL_PW,
  });
  await api.downloadBudget(budgetId);
}
// Initialize the Actual API and start the server
(async () => {
  try {
    await api.init({
      dataDir: process.env.ACTUAL_DATA_DIR,
      serverURL: process.env.ACTUAL_URL,
      password: process.env.ACTUAL_PW,
    });
    // We'll download both budgets at startup
    await api.downloadBudget(process.env.COFFEE_BUDGET_ID);
    await api.downloadBudget(process.env.MONEY_BUDGET_ID);
    app.listen(
      process.env.PORT || 3000,
      process.env.HOST || "127.0.0.1",
      () => {
        console.log(
          process.env.NODE_ENV +
            " - Server running at http://" +
            process.env.HOST +
            ":" +
            process.env.PORT
        );
      }
    );
  } catch (error) {
    console.error("Error initializing the Actual API:", error);
    process.exit(1);
  }
})();

// GET route: Form display with improved UX and asset versioning
app.get("/", async (req, res) => {
  try {
    const trackerType = req.query.tracker || "coffee"; // Default to coffee tracker
    const budgetId =
      trackerType === "coffee"
        ? process.env.COFFEE_BUDGET_ID
        : process.env.MONEY_BUDGET_ID;

    await initializeApiWithBudget(budgetId);

    const payees = await api.getPayees();
    const categories = await api.getCategories();

    res.render("index", {
      currentDate: getCurrentDate(),
      payees,
      categories,
      success: req.query.success,
      debug: req.query.debug,
      isDebugMode: isDebugMode,
      jsVersion,
      cssVersion,
      trackerType,
      userEmail: req.userEmail,
      successMessage: req.query.success
        ? "Transaktion erfolgreich hinzugefügt!"
        : null,
      errorMessage: req.query.error
        ? "An error occurred while processing your request."
        : null,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).render("index", {
      errorMessage: "Error fetching data: " + error.message,
      isDebugMode: isDebugMode,
      jsVersion,
      cssVersion,
      trackerType: req.query.tracker || "coffee",
    });
  }
});

// POST route: Transaction processing, API import, and Discord notification
app.post("/", async (req, res) => {
  try {
    const { date, amount, category, notes, payee_id, new_payee, trackerType } =
      req.body;
    let payeeName = "";

    const budgetId =
      trackerType === "coffee"
        ? process.env.COFFEE_BUDGET_ID
        : process.env.MONEY_BUDGET_ID;

    await initializeApiWithBudget(budgetId);

    if (payee_id === "new" && new_payee && new_payee.trim()) {
      payeeName = new_payee.trim();
    } else {
      const payees = await api.getPayees();
      const selected = payees.find((p) => p.id === payee_id);
      payeeName = selected ? selected.name : "Unknown";
    }

    const euroBetrag = parseFloat(amount);
    const centBetrag = Math.round(euroBetrag * 100);

    const transaction = [
      {
        date,
        amount: centBetrag,
        category,
        notes: `${notes}${req.userEmail ? ` (by ${req.userEmail})` : ""}`,
        payee_name: payeeName,
        imported_id: Math.random().toString(36).slice(2, 7),
        cleared: true,
      },
    ];

    const accountId =
      trackerType === "coffee"
        ? process.env.COFFEE_ACCOUNT_ID
        : process.env.MONEY_ACCOUNT_ID;
    const result = await api.importTransactions(accountId, transaction);
    console.log("Import result:", result);
    const debugMessage = JSON.stringify(result);
    const debugDiscordMsg = isDiscordDebugMode
      ? debugMessage
      : "DEBUG DISABLED";
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      const embed = {
        title: `New ${
          trackerType.charAt(0).toUpperCase() + trackerType.slice(1)
        } Transaction Added`,
        color: 0x00ff00, // Green
        fields: [
          { name: "Date", value: date, inline: true },
          { name: "Amount", value: `€${euroBetrag.toFixed(2)}`, inline: true },
          { name: "Category", value: category, inline: true },
          { name: "Payee", value: payeeName, inline: true },
          { name: "Notes", value: notes || "None", inline: false },
          { name: "Debug", value: debugDiscordMsg, inline: false },
        ],
        timestamp: new Date(),
        footer: {
          text: `${
            trackerType.charAt(0).toUpperCase() + trackerType.slice(1)
          } Tracker - ${process.env.NODE_ENV}`,
        },
      };

      await fetch(discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });
    }

    const successRedirectUrl = isDebugMode
      ? `/?success=1&debug=${encodeURIComponent(
          debugMessage
        )}&tracker=${trackerType}`
      : `/?success=1&tracker=${trackerType}`;

    res.redirect(successRedirectUrl);
  } catch (error) {
    console.error("Error importing the transaction:", error);
    res.redirect(`/?error=1&tracker=${req.body.trackerType}`);
  }
});

// Clean shutdown on SIGINT (e.g., Ctrl+C)
process.on("SIGINT", async () => {
  await api.shutdown();
  process.exit();
});
