const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { isAuthenticated } = require("../middleware/auth.middleware");
const generateInvoicePDF = require("../utils/invoicePdfGenerator");

// ============================
// DOWNLOAD INVOICE
// GET /orders/:id/invoice
// ============================
router.get("/orders/:id/invoice", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Security: only owner can download
    if (order.userId.toString() !== req.session.userId) {
      return res.status(403).send("Unauthorized");
    }

    if (!order.invoice || !order.invoice.number) {
      return res.status(400).send("Invoice not available");
    }

    generateInvoicePDF(order, res);
  } catch (err) {
    console.error("Invoice PDF error:", err);
    res.status(500).send("Failed to generate invoice");
  }
});

module.exports = router;
