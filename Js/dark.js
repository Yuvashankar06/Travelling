document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("darkModeToggle");
    const body = document.body;
    if (toggle) {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        body.classList.add("dark-mode");
        toggle.textContent = "☀️";
      } else {
        toggle.textContent = "🌙";
      }
      toggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        toggle.textContent = isDark ? "☀️" : "🌙";
      });
    }
});