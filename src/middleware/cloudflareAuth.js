import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const getCloudflareUser = async (req, res, next) => {
  try {
    const jwtToken = req.headers["cf-access-jwt-assertion"];
    const userEmail = req.headers["cf-access-authenticated-user-email"];

    if (!jwtToken || !userEmail) {
      // If running in development, use a mock email and group
      if (process.env.NODE_ENV === "development") {
        req.userEmail = "dev@example.com";
        req.userGroups = ["global-admins"]; // Mock group for development
        return next();
      }
      return res
        .status(401)
        .send("Unauthorized - No valid Cloudflare Access credentials");
    }

    // Verify the JWT token
    const certsUrl = `${process.env.CF_TEAM_DOMAIN}/cdn-cgi/access/certs`;
    const response = await fetch(certsUrl);
    const certs = await response.json();

    console.log("JWKS Response:", certs);

    // Use the public_cert for verification
    const publicCert = certs.public_cert.cert; // Get the PEM certificate

    // Verify the token
    const decodedToken = jwt.verify(jwtToken, publicCert, {
      algorithms: ["RS256"],
    });

    // Extract user groups from the decoded token
    const userGroups = decodedToken?.custom?.groups || [];

    req.userEmail = userEmail;
    req.userGroups = userGroups; // Set user groups in request
    next();
  } catch (error) {
    console.error("Cloudflare Access authentication error:", error);
    res.status(401).send("Unauthorized - Invalid credentials");
  }
};

export default getCloudflareUser;
