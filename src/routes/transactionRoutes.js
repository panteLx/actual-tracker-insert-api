import express from "express";
import { actualService } from "../services/actualService.js";
import { discordService } from "../services/discordService.js";
import { config } from "../config/config.js";
import {
  getCurrentDate,
  getFileVersion,
  validateTransaction,
  sanitizeString,
} from "../utils/helpers.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trackerType = req.query.tracker || "coffee";
    const isDebugMode = config.debug;
    const successMessage = req.query.success;
    const errorMessage = req.query.error;
    const debug = req.query.debug || null;

    // Get budget ID based on tracker type
    const budgetId =
      trackerType === "coffee"
        ? config.actual.coffeeBudgetId
        : config.actual.moneyBudgetId;

    // Get asset versions for cache busting first
    let cssVersion, jsVersion;
    try {
      [cssVersion, jsVersion] = await Promise.all([
        getFileVersion("/css/style.css"),
        getFileVersion("/js/main.js"),
      ]);
    } catch (error) {
      console.error("Error getting file versions:", error);
      cssVersion = Date.now();
      jsVersion = Date.now();
    }

    // Initialize the correct budget
    await actualService.initializeWithBudget(budgetId);

    // Get payees and categories
    const [payees, categories] = await Promise.all([
      actualService.getPayees(),
      actualService.getCategories(),
    ]);

    res.render("index", {
      trackerType,
      payees,
      categories,
      isDebugMode,
      successMessage,
      errorMessage,
      cssVersion,
      jsVersion,
      userEmail: req.userEmail,
      currentDate: getCurrentDate(),
      debug,
    });
  } catch (error) {
    console.error("Error in GET route:", error);
    res.redirect(
      "/?error=" + encodeURIComponent("Ein Fehler ist aufgetreten.")
    );
  }
});

router.post("/", async (req, res) => {
  try {
    const trackerType = req.query.tracker || "coffee";
    const {
      date,
      amount: rawAmount,
      payee,
      newPayee,
      category,
      notes,
    } = req.body;

    // Format amount properly
    const amount = parseFloat(rawAmount.replace(",", "."));

    // Determine the correct budget and account IDs
    const budgetId =
      trackerType === "coffee"
        ? config.actual.coffeeBudgetId
        : config.actual.moneyBudgetId;
    const accountId =
      trackerType === "coffee"
        ? config.actual.coffeeAccountId
        : config.actual.moneyAccountId;

    // Create transaction object
    const transaction = {
      date,
      amount: -Math.abs(amount), // Ensure negative amount for expenses
      payee_name: payee === "new" ? sanitizeString(newPayee) : payee,
      category_id: category,
      notes: sanitizeString(notes),
      imported_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Validate transaction
    const validation = validateTransaction(transaction);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Initialize budget and import transaction
    await actualService.initializeWithBudget(budgetId);
    await actualService.importTransaction(accountId, transaction);

    // Create debug message
    const debugMessage = JSON.stringify(
      {
        transaction,
        budgetId,
        accountId,
        env: process.env.NODE_ENV,
      },
      null,
      2
    );

    // Send Discord notification
    await discordService.sendTransactionNotification(
      transaction,
      trackerType,
      req.userEmail,
      debugMessage
    );

    // Redirect with success message
    const successMessage = `Transaktion über ${amount.toFixed(
      2
    )}€ wurde erfolgreich hinzugefügt.`;
    res.redirect(
      `/?tracker=${trackerType}&success=${encodeURIComponent(successMessage)}`
    );
  } catch (error) {
    console.error("Error in POST route:", error);
    const errorMessage =
      "Fehler beim Hinzufügen der Transaktion: " + error.message;
    res.redirect(
      `/?tracker=${req.query.tracker || "coffee"}&error=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
});

export default router;
