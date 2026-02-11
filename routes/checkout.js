const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const { isAuthenticated } = require("../middleware/auth.middleware");
const generateOrderId = require("../utils/generateOrderId");
const generateInvoice = require("../utils/generateInvoice");

// -------------------------------
// CALCULATE TOTALS (SERVER TRUSTED)
// -------------------------------
function calculateTotals(items) {
  const subTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subTotal > 999 ? 0 : 49;
  const tax = 0;
  const totalAmount = subTotal + shipping + tax;

  return { subTotal, shipping, tax, totalAmount };
}

// -------------------------------
// CHECKOUT PAGE
// GET /checkout
// -------------------------------
router.get("/", isAuthenticated, (req, res) => {
  const cart = req.session.cart;

  if (!cart || !cart.items || !cart.items.length) {
    req.flash("error", "Your cart is empty");
    return res.redirect("/cart");
  }

  const totals = calculateTotals(cart.items);

  res.render("checkout", {
    layout: "layouts/dashboard-layout",
    pageTitle: "Checkout",
    cart,
    totals,
  });
});

// -------------------------------
// PLACE ORDER
// POST /checkout/place-order
// -------------------------------
router.post("/place-order", isAuthenticated, async (req, res) => {
  try {
    const { name, phone, line1, city, state, pincode, paymentMethod } = req.body;

    // -------------------------
    // VALIDATION
    // -------------------------
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      req.flash("error", "All address fields are required");
      return res.redirect("/checkout");
    }

    const cart = req.session.cart;
    if (!cart || !cart.items || !cart.items.length) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    // -------------------------
    // NORMALIZE PAYMENT METHOD
    // -------------------------
    const normalizedPaymentMethod = (paymentMethod || "cod").toLowerCase();

    if (!["cod", "upi"].includes(normalizedPaymentMethod)) {
      req.flash("error", "Invalid payment method");
      return res.redirect("/checkout");
    }

    // -------------------------
    // PRICE REVALIDATION (SECURITY)
    // -------------------------
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        req.flash("error", "Invalid product in cart");
        return res.redirect("/cart");
      }

      item.price = product.salePrice || product.price;
    }

    // -------------------------
    // FINAL TOTALS
    // -------------------------
    const totals = calculateTotals(cart.items);

    // -------------------------
    // CREATE ORDER FIRST
    // -------------------------
    const order = await Order.create({
      userId: req.session.userId,
      orderId: generateOrderId(),

      items: cart.items.map(item => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant || {},
      })),

      address: {
        name,
        phone,
        line1,
        city,
        state,
        pincode,
      },

      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",

      totalAmount: totals.totalAmount,
    });

    // -------------------------
    // GENERATE & ATTACH INVOICE
    // -------------------------
    const invoice = await generateInvoice();
    order.invoice = invoice;
    await order.save();

    // -------------------------
    // CLEAR CART
    // -------------------------
    req.session.cart = null;

    // -------------------------
    // PAYMENT FLOW
    // -------------------------
    if (normalizedPaymentMethod === "upi") {
      return res.redirect(
        `/payment/phonepe/initiate?orderId=${order.orderId}`
      );
    }

    // COD FLOW
    req.flash("success", "Order placed successfully");
    return res.redirect(`/orders/${order._id}`);

  } catch (error) {
    console.error("Checkout error:", error);
    req.flash("error", "Unable to place order");
    return res.redirect("/checkout");
  }
});

module.exports = router;
