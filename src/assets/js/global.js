document.addEventListener("DOMContentLoaded", function () {
  const loadingSpinner = document.getElementById("loading");
  setTimeout(() => {
    loadingSpinner.classList.add("hidden");
  }, 300);

  // Theme toggle functionality
  const themeSwitch = document.getElementById("themeSwitch");

  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Set initial theme based on saved preference or device setting
  if (savedTheme === "dark" || (savedTheme === null && prefersDark)) {
    document.documentElement.classList.add("dark-theme");
    themeSwitch.checked = true;
  } else {
    document.documentElement.classList.remove("dark-theme");
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
