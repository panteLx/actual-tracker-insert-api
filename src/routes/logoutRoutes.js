import express from "express";
import { config } from "../config/config.js";
const router = express.Router();

// Logout route
router.get("/logout", (req, res) => {
  // Redirect to Cloudflare logout URL
  if (config.NODE_ENV === "development") {
    res.redirect("/");
  } else {
    res.clearCookie("CF_Authorization");
    const logoutUrl = `${config.CF_TEAM_DOMAIN}/cdn-cgi/access/logout?returnTo=${config.appUrl}`;
    res.redirect(logoutUrl);
  }
});

export default router;
