import express from "express";
import fs from "fs";
import path from "path";
import { config } from "../config/config.js";
import {
  getNavigationItems,
  formatDateTime,
  getAssetVersions,
} from "../utils/helpers.js";
import { promises as fsPromises } from "fs";
import { configService } from "../services/configService.js";
import { actualService } from "../services/actualService.js";
const router = express.Router();

// Middleware to check if the user is in the "global-admins" group
const checkAdminGroup = (req, res, next) => {
  const userGroups = req.session.userGroups || [];
  if (userGroups.includes("global-admins")) {
    return next();
  }
  return res
    .status(403)
    .send("Forbidden - You do not have access to this resource.");
};

// Admin panel route
router.get("/admin", checkAdminGroup, async (req, res) => {
  // Get asset versions for cache busting first
  const versions = await getAssetVersions([
    "/css/style.min.css",
    "/js/adminPanel.min.js",
    "/js/global.min.js",
  ]);
  const successMessage = req.query.success;
  const errorMessage = req.query.error;
  const debug = req.query.debug || null;
  res.render("adminPanel", {
    userEmail: req.session.userEmail,
    userGroups: req.session.userGroups,
    directAddSubscriptions: config.directAddSubscriptions,
    isDebugMode: config.debug,
    NODE_ENV: config.NODE_ENV,
    actualApiVersion: actualService.apiVersion,
    isDiscordDebug: config.discord.debug,
    discordWebhookUrl: config.discord.webhookUrl,
    discordPingRoleId: config.discord.pingRoleId,
    locale: config.locale,
    timezone: config.timezone,
    serverIp: config.serverIp,
    versions,
    successMessage,
    errorMessage,
    debug,
    navItems: getNavigationItems("admin"),
    currentPage: "panel",
  });
});

// Logs route
router.get("/admin/logs", checkAdminGroup, async (req, res) => {
  const logFilePath = path.join(process.cwd(), "logs/combined.log");
  const versions = await getAssetVersions([
    "/css/style.min.css",
    "/js/adminLogs.min.js",
    "/js/global.min.js",
  ]);
  const successMessage = req.query.success;
  const errorMessage = req.query.error;
  const debug = req.query.debug || null;
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
      userEmail: req.session.userEmail,
      userGroups: req.session.userGroups,
      NODE_ENV: config.NODE_ENV,
      isDebugMode: config.debug,
      versions,
      successMessage,
      errorMessage,
      debug,
      navItems: getNavigationItems("admin"),
      currentPage: "logs",
      formatDateTime,
    });
  });
});

// Add this route handler for clearing logs
router.post("/api/admin/logs/clear", checkAdminGroup, async (req, res) => {
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
});

router.post("/api/admin/debug/toggle", checkAdminGroup, async (req, res) => {
  const currentMode = config.debug;
  config.debug = !currentMode;
  await configService.updateSetting("debug", !currentMode);
  res
    .status(200)
    .json({ message: "Debug mode toggled", debugMode: !currentMode });
});

router.post(
  "/api/admin/debug/discord/toggle",
  checkAdminGroup,
  async (req, res) => {
    const currentDiscordDebug = config.discord.debug;
    config.discord.debug = !currentDiscordDebug;
    await configService.updateSetting("discord.debug", !currentDiscordDebug);
    res.status(200).json({
      message: "Discord debug mode toggled",
      discordDebugMode: !currentDiscordDebug,
    });
  }
);

router.post(
  "/api/admin/direct-add-subscriptions/toggle",
  checkAdminGroup,
  async (req, res) => {
    const currentMode = config.directAddSubscriptions;
    config.directAddSubscriptions = !currentMode;
    await configService.updateSetting("directAddSubscriptions", !currentMode);
    res.status(200).json({
      message: "Direktes Hinzufügen von Abos toggled",
      directAddSubscriptions: !currentMode,
    });
  }
);

router.post("/api/admin/discord/webhook", checkAdminGroup, async (req, res) => {
  const { webhookUrl } = req.body;
  if (webhookUrl) {
    config.discord.webhookUrl = webhookUrl;
    await configService.updateSetting("discord.webhookUrl", webhookUrl);
    res
      .status(200)
      .json({ message: "Discord webhook URL updated successfully." });
  } else {
    res.status(400).json({ message: "Invalid webhook URL." });
  }
});

router.post(
  "/api/admin/discord/pingRoleId",
  checkAdminGroup,
  async (req, res) => {
    const { pingRoleId } = req.body;
    if (pingRoleId) {
      config.discord.pingRoleId = pingRoleId;
      await configService.updateSetting("discord.pingRoleId", pingRoleId);
      res
        .status(200)
        .json({ message: "Discord ping role ID updated successfully." });
    } else {
      res.status(400).json({ message: "Invalid ping role ID." });
    }
  }
);

router.post("/api/admin/locale", checkAdminGroup, async (req, res) => {
  const { locale } = req.body;
  if (locale) {
    config.locale = locale;
    await configService.updateSetting("locale", locale);
    res.status(200).json({ message: "Locale updated successfully." });
  } else {
    res.status(400).json({ message: "Invalid locale." });
  }
});

router.post("/api/admin/timezone", checkAdminGroup, async (req, res) => {
  const { timezone } = req.body;
  if (timezone) {
    config.timezone = timezone;
    await configService.updateSetting("timezone", timezone);
    res.status(200).json({ message: "Timezone updated successfully." });
  } else {
    res.status(400).json({ message: "Invalid timezone." });
  }
});

router.post("/api/admin/serverIp", checkAdminGroup, async (req, res) => {
  const { serverIp } = req.body;
  if (serverIp) {
    config.serverIp = serverIp;
    await configService.updateSetting("serverIp", serverIp);
    res.status(200).json({ message: "Server IP updated successfully." });
  } else {
    res.status(400).json({ message: "Invalid server IP." });
  }
});

export default router;
