import passport from "passport";
import { Strategy } from "passport-openid-connect";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
const envPath = path.resolve(__dirname, envFile);

// Add debug logging
console.log("Current NODE_ENV:", process.env.NODE_ENV);
console.log("Trying to load env file:", envPath);

// Load environment variables from the specific .env file
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log(".env file loaded successfully");
}

console.log("OIDC_ISSUER_HOST:", process.env.OIDC_ISSUER_HOST);

export function configureAuth(app) {
  // Session middleware configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // Configure OIDC strategy
  passport.use(
    "oidc",
    new Strategy({
      issuerHost: process.env.OIDC_ISSUER_HOST,
      authorizationURL: process.env.OIDC_AUTH_URL,
      tokenURL: process.env.OIDC_TOKEN_URL,
      userInfoURL: process.env.OIDC_USERINFO_URL,
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      callbackURL: process.env.OIDC_CALLBACK_URL,
      scope: "openid profile email",
    })
  );

  // Authentication middleware
  const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };

  return requireAuth;
}
