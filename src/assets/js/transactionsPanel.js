const searchInput = document.getElementById("transactionSearch");
const logEntries = document.querySelectorAll("#transaction-entry");

function filterTransactions() {
  const searchTerm = searchInput.value.toLowerCase();
  const now = new Date().getTime();

  logEntries.forEach((entry) => {
    const text = entry.textContent.toLowerCase();

    const showBySearch = text.includes(searchTerm);

    entry.style.display = showBySearch ? "flex" : "none";
  });
}

searchInput.addEventListener("input", filterTransactions);
