import express from "express";
import { client } from "../config/oidcConfig.js";
import { randomBytes } from "crypto"; // Import crypto for generating random state
import { allowUnauthorized } from "../middleware/authMiddleware.js";
import { config } from "../config/config.js";
import { getAssetVersions } from "../utils/helpers.js";

const router = express.Router();

router.get("/auth/login", allowUnauthorized, async (req, res) => {
  if (req.session.tokenSet) {
    return res.redirect("/");
  }
  const versions = await getAssetVersions([
    "/css/style.min.css",
    "/js/authLogin.min.js",
  ]);

  res.render("login", {
    versions,
    successMessage: req.query.success,
    errorMessage: req.query.error,
    debug: req.query.debug,
    isDebugMode: config.debug,
    NODE_ENV: config.NODE_ENV,
  });
});

router.get("/auth/start", allowUnauthorized, (req, res) => {
  const state = randomBytes(16).toString("hex");
  req.session.state = state;

  const authorizationUrl = client.authorizationUrl({
    scope: "openid profile email groups",
    redirect_uri: config.oidc.appUrl + "/auth/callback",
    state: state,
  });

  res.redirect(authorizationUrl);
});

router.get("/auth/callback", allowUnauthorized, async (req, res) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(
      config.oidc.appUrl + "/auth/callback",
      params,
      { state: req.session.state }
    );

    req.session.tokenSet = tokenSet;

    // Extract user information
    const userInfo = await client.userinfo(tokenSet.access_token);
    req.session.userEmail = userInfo.email; // Assuming the email is in the userinfo
    req.session.userName = userInfo.name; // Assuming the name is in the userinfo
    req.session.userGroups = userInfo.groups || []; // Assuming groups are in the userinfo

    res.redirect("/");
  } catch (error) {
    console.error("Authentication error:", error);
    res.redirect(
      "/auth/login?error=" + encodeURIComponent("Authentication failed")
    );
  }
});

router.get("/auth/logout", allowUnauthorized, (req, res) => {
  req.session.destroy();
  res.redirect("/auth/login");
});

export default router;
