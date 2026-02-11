const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const Product = require("../models/Product"); // ✅ FIXED
const upload = require("../middleware/multer").array("images", 6);
const adminAuth = require("../middleware/adminAuth");

// =============================
// ADMIN LOGIN
// =============================
router.get("/login", (req, res) => {
  if (req.session.isAdmin === true) {
    return res.redirect("/admin/dashboard");
  }

  res.render("auth/admin-login", {
    layout: "layouts/auth-layout",
    pageTitle: "Admin Login",
    isAdminPage: true,
    hideChrome: true,
    error: null,
  });
});

router.post("/login", adminController.postLogin);

// =============================
// ADMIN LOGOUT
// =============================
router.get("/logout", adminAuth, adminController.logout);

// =============================
// ADMIN DASHBOARD
// =============================
// router.get("/dashboard", adminAuth, async (req, res) => {
//   const data = await adminController.getDashboardData();

//   res.render("admin/dashboard", {
//     layout: "admin/admin-layout",
//     pageTitle: "Dashboard",
//     active: "dashboard",

//     totalProducts: data.metrics.totalProducts,
//     totalOrders: data.metrics.totalOrders,
//     totalRevenue: data.metrics.totalRevenue,

//     recentOrders: data.recentOrders,
//     lowStock: data.lowStock,
//   });
// });
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const data = await adminController.getDashboardData();

    const metrics = data?.metrics || {};

    res.render("admin/dashboard", {
      layout: "admin/admin-layout",
      pageTitle: "Dashboard",
      pageSubtitle: "Overview of your store",
      active: "dashboard",

      // ✅ SAFE FALLBACKS (THIS FIXES YOUR ERROR)
      totalProducts: metrics.totalProducts ?? 0,
      totalOrders: metrics.totalOrders ?? 0,
      totalRevenue: metrics.totalRevenue ?? 0,
      pendingOrders: metrics.pendingOrders ?? 0,
      todayOrders: metrics.todayOrders ?? 0,
      todayRevenue: metrics.todayRevenue ?? 0,

      recentOrders: data?.recentOrders || [],
      lowStock: data?.lowStock || [],
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).render("error");
  }
});


// =============================
// PRODUCTS LIST
// =============================
router.get("/products", adminAuth, async (req, res) => {
  const products = await adminController.listProductsData();

  res.render("admin/products/list", {
    layout: "admin/admin-layout",
    pageTitle: "Products",
    active: "products",
    products,
  });
});

// =============================
// ADD PRODUCT
// =============================
router.get("/products/add", adminAuth, (req, res) => {
  res.render("admin/products/add", {
    layout: "admin/admin-layout",
    pageTitle: "Add Product",
    active: "products",
  });
});

router.post(
  "/products/add",
  adminAuth,
  upload,
  adminController.postAddProduct
);

// =============================
// EDIT PRODUCT
// =============================
router.get("/products/:id/edit", adminAuth, async (req, res) => {
  const product = await adminController.getEditProductData(req.params.id);
  if (!product) return res.redirect("/admin/products");

  res.render("admin/products/edit", {
    layout: "admin/admin-layout",
    pageTitle: "Edit Product",
    active: "products",
    product,
  });
});

router.post(
  "/products/:id/edit",
  adminAuth,
  upload,
  adminController.postEditProduct
);

// =============================
// 👁 PREVIEW PRODUCT (ADMIN VIEW)
// =============================
router.get("/products/:id/view", adminAuth, async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.redirect("/admin/products");

  // reuse public product page
  res.redirect(`/products/${product.slug}`);
});

// =============================
// 📊 UPDATE STOCK (VARIANT-AWARE)
// =============================
router.post("/products/:id/stock", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin/products");

    // expects: stock[variantIndex]
    Object.keys(req.body.stock || {}).forEach(index => {
      product.variants[index].stock = Math.max(
        Number(req.body.stock[index]),
        0
      );
    });

    await product.save(); // triggers totalStock recalculation

    res.redirect("/admin/products");
  } catch (err) {
    console.error("Stock update error:", err);
    res.redirect("/admin/products");
  }
});

// =============================
// DELETE PRODUCT
// =============================
router.post(
  "/products/:id/delete",
  adminAuth,
  adminController.deleteProduct
);

// =============================
// DELETE IMAGE
// =============================
router.post(
  "/products/image/delete",
  adminAuth,
  adminController.postDeleteImage
);

module.exports = router;
