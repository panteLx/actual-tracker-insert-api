import api from "@actual-app/api";
import { config } from "../config/config.js";

class ActualService {
  constructor() {
    this.isInitialized = false;
    this.currentBudgetId = null;
  }

  async init() {
    if (!this.isInitialized) {
      await api.init({
        dataDir: config.actual.dataDir,
        serverURL: config.actual.serverURL,
        password: config.actual.password,
      });
      this.isInitialized = true;
    }
  }

  async initializeWithBudget(budgetId) {
    try {
      // If we're already on the correct budget, no need to reinitialize
      if (this.currentBudgetId === budgetId) {
        return;
      }

      // Initialize if not already initialized
      if (!this.isInitialized) {
        await this.init();
      }

      await api.downloadBudget(budgetId);
      this.currentBudgetId = budgetId;
    } catch (error) {
      console.error("Error initializing budget:", error);
      throw error;
    }
  }

  async getPayees() {
    return api.getPayees();
  }

  async getCategories() {
    return api.getCategories();
  }

  async importTransaction(accountId, transaction) {
    return api.importTransactions(accountId, [transaction]);
  }

  async shutdown() {
    try {
      if (this.isInitialized) {
        this.currentBudgetId = null;
        this.isInitialized = false;
        await api.shutdown();
      }
    } catch (error) {
      console.error("Error during shutdown:", error);
    }
  }
}

export const actualService = new ActualService();
