const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { isAuthenticated } = require("../middleware/auth.middleware");
const generateInvoicePDF = require("../utils/invoicePdfGenerator");

/**
 * ===============================
 * ORDER DETAILS PAGE
 * GET /orders/:id
 * ===============================
 */
router.get("/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    }).lean();

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    res.render("order-view", {
      pageTitle: "Order Details",
      order,
    });

  } catch (error) {
    console.error("Order view error:", error);
    req.flash("error", "Something went wrong");
    return res.redirect("/orders");
  }
});


/**
 * ===============================
 * DOWNLOAD INVOICE PDF
 * GET /orders/:id/invoice
 * ===============================
 */
router.get("/orders/:id/invoice", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    if (!order.invoice || !order.invoice.number) {
      req.flash("error", "Invoice not available for this order");
      return res.redirect(`/orders/${order._id}`);
    }

    // ✅ Generate and stream PDF
    return generateInvoicePDF(order, res);

  } catch (error) {
    console.error("Invoice download error:", error);
    req.flash("error", "Unable to download invoice");
    return res.redirect("/orders");
  }
});

module.exports = router;
