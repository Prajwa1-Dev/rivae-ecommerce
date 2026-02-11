const PDFDocument = require("pdfkit");
const path = require("path");

/**
 * Generate Invoice PDF
 * @param {Object} order - Order document
 * @param {Object} res - Express response
 */
function generateInvoicePDF(order, res) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // -----------------------
  // RESPONSE HEADERS
  // -----------------------
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${order.invoice.number}.pdf`
  );

  doc.pipe(res);

  // -----------------------
  // HEADER (LOGO + BRAND)
  // -----------------------
  const logoPath = path.join(
    __dirname,
    "../public/images/rivae-logo.png"
  );

  // Logo
  doc.image(logoPath, 50, 45, { width: 80 });

  // Brand name
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("RIVAE", 150, 50);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("gray")
    .text("Premium Menswear", 150, 75);

  doc.moveDown(3);

  // -----------------------
  // INVOICE META
  // -----------------------
  doc
    .fillColor("black")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Invoice", { align: "right" });

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`Invoice Number: ${order.invoice.number}`, { align: "right" })
    .text(`Invoice Date: ${order.invoice.date.toDateString()}`, {
      align: "right",
    });

  doc.moveDown(2);

  // -----------------------
  // BILL TO
  // -----------------------
  doc.font("Helvetica-Bold").text("Bill To:");
  doc.font("Helvetica").text(order.address.name);
  doc.text(order.address.line1);
  doc.text(
    `${order.address.city}, ${order.address.state} - ${order.address.pincode}`
  );
  doc.text(`Phone: ${order.address.phone}`);

  doc.moveDown(2);

  // -----------------------
  // TABLE HEADER
  // -----------------------
  const tableTop = doc.y;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Item", 50, tableTop);
  doc.text("Qty", 300, tableTop);
  doc.text("Price", 350, tableTop);
  doc.text("Total", 430, tableTop);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  // -----------------------
  // TABLE ROWS
  // -----------------------
  doc.font("Helvetica").fontSize(10);

  let positionY = doc.y + 5;

  order.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;

    doc.text(item.title, 50, positionY);
    doc.text(item.quantity.toString(), 300, positionY);
    doc.text(`₹${item.price}`, 350, positionY);
    doc.text(`₹${itemTotal}`, 430, positionY);

    positionY += 20;
  });

  doc.moveDown(3);

  // -----------------------
  // TOTALS
  // -----------------------
  doc
    .font("Helvetica-Bold")
    .text(`Grand Total: ₹${order.totalAmount}`, {
      align: "right",
    });

  doc.moveDown(1);

  // -----------------------
  // GST & FOOTER INFO
  // -----------------------
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("gray")
    .text(`GST Number: ${order.invoice.gstNumber}`)
    .text(`Currency: ${order.invoice.currency}`)
    .text(`Address: ${order.invoice.brandAddress}`);

  doc.moveDown(2);

  doc
    .fontSize(8)
    .text(
      "This is a system-generated invoice and does not require a signature.",
      { align: "center" }
    );

  // -----------------------
  // FINALIZE PDF
  // -----------------------
  doc.end();
}

module.exports = generateInvoicePDF;
