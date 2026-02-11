const sidebar = document.getElementById("adminSidebar");
const overlay = document.getElementById("adminSidebarOverlay");
const toggleBtn = document.getElementById("adminMenuToggle");

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

// ESC key support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSidebar();
});

// Safety reset on resize
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) closeSidebar();
});
