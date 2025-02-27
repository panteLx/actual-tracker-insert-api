const searchInput = document.getElementById("logSearch");
const levelSelect = document.getElementById("logLevel");
const timeRangeSelect = document.getElementById("timeRange");
const sortOrderSelect = document.getElementById("sortOrder");
const clearLogsButton = document.getElementById("clearLogs");
const clearLogLevelSelect = document.getElementById("clearLogLevel");
const logEntries = document.querySelectorAll(".log-entry");
const logEntriesContainer = document.getElementById("logEntries");

const csrfToken = document.querySelector('input[name="_csrf"]').value;

// Update all fetch requests to include the token
const headers = {
  "Content-Type": "application/json",
  "CSRF-Token": csrfToken,
};

function filterLogs() {
  const searchTerm = searchInput.value.toLowerCase();
  const level = levelSelect.value;
  const timeRange = timeRangeSelect.value;
  const sortOrder = sortOrderSelect.value;
  const now = new Date().getTime();

  const visibleEntries = Array.from(logEntries).filter((entry) => {
    const text = entry.textContent.toLowerCase();
    const entryLevel = entry.dataset.level;
    const timestamp = new Date(entry.dataset.timestamp).getTime();

    let showByTime = true;
    if (timeRange !== "all") {
      const ranges = {
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
      };
      showByTime = now - timestamp <= ranges[timeRange];
    }

    const showByLevel = level === "all" || entryLevel === level;
    const showBySearch = text.includes(searchTerm);

    entry.style.display =
      showByLevel && showBySearch && showByTime ? "block" : "none";
    return showByLevel && showBySearch && showByTime;
  });

  // Sort visible entries
  visibleEntries.sort((a, b) => {
    const timeA = new Date(a.dataset.timestamp).getTime();
    const timeB = new Date(b.dataset.timestamp).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  // Reorder DOM elements
  visibleEntries.forEach((entry) => logEntriesContainer.appendChild(entry));
}

clearLogsButton.addEventListener("click", async () => {
  if (!confirm("Bist du sicher, dass du die Logs löschen möchtest?")) return;

  const level = clearLogLevelSelect.value;

  try {
    const response = await fetch("/api/admin/logs/clear", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ level }),
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Fehler beim Löschen der Logs");
    }
  } catch (error) {
    console.error("Error clearing logs:", error);
    alert("Fehler beim Löschen der Logs");
  }
});

searchInput.addEventListener("input", filterLogs);
levelSelect.addEventListener("change", filterLogs);
timeRangeSelect.addEventListener("change", filterLogs);
sortOrderSelect.addEventListener("change", filterLogs);

// Add mobile toggle functionality
const mobileToggle = document.querySelector(".log-controls-mobile-toggle");
const controlsContent = document.querySelector(".log-controls-content");

mobileToggle.addEventListener("click", () => {
  controlsContent.classList.toggle("show");
  mobileToggle.classList.toggle("active");
});

// Close controls when clicking outside
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".log-controls") &&
    controlsContent.classList.contains("show")
  ) {
    controlsContent.classList.remove("show");
    mobileToggle.classList.remove("active");
  }
});
