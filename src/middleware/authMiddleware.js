export const isAuthenticated = (req, res, next) => {
  if (req.session.tokenSet) {
    next(); // User is authenticated
  } else {
    res.redirect("/auth/login"); // Redirect to login if not authenticated
  }
};

export const allowUnauthorized = (req, res, next) => {
  next();
};
