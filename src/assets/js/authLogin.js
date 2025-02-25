document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");
  loadingSpinner.style.display = "none"; // Hide the spinner
});

document.getElementById("loginButton").addEventListener("click", function () {
  window.location.href = "/auth/start";
});
