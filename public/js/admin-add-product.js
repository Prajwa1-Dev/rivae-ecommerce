document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("input[name='images']");
  const preview = document.getElementById("imagePreview");

  if (!input || !preview) return;

  input.addEventListener("change", event => {
    preview.innerHTML = "";

    Array.from(event.target.files).forEach(file => {
      const reader = new FileReader();

      reader.onload = e => {
        const div = document.createElement("div");
        div.className =
          "overflow-hidden rounded-xl border bg-neutral-100";

        div.innerHTML = `
          <img src="${e.target.result}"
               class="w-full h-40 object-cover" />
        `;

        preview.appendChild(div);
      };

      reader.readAsDataURL(file);
    });
  });
});
