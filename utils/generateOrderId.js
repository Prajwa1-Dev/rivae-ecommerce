const generateOrderId = () => {
  const date = Date.now().toString().slice(-5); // time-based entropy
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digits

  return `RIVAE-ORD-${date}-${random}`;
};

module.exports = generateOrderId;
