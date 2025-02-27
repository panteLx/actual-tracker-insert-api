document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");

  // Function to hide spinner with fade out
  const hideSpinner = () => {
    loadingSpinner.classList.add("hidden");
    // Remove from DOM after animation completes
    setTimeout(() => {
      loadingSpinner.style.display = "none";
    }, 300);
  };

  // Hide spinner when all resources are loaded
  if (document.readyState === "complete") {
    hideSpinner();
  } else {
    window.addEventListener("load", hideSpinner);
  }

  // Fallback: Hide spinner after 2 seconds maximum
  setTimeout(hideSpinner, 2000);

  // Theme toggle functionality
  const themeSwitch = document.getElementById("themeSwitch");

  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Set initial theme based on saved preference or device setting
  if (savedTheme === "dark" || (savedTheme === null && prefersDark)) {
    themeSwitch.checked = true;
  } else {
    themeSwitch.checked = false;
  }

  // Handle theme toggle changes
  themeSwitch.addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  });

  // Listen for device preference changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      // Only apply if user hasn't set a preference
      if (!localStorage.getItem("theme")) {
        if (e.matches) {
          document.documentElement.classList.add("dark-theme");
          themeSwitch.checked = true;
        } else {
          document.documentElement.classList.remove("dark-theme");
          themeSwitch.checked = false;
        }
      }
    });
});
