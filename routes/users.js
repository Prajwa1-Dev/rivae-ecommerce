const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/profile-test", (req, res) => {
  res.send("PROFILE ROUTE WORKS");
});

// ==============================
// USER PROFILE
// URL: /users/profile
// ==============================
router.get("/profile", async (req, res) => {
  // 🔐 Ensure user is logged in
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    // ✅ Fetch user from DB using session ID
    const user = await User.findById(req.session.userId).lean();

    if (!user) {
      return res.redirect("/login");
    }

    // ✅ PASS USER TO EJS (THIS FIXES THE ERROR)
    res.render("users/profile", {
      pageTitle: "My Profile",
      user, // 👈 THIS LINE IS THE KEY
    });
  } catch (error) {
    console.error("Profile route error:", error);
    res.redirect("/dashboard");
  }
});

module.exports = router;
