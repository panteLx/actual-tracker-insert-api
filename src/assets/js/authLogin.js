document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");
  setTimeout(() => {
    loadingSpinner.classList.add("hidden");
  }, 300);
});

document.getElementById("loginButton").addEventListener("click", function () {
  window.location.href = "/auth/start";
});
