document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");
  loadingSpinner.style.display = "none"; // Hide the spinner
  const toggleDebugButton = document.getElementById("toggleDebugMode");
  const toggleDiscordDebugButton =
    document.getElementById("toggleDiscordDebug");
  const saveWebhookUrlButton = document.getElementById("saveWebhookUrl");
  const discordWebhookUrlInput = document.getElementById("discordWebhookUrl");

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

  saveWebhookUrlButton.addEventListener("click", async () => {
    const webhookUrl = discordWebhookUrlInput.value;

    try {
      const response = await fetch("/admin/discord/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhookUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Show success message
        alert("Webhook URL updated successfully.");
      } else {
        alert("Error updating webhook URL.");
      }
    } catch (error) {
      console.error("Error updating webhook URL:", error);
      alert("Error updating webhook URL.");
    }
  });
});
