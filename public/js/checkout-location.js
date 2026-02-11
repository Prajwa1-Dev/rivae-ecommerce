document.addEventListener("DOMContentLoaded", () => {
  const approxBtn = document.getElementById("detectLocationBtn");
  const exactBtn = document.getElementById("detectExactLocationBtn");

  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const pincode = document.getElementById("pincode");
  const street = document.querySelector('input[name="street"]');

  // -----------------------------
  // APPROXIMATE (IP-BASED)
  // -----------------------------
  if (approxBtn) {
    approxBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/location/detect");
        const data = await res.json();

        city.value = data.city || "";
        state.value = data.state || "";
        pincode.value = data.pincode || "";

      } catch (err) {
        alert("Unable to detect location");
      }
    });
  }

  // -----------------------------
  // EXACT LOCATION (GPS)
  // -----------------------------
  if (exactBtn) {
    exactBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported on this device");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();

            const address = data.address || {};

            if (street) {
              street.value =
                address.road ||
                address.neighbourhood ||
                address.suburb ||
                "";
            }

            city.value =
              address.city ||
              address.town ||
              address.village ||
              "";

            state.value = address.state || "";
            pincode.value = address.postcode || "";

          } catch (err) {
            alert("Failed to fetch address from coordinates");
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Location permission denied");
          } else {
            alert("Unable to retrieve your location");
          }
        }
      );
    });
  }
});
