document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");
  setTimeout(() => {
    loadingSpinner.classList.add("hidden");
  }, 300);
  const toggleDebugButton = document.getElementById("toggleDebugMode");
  const toggleDiscordDebugButton =
    document.getElementById("toggleDiscordDebug");
  const saveWebhookUrlButton = document.getElementById("saveWebhookUrl");
  const discordWebhookUrlInput = document.getElementById("discordWebhookUrl");
  const saveLocaleButton = document.getElementById("saveLocale");
  const localeInput = document.getElementById("locale");
  const saveTimezoneButton = document.getElementById("saveTimezone");
  const timezoneInput = document.getElementById("timezone");

  const csrfToken = document.querySelector('input[name="_csrf"]').value;

  // Update all fetch requests to include the token
  const headers = {
    "Content-Type": "application/json",
    "CSRF-Token": csrfToken,
  };

  toggleDebugButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/admin/debug/toggle", {
        method: "POST",
        headers: headers,
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
        headers: headers,
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
        headers: headers,
        body: JSON.stringify({ webhookUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Show success message
        window.location.reload(); // Reload the page to reflect changes
      } else {
        alert("Error updating webhook URL.");
      }
    } catch (error) {
      console.error("Error updating webhook URL:", error);
      alert("Error updating webhook URL.");
    }
  });

  saveLocaleButton.addEventListener("click", async () => {
    const locale = localeInput.value;

    try {
      const response = await fetch("/admin/locale", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ locale }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Show success message
        window.location.reload(); // Reload the page to reflect changes
      } else {
        alert("Error updating locale.");
      }
    } catch (error) {
      console.error("Error updating locale:", error);
      alert("Error updating locale.");
    }
  });

  saveTimezoneButton.addEventListener("click", async () => {
    const timezone = timezoneInput.value;

    try {
      const response = await fetch("/admin/timezone", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ timezone }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Show success message
        window.location.reload(); // Reload the page to reflect changes
      } else {
        alert("Error updating timezone.");
      }
    } catch (error) {
      console.error("Error updating timezone:", error);
      alert("Error updating timezone.");
    }
  });
});
