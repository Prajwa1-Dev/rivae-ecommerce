document.addEventListener("DOMContentLoaded", () => {
  const cancelBtn = document.querySelector(".cancel-order-btn");
  if (!cancelBtn) return;

  cancelBtn.addEventListener("click", async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmed) return;

    const orderId = cancelBtn.dataset.orderId;
    if (!orderId) {
      alert("Invalid order. Please refresh the page.");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Reload to reflect updated order status
        window.location.reload();
      } else {
        alert(data.message || "Unable to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert("Something went wrong. Please try again.");
    }
  });
});
