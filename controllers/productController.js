// controllers/productController.js
const Product = require('../models/Product');

exports.list = async (req, res) => {
  const products = await Product.find({ status: 'active' }).limit(200);
  res.render('product-list', { products, pageTitle: 'Collections' });
};

exports.detail = async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return next();
  res.render('product-detail', { product, pageTitle: product.name });
};
