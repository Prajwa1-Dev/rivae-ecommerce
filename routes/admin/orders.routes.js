const express = require("express");
const Order = require("../../models/Order");
const adminAuth = require("../../middleware/adminAuth");
const generateInvoicePDF = require("../../utils/invoicePdfGenerator");

const router = express.Router();

/**
 * ===============================
 * ADMIN – ALL ORDERS
 * GET /admin/orders
 * ===============================
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/orders/orders-list", {
      layout: "admin/admin-layout",
      pageTitle: "All Orders",
      active: "orders",
      orders,
    });
  } catch (error) {
    console.error("Admin orders list error:", error);
    res.status(500).render("error");
  }
});

/**
 * ===============================
 * ADMIN – ORDER DETAILS
 * GET /admin/orders/:id
 * ===============================
 */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).render("error");
    }

    res.render("admin/orders/order-view", {
      layout: "admin/admin-layout",
      pageTitle: "Order Details",
      active: "orders",
      order,
    });
  } catch (error) {
    console.error("Admin order details error:", error);
    res.status(500).render("error");
  }
});

/**
 * ===============================
 * ADMIN – UPDATE ORDER STATUS
 * POST /admin/orders/:id/status
 * ===============================
 */
router.post("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.redirect(`/admin/orders/${req.params.id}`);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.redirect("/admin/orders");
    }

    // 🔒 Lock delivered orders (no downgrade allowed)
    if (order.orderStatus === "delivered") {
      return res.redirect(`/admin/orders/${order._id}`);
    }

    order.orderStatus = status;

    // COD → mark payment as paid ONLY when delivered
    if (order.paymentMethod === "cod" && status === "delivered") {
      order.paymentStatus = "paid";
    }

    await order.save();

    res.redirect(`/admin/orders/${order._id}`);
  } catch (error) {
    console.error("Admin order status update error:", error);
    res.status(500).render("error");
  }
});

/**
 * ===============================
 * ADMIN – DOWNLOAD INVOICE
 * GET /admin/orders/:id/invoice
 * ===============================
 */
router.get("/:id/invoice", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    if (!order.invoice || !order.invoice.number) {
      req.flash("error", "Invoice not available for this order");
      return res.redirect("/admin/orders");
    }

    // Generate and stream PDF
    return generateInvoicePDF(order, res);

  } catch (error) {
    console.error("Admin invoice download error:", error);
    req.flash("error", "Unable to download invoice");
    return res.redirect("/admin/orders");
  }
});

module.exports = router;
