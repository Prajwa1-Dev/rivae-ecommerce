const Order = require("../models/Order");

async function generateInvoice() {
  const lastOrder = await Order.findOne({
    "invoice.number": { $exists: true }
  })
    .sort({ createdAt: -1 })
    .select("invoice.number")
    .lean();

  let next = 1;

  if (lastOrder?.invoice?.number) {
    const lastNum = parseInt(lastOrder.invoice.number.split("-").pop(), 10);
    next = lastNum + 1;
  }

  return {
    number: `RIVAE-INV-${String(next).padStart(4, "0")}`,
    date: new Date(),
    gstNumber: "GSTIN-DUMMY-0000",
    brandAddress: "RIVAE, Nippani, India",
    currency: "INR",
  };
}

module.exports = generateInvoice;
