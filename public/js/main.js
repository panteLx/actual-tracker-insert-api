document.addEventListener("DOMContentLoaded", () => {
  const isDebugMode = document.body.dataset.debugMode === "true";
  const payeeSelect = document.getElementById("payeeSelect");
  const newPayeeDiv = document.getElementById("newPayeeDiv");
  if (payeeSelect && newPayeeDiv) {
    payeeSelect.addEventListener("change", function () {
      newPayeeDiv.style.display = this.value === "new" ? "block" : "none";
    });
  }

  const form = document.getElementById("transactionForm");
  if (form) {
    form.addEventListener("submit", function () {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Bitte warten...";
      }
    });
  }

  const alerts = document.querySelectorAll(".alert.success, .alert.debug");

  function clearAlertsAndURL() {
    alerts.forEach((alert) => {
      alert.style.display = "none";
    });

    if (window.history && window.history.replaceState) {
      const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  if (!isDebugMode && alerts.length > 0) {
    setTimeout(clearAlertsAndURL, 5000); // Clear alerts after 5 seconds in non-debug mode
  }
});
