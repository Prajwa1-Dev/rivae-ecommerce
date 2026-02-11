const User = require("../models/User");

/* =========================
   REGISTER USER
========================= */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    // Create user
    const user = new User({
      name,
      email,
      role: "user" // 🔒 force user role
    });

    await user.setPassword(password);
    await user.save();

    // Session
    req.session.userId = user._id;
    req.session.role = "user";
    req.session.isAdmin = false;

    req.flash("success", "Account created successfully");
    return res.redirect("/");

  } catch (error) {
    console.error("Register error:", error.message);
    req.flash("error", error.message || "Registration failed");
    return res.redirect("/register");
  }
};

/* =========================
   LOGIN USER
========================= */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/login");
    }

    // Find user + password
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    // Session
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.isAdmin = user.role === "admin";

    req.flash("success", "Logged in successfully");

    // 🔁 Redirect based on role
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/");

  } catch (error) {
    console.error("Login error:", error.message);
    req.flash("error", "Login failed");
    return res.redirect("/login");
  }
};

/* =========================
   LOGOUT USER
========================= */
exports.logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/");
    }

    res.clearCookie("rivae.sid");
    return res.redirect("/login");
  });
};
