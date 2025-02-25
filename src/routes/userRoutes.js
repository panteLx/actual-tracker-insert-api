import express from "express";
import { config } from "../config/config.js";
import { getFileVersion, getNavigationItems } from "../utils/helpers.js";

const router = express.Router();

const getAssetVersions = async () => {
  let cssVersion, jsVersion;
  try {
    [cssVersion, jsVersion] = await Promise.all([
      getFileVersion("/css/style.min.css"),
      getFileVersion("/js/userPanel.min.js"),
    ]);
  } catch (error) {
    console.error("Error getting file versions:", error);
    cssVersion = Date.now();
    jsVersion = Date.now();
  }
  return { cssVersion, jsVersion };
};
// Admin panel route
router.get("/user", async (req, res) => {
  // Get asset versions for cache busting first
  const { cssVersion, jsVersion } = await getAssetVersions();
  const successMessage = req.query.success;
  const errorMessage = req.query.error;
  const debug = req.query.debug || null;
  res.render("userPanel", {
    userEmail: req.session.userEmail,
    userGroups: req.session.userGroups,
    isDebugMode: config.debug,
    NODE_ENV: config.NODE_ENV,
    cssVersion,
    jsVersion,
    successMessage,
    errorMessage,
    debug,
    navItems: getNavigationItems("user"),
    currentPage: "panel",
  });
});

export default router;
