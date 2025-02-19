const getCloudflareUser = async (req, res, next) => {
  // Bypass in development
  if (process.env.NODE_ENV === "development") {
    req.userEmail = "dev@example.com";
    return next();
  }

  const userEmail = req.headers["Cf-Access-Authenticated-User-Email"];
  req.userEmail = userEmail || null;
  next();
};

export default getCloudflareUser;
