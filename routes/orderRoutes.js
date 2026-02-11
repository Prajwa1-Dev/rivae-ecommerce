const express = require("express");
const Order = require("../models/Order");
const { isAuthenticated } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * GET MY ORDERS
 * GET /api/orders/my
 */
router.get("/my", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      itemsCount: order.items.length,
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * GET SINGLE ORDER DETAILS
 * GET /api/orders/:id
 */
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    })
      .populate("items.productId")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Fetch order details error:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

/**
 * CANCEL ORDER
 * PUT /api/orders/:id/cancel
 */
router.put("/:id/cancel", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent cancellation after shipping
    if (
      ["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)
    ) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled now" });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Order cancellation error:", error);
    res.status(500).json({ message: "Order cancellation failed" });
  }
});

module.exports = router;
