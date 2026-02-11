const express = require("express");
const router = express.Router();
const transporter = require("../utils/mailer");

// GET Contact Page
router.get("/contact", (req, res) => {
  res.render("contact", {
    pageTitle: "Contact",
  });
});

// POST Contact Form
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Email to Admin
    await transporter.sendMail({
      from: `"RIVAE Contact" <${process.env.EMAIL_USER}>`,
      to: "support@rivae.in", // change later if needed
      subject: "New Contact Message - RIVAE",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Auto-reply to user (optional but premium)
    await transporter.sendMail({
      from: `"RIVAE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message – RIVAE",
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for contacting <strong>RIVAE</strong>.</p>
        <p>Our team will get back to you shortly.</p>
        <br>
        <p>— Team RIVAE</p>
      `,
    });

    res.redirect("/contact?success=true");

  } catch (error) {
    console.error("Contact email error:", error);
    res.redirect("/contact?error=true");
  }
});

module.exports = router;
