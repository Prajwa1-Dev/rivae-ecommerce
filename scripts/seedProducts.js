require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// FIXED FOR MONGOOSE 7+
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const products = [
  {
    name: 'Oversized Tee',
    slug: 'oversized-tee',
    price: 1299,
    images: [{ url: '/images/p1.jpg' }],
    categories: ['shirts'],
    totalStock: 50
  },
  {
    name: 'Black Cargo',
    slug: 'black-cargo',
    price: 1999,
    salePrice: 1499,
    images: [{ url: '/images/p2.jpg' }],
    categories: ['pants'],
    totalStock: 30
  },
  {
    name: 'Street Hoodie',
    slug: 'street-hoodie',
    price: 2499,
    images: [{ url: '/images/p3.jpg' }],
    categories: ['hoodies'],
    totalStock: 20
  }
];

async function seed() {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded successfully!');
  } catch (err) {
    console.error('Error seeding products:', err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
