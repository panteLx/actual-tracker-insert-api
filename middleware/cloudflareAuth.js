const getCloudflareUser = (req, res, next) => {
  const userEmail = req.headers["Cf-Access-Authenticated-User-Email"];
  req.userEmail = userEmail || null;
  next();
};

export default getCloudflareUser;
