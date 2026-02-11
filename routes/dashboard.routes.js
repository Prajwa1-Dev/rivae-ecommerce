const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { isAuthenticated } = require("../middleware/auth.middleware");

/**
 * USER DASHBOARD
 * GET /dashboard
 */
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Real data
    const totalOrders = await Order.countDocuments({ userId });
    const recentOrders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.render("dashboard", {
      layout: "layouts/dashboard-layout",
      pageTitle: "Dashboard",
      totalOrders,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    req.flash("error", "Unable to load dashboard");
    res.redirect("/");
  }
});

/**
 * USER ORDERS LIST
 * GET /orders
 */
router.get("/orders", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId })
      .sort({ createdAt: -1 });

    res.render("orders", {
      layout: "layouts/dashboard-layout",
      pageTitle: "My Orders",
      orders,
    });
  } catch (error) {
    console.error("Orders list error:", error);
    req.flash("error", "Unable to load orders");
    res.redirect("/dashboard");
  }
});

/**
 * ORDER DETAILS PAGE
 * GET /orders/:id
 */
router.get("/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    res.render("order-details", {
      layout: "layouts/dashboard-layout",
      pageTitle: "Order Details",
      order,
    });
  } catch (error) {
    console.error("Order details error:", error);
    req.flash("error", "Unable to load order details");
    res.redirect("/orders");
  }
});

module.exports = router;
