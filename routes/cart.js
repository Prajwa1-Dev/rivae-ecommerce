const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { isAuthenticated } = require("../middleware/auth.middleware");

// =============================
// INIT CART HELPER
// =============================
function initCart(req) {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totalQty: 0,
      totalPrice: 0,
    };
  }
}

// =============================
// ADD TO CART
// POST /cart/add
// =============================
router.post("/add", async (req, res) => {

  try {
    const { productId, size } = req.body;

    if (!productId || !size) {
      req.flash("error", "Please select a size");
      return res.redirect("back");
    }

    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    initCart(req);
    const cart = req.session.cart;

    const price = product.salePrice || product.price;

    // Find same product + same size
    const existingItem = cart.items.find(
      item =>
        item.productId.toString() === productId &&
        item.size === size
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId: product._id,
        title: product.title || product.name,
        image: product.images?.[0]?.url || "",
        price,
        size,
        quantity: 1,
      });
    }

    cart.totalQty += 1;
    cart.totalPrice += price;

    req.flash("success", "Added to cart");
    res.redirect("/cart");
  } catch (err) {
    console.error("Add to cart error:", err);
    req.flash("error", "Unable to add to cart");
    res.redirect("/products");
  }
});

// =============================
// VIEW CART
// GET /cart
// =============================
router.get("/", isAuthenticated, (req, res) => {
  res.render("cart", {
    layout: "layouts/dashboard-layout",
    pageTitle: "Your Cart",
    cart: req.session.cart || { items: [] },
  });
});

// =============================
// REMOVE ITEM
// POST /cart/remove
// =============================
router.post("/remove", isAuthenticated, (req, res) => {
  const { productId, size } = req.body;

  if (!req.session.cart) return res.redirect("/cart");

  const cart = req.session.cart;

  const index = cart.items.findIndex(
    item =>
      item.productId.toString() === productId &&
      item.size === size
  );

  if (index !== -1) {
    const item = cart.items[index];
    cart.totalQty -= item.quantity;
    cart.totalPrice -= item.price * item.quantity;
    cart.items.splice(index, 1);
  }

  if (cart.items.length === 0) {
    req.session.cart = null;
  }

  res.redirect("/cart");
});

// =============================
// INCREASE QTY
// POST /cart/increase
// =============================
router.post("/increase", isAuthenticated, (req, res) => {
  const { productId, size } = req.body;

  if (!req.session.cart) return res.redirect("/cart");

  const cart = req.session.cart;

  const item = cart.items.find(
    i =>
      i.productId.toString() === productId &&
      i.size === size
  );

  if (item) {
    item.quantity += 1;
    cart.totalQty += 1;
    cart.totalPrice += item.price;
  }

  res.redirect("/cart");
});

// =============================
// DECREASE QTY
// POST /cart/decrease
// =============================
router.post("/decrease", isAuthenticated, (req, res) => {
  const { productId, size } = req.body;

  if (!req.session.cart) return res.redirect("/cart");

  const cart = req.session.cart;

  const item = cart.items.find(
    i =>
      i.productId.toString() === productId &&
      i.size === size
  );

  if (item && item.quantity > 1) {
    item.quantity -= 1;
    cart.totalQty -= 1;
    cart.totalPrice -= item.price;
  }

  res.redirect("/cart");
});

module.exports = router;
