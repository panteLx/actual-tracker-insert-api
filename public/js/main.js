document.addEventListener("DOMContentLoaded", () => {
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

  // Nach 10 Sekunden Alert-Nachrichten ausblenden und URL zurücksetzen
  setTimeout(() => {
    // Alert-Elemente (Success & Debug) verstecken
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => (alert.style.display = "none"));

    // URL ohne Query-Parameter setzen
    if (window.history && window.history.replaceState) {
      const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, 10000);
});
