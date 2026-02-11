const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/auth.controller");

console.log("✅ auth.routes.js loaded");

/* ================= MIDDLEWARE ================= */

// Prevent logged-in users from accessing login/register
const redirectIfUserLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/dashboard");
  }
  next();
};

/* ================= VIEWS ================= */

// LOGIN PAGE
router.get("/login", redirectIfUserLoggedIn, (req, res) => {
  res.render("auth/login", {
    layout: "layouts/auth-layout",
    pageTitle: "Login",
    isAuthPage: true,
    hideChrome: true,
  });
});

// REGISTER PAGE
router.get("/register", redirectIfUserLoggedIn, (req, res) => {
  res.render("auth/register", {
    layout: "layouts/auth-layout",
    pageTitle: "Register",
    isAuthPage: true,
    hideChrome: true,
  });
});

/* ================= ACTIONS ================= */

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
