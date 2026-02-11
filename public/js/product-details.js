document.addEventListener("DOMContentLoaded", () => {
  const sizeButtons = document.querySelectorAll(".size-btn");
  const sizeInput = document.getElementById("selectedSize");
  const form = document.getElementById("addToCartForm");

  if (!sizeButtons.length || !sizeInput || !form) return;

  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // reset styles
      sizeButtons.forEach((b) => {
        b.classList.remove("bg-black", "text-white", "border-black");
      });

      // activate selected
      btn.classList.add("bg-black", "text-white", "border-black");
      sizeInput.value = btn.dataset.size;
    });
  });

  form.addEventListener("submit", (e) => {
    if (!sizeInput.value) {
      e.preventDefault();
      alert("Please select a size");
    }
  });
});
