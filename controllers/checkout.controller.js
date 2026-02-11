const Order = require("../models/Order");
const Cart = require("../models/Cart"); // or session cart
const generateOrderId = require("../utils/generateOrderId");

exports.placeOrder = async (req, res) => {
  try {
    console.log("PLACE ORDER HIT", req.body);

    const userId = req.session.userId;
    if (!userId) {
      return res.redirect("/login");
    }

    const {
      name,
      phone,
      line1,
      city,
      state,
      pincode,
      paymentMethod,
    } = req.body;

    // 🔴 Basic validation
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return res.redirect("/checkout");
    }

    // 🛒 Get cart from session (MOST LIKELY)
    const cart = req.session.cart;
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    const shippingCharge = 49;

    const items = cart.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      variant: {
        size: item.size || null,
        color: item.color || null,
      },
    }));

    const totalAmount = cart.subTotal + shippingCharge;

    const order = new Order({
      userId,
      orderId: generateOrderId(),
      items,
      address: {
        name,
        phone,
        line1,
        city,
        state,
        pincode,
      },
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "pending",
      totalAmount,
    });

    await order.save();

    // 🧹 Clear cart
    req.session.cart = null;

    // ✅ REDIRECT (THIS WAS MISSING)
    res.redirect(`/orders/${order._id}`);
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.redirect("/checkout");
  }
};
