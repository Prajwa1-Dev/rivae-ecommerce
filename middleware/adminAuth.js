module.exports = (req, res, next) => {
  // Allow admin login page
  if (req.path === "/login") {
    return next();
  }

  if (req.session.isAdmin === true) {
    return next();
  }

  return res.redirect("/admin/login");
};
