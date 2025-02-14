// Umschalten des "Neuen Teilnehmer"-Felds
const payeeSelect = document.getElementById("payeeSelect");
const newPayeeDiv = document.getElementById("newPayeeDiv");
payeeSelect.addEventListener("change", function () {
  newPayeeDiv.style.display = this.value === "new" ? "block" : "none";
});

// Verbesserung der UX: Beim Absenden den Button deaktivieren und Feedback anzeigen
const form = document.getElementById("transactionForm");
form.addEventListener("submit", function () {
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Bitte warten...";
});
