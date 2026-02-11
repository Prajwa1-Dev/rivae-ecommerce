const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");

const router = express.Router();

/**
 * ----------------------------------------
 * PHONEPE – INITIATE PAYMENT
 * GET /payment/phonepe/initiate?orderId=XXXX
 * ----------------------------------------
 */
router.get("/phonepe/initiate", async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.redirect("/checkout");
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.redirect("/checkout");
    }

    // Safety: Do not re-initiate paid orders
    if (order.paymentStatus === "paid") {
      return res.redirect(`/orders/${order._id}`);
    }

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: order.orderId,
      merchantUserId: order.userId.toString(),
      amount: order.totalAmount * 100, // paise
      redirectUrl: process.env.PHONEPE_REDIRECT_URL,
      redirectMode: "POST",
      callbackUrl: process.env.PHONEPE_CALLBACK_URL,
      paymentInstrument: {
        type: "UPI_INTENT",
      },
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");

    const checksum =
      crypto
        .createHash("sha256")
        .update(
          base64Payload + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY
        )
        .digest("hex") +
      "###" +
      process.env.PHONEPE_SALT_INDEX;

    const response = await axios.post(
      `${process.env.PHONEPE_BASE_URL}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
        },
      }
    );

    const redirectUrl =
      response.data?.data?.instrumentResponse?.redirectInfo?.url;

    if (!redirectUrl) {
      console.error("PhonePe redirect URL missing", response.data);
      return res.redirect("/checkout");
    }

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("PhonePe initiate error:", error);
    return res.redirect("/checkout");
  }
});

/**
 * ----------------------------------------
 * PHONEPE – USER REDIRECT (POST)
 * POST /payment/phonepe/redirect
 * ----------------------------------------
 * ⚠️ This is NOT trusted for payment success
 */
router.post("/phonepe/redirect", async (req, res) => {
  try {
    // User just returns to site after payment attempt
    return res.redirect("/orders");
  } catch (error) {
    console.error("PhonePe redirect error:", error);
    return res.redirect("/checkout");
  }
});

/**
 * ----------------------------------------
 * PHONEPE – CALLBACK (SERVER TO SERVER)
 * POST /payment/phonepe/callback
 * ----------------------------------------
 * ✅ THIS IS THE SOURCE OF TRUTH
 */
router.post("/phonepe/callback", async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.sendStatus(200);
    }

    const decoded = JSON.parse(
      Buffer.from(response, "base64").toString("utf8")
    );

    const {
      merchantTransactionId,
      transactionId,
      code,
    } = decoded;

    const order = await Order.findOne({
      orderId: merchantTransactionId,
    });

    if (!order) {
      return res.sendStatus(200);
    }

    // Idempotency: already processed
    if (order.paymentStatus === "paid") {
      return res.sendStatus(200);
    }

    if (code === "PAYMENT_SUCCESS") {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.transactionId = transactionId || null;
      await order.save();
    }

    // On failure → keep order pending (NO deletion)
    return res.sendStatus(200);
  } catch (error) {
    console.error("PhonePe callback error:", error);
    return res.sendStatus(200);
  }
});

module.exports = router;
