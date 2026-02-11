// document.addEventListener("DOMContentLoaded", () => {
//   const sidebar = document.getElementById("sidebar");
//   const toggle = document.getElementById("menuToggle");
//   const overlay = document.getElementById("sidebarOverlay");

//   if (!sidebar || !toggle || !overlay) return;

//   toggle.addEventListener("click", () => {
//     sidebar.classList.remove("-translate-x-full");
//     overlay.classList.remove("hidden");
//   });

//   overlay.addEventListener("click", () => {
//     sidebar.classList.add("-translate-x-full");
//     overlay.classList.add("hidden");
//   });
// });
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");
const toggleBtn = document.getElementById("menuToggle");

function openSidebar() {
  sidebar.classList.remove("-translate-x-full");
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  overlay.classList.add("hidden");
  document.body.style.overflow = "";
}

toggleBtn?.addEventListener("click", openSidebar);
overlay?.addEventListener("click", closeSidebar);

// Close on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSidebar();
  }
});

// Safety: reset on resize
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    closeSidebar();
  }
});

