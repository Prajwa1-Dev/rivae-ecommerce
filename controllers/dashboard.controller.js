const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/logout");
    }

    res.render("profile", {
      layout: "layouts/dashboard-layout",
      pageTitle: "My Profile",
      user
    });

  } catch (error) {
    console.error("Profile error:", error);
    req.flash("error", "Something went wrong");
    res.redirect("/dashboard");
  }
};
