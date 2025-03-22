import express from "express";
import { actualService } from "../services/actualService.js";
import { config } from "../config/config.js";
import { getAssetVersions, getNavigationItems } from "../utils/helpers.js";
import { formatDateTime } from "../utils/helpers.js";

const router = express.Router();

router.get("/transactions", async (req, res) => {
  const budgetId = config.actual.coffeeBudgetId;
  await actualService.initializeWithBudget(budgetId);

  // const days = Number.isNaN(parseInt(req.params.days))
  //   ? 7
  //   : parseInt(req.params.days);

  const transactions = await actualService.runQuery("transactions", ["*"], {
    // next_date: [
    //   {
    //     $gte: new Date(new Date().setDate(new Date().getDate() - days))
    //       .toISOString()
    //       .split("T")[0],
    //   }, // x days ago
    //   {
    //     $lte: new Date(new Date().setDate(new Date().getDate() + days))
    //       .toISOString()
    //       .split("T")[0],
    //   }, // x days from now
    // ],
  });

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
    currentPage: "panel",
  });
});

export default router;
