import express from "express";

const router = express.Router();

// Logout route
router.get("/logout", (req, res) => {
  // Redirect to Cloudflare logout URL
  if (process.env.NODE_ENV === "development") {
    res.redirect("/");
  } else {
    res.clearCookie("CF_AUTHORIZATION");
    const logoutUrl = `${process.env.CF_TEAM_DOMAIN}/cdn-cgi/access/logout`;
    res.redirect(logoutUrl);
  }
});

export default router;
