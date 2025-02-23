document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");
  loadingSpinner.style.display = "none"; // Hide the spinner
  const toggleDebugButton = document.getElementById("toggleDebugMode");
  const toggleDiscordDebugButton =
    document.getElementById("toggleDiscordDebug");

  toggleDebugButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/admin/debug/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Show success message
        window.location.reload(); // Reload the page to reflect changes
      } else {
        alert("Fehler beim Ändern des Debug-Modus");
      }
    } catch (error) {
      console.error("Error toggling debug mode:", error);
      alert("Fehler beim Ändern des Debug-Modus");
    }
  });

  toggleDiscordDebugButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/admin/debug/discord/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Show success message
        window.location.reload(); // Reload the page to reflect changes
      } else {
        alert("Fehler beim Ändern des Discord Debug-Modus");
      }
    } catch (error) {
      console.error("Error toggling Discord debug mode:", error);
      alert("Fehler beim Ändern des Discord Debug-Modus");
    }
  });
});
