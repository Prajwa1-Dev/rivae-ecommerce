/* ==========================================
   AUTHENTICATION & AUTHORIZATION MIDDLEWARE
   RIVAE
========================================== */

/**
 * Require user to be logged in
 * Use ONLY where login is mandatory:
 * - Dashboard
 * - Orders
 * - Checkout
 */
exports.isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.flash("error", "Please login to continue");
    return res.redirect("/login");
  }
  next();
};

/**
 * Require admin access
 */
exports.isAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }

  if (req.session.role !== "admin") {
    req.flash("error", "Access denied");
    return res.redirect("/");
  }

  next();
};

/**
 * Prevent authenticated users from accessing
 * login / register pages
 */
exports.redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return req.session.role === "admin"
      ? res.redirect("/admin/dashboard")
      : res.redirect("/dashboard");
  }
  next();
};

/**
 * Attach user info to views
 */
exports.attachUser = (req, res, next) => {
  res.locals.currentUserId = req.session?.userId || null;
  res.locals.currentUserRole = req.session?.role || "user";
  next();
};
