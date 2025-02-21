import jwt from "jsonwebtoken";

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

    // Decode the JWT token
    const decodedToken = jwt.decode(jwtToken);

    // Extract user groups from the decoded token
    const userGroups = decodedToken?.groups || []; // Adjust this based on your JWT structure

    req.userEmail = userEmail;
    req.userGroups = userGroups; // Set user groups in request
    next();
  } catch (error) {
    console.error("Cloudflare Access authentication error:", error);
    res.status(401).send("Unauthorized - Invalid credentials");
  }
};

export default getCloudflareUser;
