const getCloudflareUser = (req, res, next) => {
  const userEmail = req.headers["cf-access-authenticated-user-email"];
  req.userEmail = userEmail || null;
  next();
};

export default getCloudflareUser;
