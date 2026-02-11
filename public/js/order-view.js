document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".cancel-order-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const orderId = btn.dataset.orderId;

    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Order cancelled successfully");
        window.location.reload();
      } else {
        alert(data.message || "Unable to cancel order");
      }
    } catch {
      alert("Something went wrong");
    }
  });
});
