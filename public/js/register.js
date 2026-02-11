document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap) return;

  gsap.fromTo(
    ".auth-card",
    {
      opacity: 0,
      y: 50,
      scale: 0.97
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.1,
      delay: 0.15,
      ease: "power4.out"
    }
  );
});
