import express from "express";
import { config } from "../config/config.js";
import { getAssetVersions, getNavigationItems } from "../utils/helpers.js";

const router = express.Router();

router.get("/user", async (req, res) => {
  // Get asset versions for cache busting first
  const versions = await getAssetVersions([
    "/css/style.min.css",
    "/js/userPanel.min.js",
  ]);
  const successMessage = req.query.success;
  const errorMessage = req.query.error;
  const debug = req.query.debug || null;
  res.render("userPanel", {
    userEmail: req.session.userEmail,
    userGroups: req.session.userGroups,
    isDebugMode: config.debug,
    NODE_ENV: config.NODE_ENV,
    versions,
    successMessage,
    errorMessage,
    debug,
    navItems: getNavigationItems("user"),
    currentPage: "panel",
  });
});

export default router;
