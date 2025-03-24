import express from "express";
import { actualService } from "../services/actualService.js";
import { config } from "../config/config.js";
import { getAssetVersions, getNavigationItems } from "../utils/helpers.js";
import { formatDateTime } from "../utils/helpers.js";

const router = express.Router();

router.get("/transactions", async (req, res) => {
  // Get tracker type from query parameter, default to coffee
  const trackerType = req.query.tracker || "coffee";

  // Get budget ID based on tracker type
  const budgetId =
    trackerType === "coffee"
      ? config.actual.coffeeBudgetId
      : config.actual.moneyBudgetId;

  await actualService.initializeWithBudget(budgetId);

  const transactions = await actualService.runQuery(
    "transactions",
    ["date", "amount", "payee", "category", "notes"],
    {}
  );

  const payees = await actualService.getPayees();
  const categories = await actualService.getCategories();

  const versions = await getAssetVersions([
    "/css/style.min.css",
    "/js/transactionsPanel.min.js",
    "/js/global.min.js",
  ]);
  const successMessage = req.query.success;
  const errorMessage = req.query.error;
  const debug = req.query.debug || null;
  res.render("transactionsPanel", {
    transactions: transactions.data,
    payees,
    categories,
    formatDateTime: formatDateTime,
    userEmail: req.session.userEmail,
    userGroups: req.session.userGroups,
    isDebugMode: config.debug,
    NODE_ENV: config.NODE_ENV,
    versions,
    successMessage,
    errorMessage,
    debug,
    navItems: getNavigationItems("transactions"),
    currentPage: trackerType,
    trackerType,
  });
});

export default router;
