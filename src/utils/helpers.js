import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gets the current date in YYYY-MM-DD format
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => new Date().toISOString().split("T")[0];

/**
 * Gets the file version based on last modified timestamp
 * Used for cache busting in static assets
 * @param {string} filepath - Relative path to the file from public directory
 * @returns {Promise<number>} Last modified timestamp
 */
export const getFileVersion = async (filepath) => {
  try {
    const fullPath = path.join(__dirname, "../../public", filepath);
    const stats = await fs.stat(fullPath);
    return stats.mtimeMs;
  } catch (error) {
    console.error(`Error getting file version for ${filepath}:`, error);
    return Date.now(); // Fallback to current timestamp
  }
};

/**
 * Sanitizes a string for safe use
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (!str) return "";
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove < and >
    .slice(0, 500); // Limit length
};

/**
 * Validates transaction data
 * @param {Object} transaction - Transaction object to validate
 * @returns {Object} Object with isValid boolean and error message if invalid
 */
export const validateTransaction = (transaction) => {
  const { date, amount, payee_name } = transaction;

  if (!date) {
    return { isValid: false, error: "Date is required" };
  }

  if (amount === null || amount === undefined || amount === "") {
    return { isValid: false, error: "Amount is required" };
  }

  if (!payee_name || payee_name.trim().length === 0) {
    return { isValid: false, error: "Payee name is required" };
  }

  return { isValid: true };
};

/**
 * Creates a debug message for logging
 * @param {Object} data - Data to include in debug message
 * @returns {string} Formatted debug message
 */
export const createDebugMessage = (data) => {
  return JSON.stringify(data, null, 2);
};
