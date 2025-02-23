import csrf from "csurf";

export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export const csrfErrorHandler = (err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403).json({ message: "Invalid CSRF token" });
};
