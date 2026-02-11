// routes/adminDashboard.js
const express = require('express');
const router = express.Router();

// OPTIONAL: require your models if you want real metrics
// const Product = require('../models/Product');
// const Order = require('../models/Order');
// const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    // If you have models, replace the mock metrics with DB queries
    // Example:
    // const totalProducts = await Product.countDocuments();
    // const totalOrders = await Order.countDocuments();
    // const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" }}}]);

    // Mock data (safe default if DB not set up yet)
    const metrics = {
      totalProducts:  (typeof global.TOTAL_PRODUCTS !== 'undefined') ? global.TOTAL_PRODUCTS : 0,
      totalOrders:    (typeof global.TOTAL_ORDERS !== 'undefined') ? global.TOTAL_ORDERS : 0,
      totalRevenue:   (typeof global.TOTAL_REVENUE !== 'undefined') ? global.TOTAL_REVENUE : 0
    };

    // Mock recent orders and low stock - replace with DB queries later
    const recentOrders = [
      // Example object shape expected by dashboard.ejs
      // { _id: '641a1a...', createdAt: new Date(), totals: { grandTotal: 1999 }, payment: { method: 'COD' } }
    ];

    const lowStock = [
      // { name: 'T-Shirt', variant: 'L / Blue', stock: 2 }
    ];

    res.render('admin/dashboard', {
      layout: 'admin/admin-layout',
      isAdminPage: true,
      pageTitle: 'Dashboard',
      pageSubtitle: 'Overview of your store performance',
      metrics,
      recentOrders,
      lowStock
    });
  } catch (err) {
    console.error('Dashboard render error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
