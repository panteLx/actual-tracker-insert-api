document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");
  setTimeout(() => {
    loadingSpinner.classList.add("hidden");
  }, 300);
});
