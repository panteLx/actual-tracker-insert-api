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

  const alerts = document.querySelectorAll(".alert.success, .alert.error");
  const debugAlerts = document.querySelectorAll(".alert.debug");

  function clearAlertsAndURL() {
    alerts.forEach((alert) => {
      if (!isDebugMode) {
        alert.style.display = "none";
      }
    });

    if (!isDebugMode && window.history && window.history.replaceState) {
      const currentUrl = new URL(window.location.href);
      const trackerType = currentUrl.searchParams.get("tracker");
      const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      const finalUrl = trackerType
        ? `${cleanUrl}?tracker=${trackerType}`
        : cleanUrl;
      window.history.replaceState({}, document.title, finalUrl);
    }
  }

  if (!isDebugMode) {
    setTimeout(clearAlertsAndURL, 5000);
  }
});
