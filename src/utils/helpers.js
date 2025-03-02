import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { config } from "../config/config.js";

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

export const getLatestCommitHash = () => {
  return new Promise((resolve, reject) => {
    exec("git rev-parse HEAD", (error, stdout) => {
      if (error) {
        return reject(error);
      }
      const fullHash = stdout.trim();
      const shortHash = fullHash.substring(0, 7); // Get the first 7 characters
      resolve({ fullHash, shortHash });
    });
  });
};

export const getNavigationItems = (currentPage) => {
  const trackerItems = [
    { id: "coffee", url: "/?tracker=coffee", label: "Kaffee" },
    { id: "money", url: "/?tracker=money", label: "Geld" },
  ];

  const adminItems = [
    { id: "panel", url: "/admin", label: "Dashboard" },
    { id: "logs", url: "/admin/logs", label: "Logs" },
  ];

  const userItems = [{ id: "panel", url: "/user", label: "User" }];

  const schedulesItems = [
    { id: "panel", url: "/schedules", label: "Schedules" },
  ];

  // Return different navigation items based on the current page
  switch (currentPage) {
    case "tracker":
      return {
        items: trackerItems,
        currentSection: "tracker",
      };
    case "admin":
    case "logs":
      return {
        items: adminItems,
        currentSection: "admin",
      };
    case "user":
      return {
        items: userItems,
        currentSection: "user",
      };
    case "schedules":
      return {
        items: schedulesItems,
        currentSection: "schedules",
      };
    default:
      return {
        items: trackerItems,
        currentSection: "tracker",
      };
  }
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString(config.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: config.timezone,
  });
};

/**
 * Gets asset versions for cache busting
 * @param {Array<string>} files - Array of file paths relative to public directory
 * @returns {Promise<Object>} Object with file versions
 */
export const getAssetVersions = async (files) => {
  try {
    const versionPromises = files.map((file) => getFileVersion(file));
    const versions = await Promise.all(versionPromises);

    // Create an object with file names as keys and versions as values
    return files.reduce((acc, file, index) => {
      const key = file.split("/").pop().split(".")[0] + "Version";
      acc[key] = versions[index];
      return acc;
    }, {});
  } catch (error) {
    console.error("Error getting file versions:", error);
    // Fallback to current timestamp
    return files.reduce((acc, file) => {
      const key = file.split("/").pop().split(".")[0] + "Version";
      acc[key] = Date.now();
      return acc;
    }, {});
  }
};
