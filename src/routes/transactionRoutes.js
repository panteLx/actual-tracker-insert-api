import express from "express";
import { actualService } from "../services/actualService.js";
import { discordService } from "../services/discordService.js";
import { config } from "../config/config.js";
import { transactionLimiter } from "../middleware/rateLimiter.js";
import {
  getCurrentDate,
  validateTransaction,
  sanitizeString,
  getNavigationItems,
  getAssetVersions,
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
    const versions = await getAssetVersions([
      "/css/style.min.css",
      "/js/transactionTracker.min.js",
      "/js/global.min.js",
    ]);

    // Initialize the correct budget
    await actualService.initializeWithBudget(budgetId);

    // Get payees and categories
    const [payees, categories] = await Promise.all([
      actualService.getPayees(),
      actualService.getCategories(),
    ]);

    res.render("transactionTracker", {
      NODE_ENV: config.NODE_ENV,
      trackerType,
      payees,
      categories,
      isDebugMode,
      successMessage,
      errorMessage,
      versions,
      userEmail: req.session.userEmail,
      userGroups: req.session.userGroups,
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

    // Get categories to find the category name
    const categories = await actualService.getCategories();
    const selectedCategory = categories.find((c) => c.id === category);

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
      notes: `${sanitizeString(notes)} (${req.session.userEmail})`,
      imported_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Check if category is one of the specified ones
    const isSubscriptionCategory = [
      "monatliche einnahmen",
      "monatliche ausgaben",
      "jährliche einnahmen",
    ].includes(selectedCategory.name.toLowerCase());
    if (isSubscriptionCategory) {
      if (config.directAddSubscriptions === false) {
        // Send Discord notification instead of adding the transaction
        await discordService.sendTransactionNotification(
          { ...transaction, amount: (amountInCents / 100).toFixed(2) },
          trackerType,
          req.session.userEmail,
          "Eintrag muss manuell mit Terminplan synchronisiert werden."
        );
        return res.redirect(
          `/?tracker=${trackerType}&success=${encodeURIComponent(
            "Kein passender Terminplan gefunden! Eintrag muss manuell mit Terminplan synchronisiert werden. Sebastian wurde informiert."
          )}`
        );
      }
    }

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

    // Create debug message
    const debugMessage = JSON.stringify(
      {
        transaction: {
          ...transaction,
          amount: (amountInCents / 100).toFixed(2),
        },
        budgetId,
        accountId,
        env: config.NODE_ENV,
      },
      null,
      2
    );

    // Send Discord notification with formatted amount
    await discordService.sendTransactionNotification(
      { ...transaction, amount: (amountInCents / 100).toFixed(2) },
      trackerType,
      req.session.userEmail,
      debugMessage
    );

    // Redirect with success message
    const successMessage = `Transaktion über ${(amountInCents / 100).toFixed(
      2
    )}€ wurde erfolgreich hinzugefügt.`;
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
