const getCloudflareUser = async (req, res, next) => {
  try {
    const jwt = req.headers["cf-access-jwt-assertion"];
    const userEmail = req.headers["cf-access-authenticated-user-email"];
    const userGroups = req.headers["cf-access-authenticated-user-groups"] || []; // Get user groups

    if (userEmail) {
      // If running in development, use a mock email and group
      if (process.env.NODE_ENV === "production") {
        req.userEmail = "dev@example.com";
        req.userGroups = ["global-admins"]; // Mock group for development
        return next();
      }
      return res
        .status(401)
        .send("Unauthorized - No valid Cloudflare Access credentials");
    }

    // Verify the JWT token with Cloudflare's JWKS endpoint
    // Your team domain should be something like: https://your-team-name.cloudflareaccess.com
    const certsUrl = `${process.env.CF_TEAM_DOMAIN}/cdn-cgi/access/certs`;

    // TODO: Implement JWT verification here
    // For production, you should verify the JWT token using the public keys from the certs endpoint

    req.userEmail = userEmail;
    req.userGroups = userGroups; // Set user groups in request
    next();
  } catch (error) {
    console.error("Cloudflare Access authentication error:", error);
    res.status(401).send("Unauthorized - Invalid credentials");
  }
};

export default getCloudflareUser;
