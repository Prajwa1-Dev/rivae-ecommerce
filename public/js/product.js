document.querySelectorAll("button[data-size]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("selectedSize").value = btn.dataset.size;

    document.querySelectorAll("button[data-size]").forEach(b =>
      b.classList.remove("bg-black", "text-white")
    );

    btn.classList.add("bg-black", "text-white");
  });
});
