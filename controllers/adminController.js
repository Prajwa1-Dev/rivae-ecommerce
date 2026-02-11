const Product = require("../models/Product");
const Order = require("../models/Order");
const { uploadImage, deleteImage } = require("../services/cloudinary");
const fs = require("fs");

// =============================================================
// ADMIN LOGIN (PAGE)
// =============================================================
exports.getLogin = (req, res) => {
  if (req.session.isAdmin === true) {
    return res.redirect("/admin/dashboard");
  }

  res.render("auth/admin-login", {
    layout: "layouts/auth-layout",
    pageTitle: "Admin Login",
    error: null,
  });
};

// =============================================================
// ADMIN LOGIN (SUBMIT)
// =============================================================
exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    return res.redirect("/admin/dashboard");
  }

  res.render("auth/admin-login", {
    layout: "layouts/auth-layout",
    pageTitle: "Admin Login",
    error: "Invalid email or password",
  });
};

// =============================================================
// ADMIN LOGOUT
// =============================================================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

// =============================================================
// DASHBOARD — DATA PROVIDER (FINAL)
// =============================================================
exports.getDashboardData = async () => {
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // ---------- DATE RANGE (TODAY) ----------
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // ---------- TODAY ORDERS ----------
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: startOfDay },
  });

  // ---------- TODAY REVENUE ----------
  const todayRevenueAgg = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay },
        paymentStatus: "Paid",
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const todayRevenue = todayRevenueAgg[0]?.total || 0;

  // ---------- TOTAL REVENUE ----------
  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // ---------- PENDING ORDERS ----------
  const pendingOrders = await Order.countDocuments({
    orderStatus: "Pending",
  });

  // ---------- RECENT ORDERS ----------
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // ---------- LOW STOCK ----------
  const products = await Product.find().lean();
  const lowStock = [];

  products.forEach((p) => {
    p.variants?.forEach((v) => {
      if (v.stock <= 5) {
        lowStock.push({
          name: p.name,
          variant: v.size,
          stock: v.stock,
        });
      }
    });
  });

  return {
    metrics: {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      todayOrders,
      todayRevenue,
    },
    recentOrders,
    lowStock,
  };
};

// =============================================================
// PRODUCT LIST
// =============================================================
exports.listProductsData = async () => {
  return await Product.find().sort({ createdAt: -1 }).lean();
};

// =============================================================
// ADD PRODUCT
// =============================================================
exports.postAddProduct = async (req, res) => {
  try {
    const { name, description, price, salePrice, categories, tags, sizes } =
      req.body;

    const images = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadImage(file.path, "rivae/products");
        images.push(uploaded);
        fs.unlinkSync(file.path);
      }
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      categories: categories?.split(",").map(c => c.trim()) || [],
      tags: tags?.split(",").map(t => t.trim()) || [],
      images,

      variants: sizes
        ? sizes.split(",").map((s) => ({
            sku: `${name.toUpperCase().replace(/\s+/g, "-")}-${s.trim()}`,
            size: s.trim(),
            stock: 0,
          }))
        : [],
    });

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Add Product Error:", err);
    res.render("admin/products/add", {
      layout: "admin/admin-layout",
      active: "products",
      pageTitle: "Add Product",
      error: err.message,
    });
  }
};

// =============================================================
// EDIT PRODUCT (DATA)
// =============================================================
exports.getEditProductData = async (id) => {
  return await Product.findById(id).lean();
};

// =============================================================
// EDIT PRODUCT (SUBMIT) — SAFE
// =============================================================
exports.postEditProduct = async (req, res) => {
  try {
    const { name, description, price, salePrice, categories, tags, sizes } =
      req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin/products");

    product.name = name;
    product.description = description;
    product.price = Number(price);
    product.salePrice = salePrice ? Number(salePrice) : undefined;
    product.categories = categories?.split(",").map(c => c.trim()) || [];
    product.tags = tags?.split(",").map(t => t.trim()) || [];

    // ✅ Preserve stock on edit
    if (sizes) {
      const existingStock = {};
      product.variants.forEach(v => {
        existingStock[v.size] = v.stock;
      });

      product.variants = sizes.split(",").map((s) => ({
        sku: `${name.toUpperCase().replace(/\s+/g, "-")}-${s.trim()}`,
        size: s.trim(),
        stock: existingStock[s.trim()] || 0,
      }));
    }

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadImage(file.path, "rivae/products");
        product.images.push(uploaded);
        fs.unlinkSync(file.path);
      }
    }

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Edit Product Error:", err);
    res.redirect("/admin/products");
  }
};

// =============================================================
// DELETE IMAGE
// =============================================================
exports.postDeleteImage = async (req, res) => {
  const { productId, publicId } = req.body;

  await deleteImage(publicId);
  await Product.findByIdAndUpdate(productId, {
    $pull: { images: { public_id: publicId } },
  });

  res.redirect(`/admin/products/${productId}/edit`);
};

// =============================================================
// DELETE PRODUCT
// =============================================================
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect("/admin/products");

  for (const img of product.images) {
    try {
      await deleteImage(img.public_id);
    } catch {}
  }

  await product.deleteOne();
  res.redirect("/admin/products");
};
