document.addEventListener("DOMContentLoaded",()=>{
    const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("nav");

  // Menu toggle functionality
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
});