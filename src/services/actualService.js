import api from "@actual-app/api";
import { config } from "../config/config.js";
import logger from "../middleware/logger.js";

class ActualService {
  constructor() {
    this.isInitialized = false;
    this.currentBudgetId = null;
    this.lastUsedTime = null;
    this.reconnectTimeout = null;
  }

  async init() {
    if (!this.isInitialized) {
      await api.init({
        dataDir: config.actual.dataDir,
        serverURL: config.actual.serverURL,
        password: config.actual.password,
      });
      this.isInitialized = true;
      this.lastUsedTime = Date.now();
      this._scheduleReconnectCheck();
    }
  }

  async initializeWithBudget(budgetId) {
    try {
      // If we're already on the correct budget, just update the last used time
      if (this.currentBudgetId === budgetId) {
        this.lastUsedTime = Date.now();
        return;
      }

      // Initialize if not already initialized
      if (!this.isInitialized) {
        await this.init();
      }

      logger.debug(`Switching to budget: ${budgetId}`);
      await api.downloadBudget(budgetId);
      this.currentBudgetId = budgetId;
      this.lastUsedTime = Date.now();
    } catch (error) {
      logger.error("Error initializing budget:", error);
      throw error;
    }
  }

  // Schedule a check to reconnect if connection is idle for too long
  _scheduleReconnectCheck() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      const idleTime = Date.now() - this.lastUsedTime;
      // If idle for more than 30 minutes, shutdown and reinitialize on next use
      if (idleTime > 30 * 60 * 1000) {
        logger.info("Connection idle for 30 minutes, shutting down");
        await this.shutdown();
      } else {
        this._scheduleReconnectCheck();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  async getPayees() {
    this.lastUsedTime = Date.now();
    return api.getPayees();
  }

  async getCategories() {
    this.lastUsedTime = Date.now();
    return api.getCategories();
  }

  async importTransaction(accountId, transaction) {
    this.lastUsedTime = Date.now();
    return api.importTransactions(accountId, [transaction]);
  }

  async shutdown() {
    try {
      if (this.isInitialized) {
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }

        this.currentBudgetId = null;
        this.isInitialized = false;
        await api.shutdown();
        logger.info("Actual API connection shut down");
      }
    } catch (error) {
      logger.error("Error during shutdown:", error);
    }
  }
}

export const actualService = new ActualService();
