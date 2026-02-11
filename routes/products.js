// routes/products.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ======================================================
// PRODUCT LIST PAGE  →  /products
// ======================================================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.render("product-list", {
      pageTitle: "Collections | RIVAE",
      products
    });
  } catch (err) {
    console.error("Error loading products:", err);
    res.status(500).send("Internal Server Error");
  }
});


// ======================================================
// CATEGORY FILTER PAGE  →  /products/category/:name
// ======================================================
router.get("/category/:name", async (req, res) => {
  try {
    const products = await Product.find({
      status: "active",
      categories: req.params.name
    }).lean();

    res.render("product-list", {
      pageTitle: `${req.params.name} | RIVAE`,
      products
    });
  } catch (err) {
    console.error("Category filter error:", err);
    res.status(500).send("Internal Server Error");
  }
});


// ======================================================
// PRODUCT DETAIL PAGE  →  /products/:slug
// ⚠️ MUST BE LAST (important)
// ======================================================
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "active"
    }).lean();

    if (!product) return next(); // goes to 404

    res.render("product-detail", {
      pageTitle: `${product.name} | RIVAE`,
      product
    });
  } catch (err) {
    console.error("Error loading product:", err);
    next(err);
  }
});

module.exports = router;
