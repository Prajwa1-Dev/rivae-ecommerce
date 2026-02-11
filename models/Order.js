const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // USER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // FRIENDLY ORDER ID (for UI)
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ORDER ITEMS (snapshot)
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        variant: {
          size: { type: String, default: null },
          color: { type: String, default: null },
        },
      },
    ],

    // SHIPPING ADDRESS
    address: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      line1: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },

    // PAYMENT
    paymentMethod: {
      type: String,
      enum: ["cod", "upi"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    transactionId: {
      type: String,
      default: null,
    },

    // ORDER STATUS (ADMIN CONTROLLED)
    orderStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // PRICE
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================
    // INVOICE (AUTO GENERATED)
    // =====================
    invoice: {
      number: {
        type: String,
        unique: true,
        sparse: true, // allows old orders without invoice
      },
      date: {
        type: Date,
        default: Date.now,
      },
      gstNumber: {
        type: String,
        default: "GSTIN-DUMMY-0000",
      },
      brandAddress: {
        type: String,
        default: "RIVAE, Nippani, India",
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES
orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
