var express = require('express');
var router = express.Router();

/* GET home page */
router.get('/', function(req, res) {
  
  const featured = [
    { title: "Drop 01", subtitle: "Minimal Streetwear", image: "/images/f1.jpg" },
    { title: "Drop 02", subtitle: "Urban Essentials", image: "/images/f2.jpg" },
    { title: "Drop 03", subtitle: "Night Mode Aesthetic", image: "/images/f3.jpg" }
  ];

  const products = [
    { name: "Oversized Tee", image: "/images/p1.jpg", originalPrice: 1299 },
    { name: "Black Cargo", image: "/images/p2.jpg", originalPrice: 1999, salePrice: 1499 },
    { name: "Street Hoodie", image: "/images/p3.jpg", originalPrice: 2499 },
    { name: "Denim Jacket", image: "/images/p4.jpg", originalPrice: 3499, salePrice: 2999 }
  ];

  res.render("index", {
    layout: false,   // <-- NO LAYOUT HERE
    featured,
    products
  });
});


/* CONTACT PAGE */
router.get("/contact", (req, res) => {
  res.render("contact", {
    pageTitle: "Contact",
    currentUser: req.user || null
  });
});

/* POLICY PAGE */
router.get("/policy", (req, res) => {
  res.render("policy", {
    pageTitle: "policy",
    currentUser: req.user || null
  });
});

module.exports = router;
