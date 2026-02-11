document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap) return;

  gsap.fromTo(
    ".auth-card",
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
  );
});
