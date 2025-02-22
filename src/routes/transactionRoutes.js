import express from "express";
import { actualService } from "../services/actualService.js";
import { discordService } from "../services/discordService.js";
import { config } from "../config/config.js";
import { transactionLimiter } from "../middleware/rateLimiter.js";
import {
  getCurrentDate,
  getFileVersion,
  validateTransaction,
  sanitizeString,
  getNavigationItems,
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
        getFileVersion("/css/style.min.css"),
        getFileVersion("/js/transactionTracker.min.js"),
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

    res.render("transactionTracker", {
      trackerType,
      payees,
      categories,
      isDebugMode,
      successMessage,
      errorMessage,
      cssVersion,
      jsVersion,
      userEmail: req.userEmail,
      userGroups: req.userGroups,
      currentDate: getCurrentDate(),
      debug,
      navItems: getNavigationItems("tracker"),
      currentPage: trackerType,
    });
  } catch (error) {
    console.error("Error in GET route:", error);
    res.redirect(
      "/?error=" + encodeURIComponent("Ein Fehler ist aufgetreten.")
    );
  }
});

router.post("/", transactionLimiter, async (req, res) => {
  try {
    const trackerType = req.body.trackerType || "coffee";
    const {
      date,
      amount: rawAmount,
      payee_id,
      new_payee,
      category,
      notes,
    } = req.body;

    // Get budget ID and initialize
    const budgetId =
      trackerType === "coffee"
        ? config.actual.coffeeBudgetId
        : config.actual.moneyBudgetId;

    await actualService.initializeWithBudget(budgetId);

    // Get payees to find the payee name
    const payees = await actualService.getPayees();
    const selectedPayee = payees.find((p) => p.id === payee_id);

    // Format amount properly: convert to cents as integer
    const normalizedAmount = rawAmount.toString().trim().replace(",", ".");
    const amountInCents = Math.round(parseFloat(normalizedAmount) * 100);

    // Create transaction object
    const transaction = {
      date,
      amount: amountInCents,
      payee_name:
        payee_id === "new" ? sanitizeString(new_payee) : selectedPayee?.name,
      category,
      notes: `${sanitizeString(notes)} (${req.userEmail})`,
      imported_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Validate transaction
    const validation = validateTransaction(transaction);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Initialize budget and import transaction
    const accountId =
      trackerType === "coffee"
        ? config.actual.coffeeAccountId
        : config.actual.moneyAccountId;

    await actualService.importTransaction(accountId, transaction);

    // For Discord notification, convert amount back to decimal for display
    const displayAmount = (amountInCents / 100).toFixed(2);

    // Create debug message
    const debugMessage = JSON.stringify(
      {
        transaction: { ...transaction, amount: displayAmount },
        budgetId,
        accountId,
        env: config.NODE_ENV,
      },
      null,
      2
    );

    // Send Discord notification with formatted amount
    await discordService.sendTransactionNotification(
      { ...transaction, amount: displayAmount },
      trackerType,
      req.userEmail,
      debugMessage
    );

    // Redirect with success message
    const successMessage = `Transaktion über ${displayAmount}€ wurde erfolgreich hinzugefügt.`;
    if (config.debug) {
      const redirectUrl = `/?tracker=${trackerType}&success=${encodeURIComponent(
        successMessage
      )}&debug=${encodeURIComponent(debugMessage)}`;
      res.redirect(redirectUrl);
    } else {
      res.redirect(
        `/?tracker=${trackerType}&success=${encodeURIComponent(successMessage)}`
      );
    }
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
