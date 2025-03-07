const searchInput = document.getElementById("scheduleSearch");
const logEntries = document.querySelectorAll("#schedule-entry");

function filterSchedules() {
  const searchTerm = searchInput.value.toLowerCase();
  const now = new Date().getTime();

  logEntries.forEach((entry) => {
    const text = entry.textContent.toLowerCase();

    const showBySearch = text.includes(searchTerm);

    entry.style.display = showBySearch ? "flex" : "none";
  });
}

searchInput.addEventListener("input", filterSchedules);
