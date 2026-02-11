const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// =====================
// GET CONTACT PAGE
// =====================
router.get("/contact", (req, res) => {
  res.render("contact", {
    pageTitle: "Contact",
  });
});

// =====================
// POST CONTACT FORM
// =====================
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    req.flash("error", "All fields are required");
    return res.redirect("/contact");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT), // ✅ ensure number
      secure: false, // TLS for Gmail (587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"RIVAE Contact" <${process.env.EMAIL_USER}>`,

      // ✅ CRITICAL FIX (fallback included)
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,

      // ✅ reply directly to customer
      replyTo: email,

      subject: `New Contact Message – ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    req.flash("success", "Message sent successfully!");
    res.redirect("/contact");
  } catch (error) {
    console.error("❌ Contact email error:", error);
    req.flash("error", "Failed to send message. Try again later.");
    res.redirect("/contact");
  }
});


module.exports = router;
