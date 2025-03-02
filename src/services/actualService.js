import api from "@actual-app/api";
import { config } from "../config/config.js";
import logger, {
  logFunctionCall,
  logFunctionError,
} from "../middleware/logger.js";

class ActualService {
  constructor() {
    this.isInitialized = false;
    this.currentBudgetId = null;
    this.lastUsedTime = null;
    this.reconnectTimeout = null;
    logger.debug("ActualService instance created");
  }

  async init() {
    const startTime = logFunctionCall("ActualService.init");
    try {
      if (!this.isInitialized) {
        logger.debug("Initializing Actual API connection", {
          serverURL: config.actual.serverURL,
          dataDir: config.actual.dataDir,
        });

        await api.init({
          dataDir: config.actual.dataDir,
          serverURL: config.actual.serverURL,
          password: config.actual.password,
        });

        this.isInitialized = true;
        this.lastUsedTime = Date.now();
        this._scheduleReconnectCheck();

        logger.debug("Actual API connection initialized successfully");
      } else {
        logger.debug("Actual API already initialized, skipping initialization");
      }
      logFunctionCall("ActualService.init", {}, startTime);
      return true;
    } catch (error) {
      logFunctionError("ActualService.init", error, startTime);
      throw error;
    }
  }

  async initializeWithBudget(budgetId) {
    const startTime = logFunctionCall("ActualService.initializeWithBudget", {
      budgetId,
    });
    try {
      // If we're already on the correct budget, just update the last used time
      if (this.currentBudgetId === budgetId) {
        logger.debug(
          `Already using budget: ${budgetId}, updating last used time`
        );
        this.lastUsedTime = Date.now();
        logFunctionCall(
          "ActualService.initializeWithBudget",
          { budgetId, reused: true },
          startTime
        );
        return;
      }

      // Initialize if not already initialized
      if (!this.isInitialized) {
        logger.debug("API not initialized, initializing first");
        await this.init();
      }

      logger.debug(`Switching to budget: ${budgetId}`, {
        previousBudget: this.currentBudgetId,
        newBudget: budgetId,
      });

      await api.downloadBudget(budgetId);
      this.currentBudgetId = budgetId;
      this.lastUsedTime = Date.now();

      logger.debug(`Successfully switched to budget: ${budgetId}`);
      logFunctionCall(
        "ActualService.initializeWithBudget",
        { budgetId, success: true },
        startTime
      );
    } catch (error) {
      logger.error(`Error initializing budget: ${budgetId}`, {
        error: error.message,
        stack: error.stack,
      });
      logFunctionError("ActualService.initializeWithBudget", error, startTime);
      throw error;
    }
  }

  // Schedule a check to reconnect if connection is idle for too long
  _scheduleReconnectCheck() {
    const functionName = "ActualService._scheduleReconnectCheck";
    logFunctionCall(functionName);

    if (this.reconnectTimeout) {
      logger.debug("Clearing existing reconnect timeout");
      clearTimeout(this.reconnectTimeout);
    }

    logger.debug("Setting new reconnect check timeout (5 minutes)");
    this.reconnectTimeout = setTimeout(async () => {
      const idleTime = Date.now() - this.lastUsedTime;
      const idleMinutes = Math.floor(idleTime / (60 * 1000));

      logger.debug(`Checking connection idle time: ${idleMinutes} minutes`);

      // If idle for more than 30 minutes, shutdown and reinitialize on next use
      if (idleTime > 30 * 60 * 1000) {
        logger.debug(
          `Connection idle for ${idleMinutes} minutes, shutting down`
        );
        await this.shutdown();
      } else {
        logger.debug(
          `Connection still active (idle for ${idleMinutes} minutes), scheduling next check`
        );
        this._scheduleReconnectCheck();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    logFunctionCall(functionName, { scheduled: true }, Date.now());
  }

  async getPayees() {
    const startTime = logFunctionCall("ActualService.getPayees");
    try {
      this.lastUsedTime = Date.now();
      logger.debug("Fetching payees from Actual API");

      const payees = await api.getPayees();

      logger.debug(`Retrieved ${payees.length} payees from Actual API`);
      logFunctionCall(
        "ActualService.getPayees",
        { count: payees.length },
        startTime
      );

      return payees;
    } catch (error) {
      logFunctionError("ActualService.getPayees", error, startTime);
      throw error;
    }
  }

  async getCategories() {
    const startTime = logFunctionCall("ActualService.getCategories");
    try {
      this.lastUsedTime = Date.now();
      logger.debug("Fetching categories from Actual API");

      const categories = await api.getCategories();

      logger.debug(`Retrieved ${categories.length} categories from Actual API`);
      logFunctionCall(
        "ActualService.getCategories",
        { count: categories.length },
        startTime
      );

      return categories;
    } catch (error) {
      logFunctionError("ActualService.getCategories", error, startTime);
      throw error;
    }
  }

  async importTransaction(accountId, transaction) {
    const startTime = logFunctionCall("ActualService.importTransaction", {
      accountId,
      transaction: config.debug ? transaction : "hidden in non-debug mode",
    });

    try {
      this.lastUsedTime = Date.now();

      logger.debug(`Importing transaction to account ${accountId}`, {
        date: transaction.date,
        amount: transaction.amount / 100, // Convert cents to currency units for logging
        payee: transaction.payee_name,
        notes: transaction.notes,
      });

      const result = await api.importTransactions(accountId, [transaction]);

      logger.debug(`Successfully imported transaction to account ${accountId}`);
      logFunctionCall(
        "ActualService.importTransaction",
        { success: true },
        startTime
      );

      return result;
    } catch (error) {
      logger.error(`Failed to import transaction to account ${accountId}`, {
        error: error.message,
        transaction: config.debug ? transaction : "hidden in non-debug mode",
      });

      logFunctionError("ActualService.importTransaction", error, startTime);
      throw error;
    }
  }

  async getTransactions(accountId, startDate, endDate) {
    const startTime = logFunctionCall("ActualService.getTransactions", {
      accountId,
      startDate,
      endDate,
    });
    try {
      this.lastUsedTime = Date.now();
      logger.debug("Fetching transactions from Actual API");

      const transactions = await api.getTransactions(
        accountId,
        startDate,
        endDate
      );

      logger.debug(
        `Retrieved ${transactions.length} transactions from Actual API`
      );
      logFunctionCall(
        "ActualService.getTransactions",
        { count: transactions.length },
        startTime
      );

      return transactions;
    } catch (error) {
      logFunctionError("ActualService.getTransactions", error, startTime);
      throw error;
    }
  }

  async shutdown() {
    const startTime = logFunctionCall("ActualService.shutdown");
    try {
      if (this.isInitialized) {
        logger.debug("Shutting down Actual API connection");

        if (this.reconnectTimeout) {
          logger.debug("Clearing reconnect timeout");
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }

        this.currentBudgetId = null;
        this.isInitialized = false;

        await api.shutdown();

        logger.debug("Actual API connection shut down successfully");
        logFunctionCall("ActualService.shutdown", { success: true }, startTime);
      } else {
        logger.debug("Actual API not initialized, no need to shut down");
        logFunctionCall("ActualService.shutdown", { skipped: true }, startTime);
      }
    } catch (error) {
      logger.error("Error during Actual API shutdown", {
        error: error.message,
        stack: error.stack,
      });

      logFunctionError("ActualService.shutdown", error, startTime);
      throw error;
    }
  }
}

export const actualService = new ActualService();
