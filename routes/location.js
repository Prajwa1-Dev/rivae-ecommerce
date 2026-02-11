const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/detect", async (req, res) => {
  try {
    const response = await axios.get("https://ipapi.co/json/");
    const data = response.data;

    return res.json({
      city: data.city,
      state: data.region,
      pincode: data.postal
    });
  } catch (err) {
    console.error("Location error:", err.message);
    return res.status(500).json({ error: "Location detection failed" });
  }
});

module.exports = router;
