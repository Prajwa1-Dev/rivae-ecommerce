const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// List all orders
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.render("admin/orders/orders-list", { orders, pageTitle: "Orders" });
});

// Single order view
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.render("admin/orders/order-view", { order, pageTitle: "Order Details" });
});

// Update status
router.post("/update-status/:id", async (req, res) => {
  const { status } = req.body;
  await Order.findByIdAndUpdate(req.params.id, { orderStatus: status });
  res.redirect(`/admin/orders/${req.params.id}`);
});

module.exports = router;
