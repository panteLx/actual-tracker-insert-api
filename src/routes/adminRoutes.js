import express from "express";
import fs from "fs";
import path from "path";
import { config } from "../config/config.js";
import cloudflareAuth from "../middleware/cloudflareAuth.js";
import { getFileVersion } from "../utils/helpers.js";
import { promises as fsPromises } from "fs";

const router = express.Router();

// Middleware to check if the user is in the "global-admins" group
const checkAdminGroup = (req, res, next) => {
  const userGroups = req.userGroups || [];
  if (userGroups.includes("global-admins")) {
    return next();
  }
  return res
    .status(403)
    .send("Forbidden - You do not have access to this resource.");
};

const getAssetVersions = async () => {
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
  return { cssVersion, jsVersion };
};
// Admin panel route
router.get("/admin", cloudflareAuth, checkAdminGroup, async (req, res) => {
  // Get asset versions for cache busting first
  const { cssVersion, jsVersion } = await getAssetVersions();

  res.render("adminPanel", {
    userEmail: req.userEmail,
    userGroups: req.userGroups,
    isDebugMode: config.debug,
    cssVersion,
    jsVersion,
  });
});

// Logs route
router.get("/admin/logs", cloudflareAuth, checkAdminGroup, async (req, res) => {
  const logFilePath = path.join(process.cwd(), "logs/combined.log");
  const { cssVersion, jsVersion } = await getAssetVersions();

  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading log file:", err);
      return res.status(500).send("Error reading log file.");
    }
    const logs = data
      .split("\n")
      .filter(Boolean)
      .sort((a, b) => {
        try {
          const entryA = JSON.parse(a);
          const entryB = JSON.parse(b);
          return new Date(entryB.timestamp) - new Date(entryA.timestamp);
        } catch {
          return 0;
        }
      });

    res.render("adminLogs", {
      logs,
      userEmail: req.userEmail,
      userGroups: req.userGroups,
      isDebugMode: config.debug,
      cssVersion,
      jsVersion,
    });
  });
});

// Add this route handler for clearing logs
router.post(
  "/admin/logs/clear",
  cloudflareAuth,
  checkAdminGroup,
  async (req, res) => {
    const { level } = req.body;
    const logFilePath = path.join(process.cwd(), "logs/combined.log");
    const errorLogPath = path.join(process.cwd(), "logs/error.log");

    try {
      // Read the combined log file
      const data = await fsPromises.readFile(logFilePath, "utf8");
      const logs = data.split("\n").filter(Boolean);

      // Filter logs based on level
      const filteredLogs = logs.filter((log) => {
        try {
          const entry = JSON.parse(log);
          // If level is 'all', remove everything
          if (level === "all") {
            return false;
          }
          // Keep logs that don't match the selected level
          return entry.level !== level;
        } catch {
          return true; // Keep invalid JSON entries
        }
      });

      // Write filtered logs back to combined.log
      await fsPromises.writeFile(logFilePath, filteredLogs.join("\n") + "\n");

      // If clearing error logs or all logs, clear error.log file
      if (level === "error" || level === "all") {
        await fsPromises.writeFile(errorLogPath, "");
      }

      res.status(200).json({ message: "Logs successfully cleared" });
    } catch (error) {
      console.error("Error clearing logs:", error);
      res.status(500).json({ error: "Failed to clear logs" });
    }
  }
);

router.post(
  "/admin/debug/toggle",
  cloudflareAuth,
  checkAdminGroup,
  (req, res) => {
    const currentMode = config.debug;
    config.debug = !currentMode; // Toggle the debug mode
    res
      .status(200)
      .json({ message: "Debug mode toggled", debugMode: !currentMode });
  }
);

export default router;
