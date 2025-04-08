let allDestinations = [];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("destinationCards");
  const buttons = document.querySelectorAll(".filter-btn");
  const searchBox = document.getElementById("searchBox");
  const autocompleteList = document.getElementById("autocomplete-list");
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("nav");

  // Initialize map
  const map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  function renderDestinations(data, query = "") {
    const highlight = (text, term) => {
      if (!term) return text;
      const regex = new RegExp(`(${term})`, "gi");
      return text.replace(regex, `<span class="highlight">$1</span>`);

    };

    grid.innerHTML = data.map(dest => `
      <div class="destination-card" data-category="${dest.category}">
        <img src="${dest.image}" alt="${dest.name}" />
        <div class="card-content">
          <h3>${highlight(dest.name, query)}</h3>
          <p>${highlight(dest.description, query)}</p>
          <button class="explore-btn">Explore More</button>
        </div>
      </div>
    `).join("");
  }

  function addMarkersToMap(destinations) {
    destinations.forEach(dest => {
      if (dest.coordinates && dest.coordinates.lat && dest.coordinates.lng) {
        L.marker([dest.coordinates.lat, dest.coordinates.lng]).addTo(map)
          .bindPopup(`<b>${dest.name}</b><br>${dest.description || ""}`);
      }
    });
  }

  fetch("https://67eba8c5aa794fb3222b15df.mockapi.io/Destination")
  .then(res => res.json())
  .then(data => {
    allDestinations = data;
    renderDestinations(data);
    addMarkersToMap(data);

    // ✅ Perform filtering AFTER data is ready
    const category = new URLSearchParams(window.location.search).get("category");
    if (category) {
      const targetBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
      if (targetBtn) {
        targetBtn.click();
      }
    }
  })
  .catch(err => console.error("Error fetching destinations:", err));



  // Filter by category buttons
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.dataset.category;
      const filtered = category === "all"
        ? allDestinations
        : allDestinations.filter(dest => dest.category.toLowerCase() === category);
      renderDestinations(filtered);
    });
  });

  // 🔍 Live search with keyword highlighting
  // searchBox.addEventListener("input", () => {
  //   const query = searchBox.value.toLowerCase();
  //   const filtered = allDestinations.filter(dest =>
  //     dest.name.toLowerCase().includes(query)
  //   );
  //   renderDestinations(filtered, query); // highlight match
  // });
  searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase();
    const filtered = allDestinations.filter(dest =>
      dest.name.toLowerCase().includes(query)
    );
    renderDestinations(filtered, query);
  
    // autocomplete suggestions
    autocompleteList.innerHTML = `
      <ul>
        ${filtered.map(dest => `<li>${highlight(dest.name, query)}</li>`).join("")}
      </ul>
    `;
  });
  

  // Enter key → scroll to map & zoom
  searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchBox.value.toLowerCase();
      const filtered = allDestinations.filter(dest =>
        dest.name.toLowerCase().includes(query)
      );
      renderDestinations(filtered, query);

      const matchedDest = filtered[0];
      if (matchedDest && matchedDest.coordinates) {
        document.getElementById("map-section").scrollIntoView({ behavior: "smooth" });

        map.setView(
          [matchedDest.coordinates.lat, matchedDest.coordinates.lng],
          8
        );

        L.popup()
          .setLatLng([matchedDest.coordinates.lat, matchedDest.coordinates.lng])
          .setContent(`<b>${matchedDest.name}</b><br>${matchedDest.description || ""}`)
          .openOn(map);
      } else {
        alert("Destination not found on the map.");
      }
    }
  });

  function handleSearch() {
    const query = searchBox.value.toLowerCase();
    const filtered = allDestinations.filter(dest => dest.name.toLowerCase().includes(query));

    renderDestinations(filtered);
    // autocompleteList.innerHTML = filtered.map(dest => `<li>${dest.name}</li>`).join("");
    autocompleteList.innerHTML = `
  <ul>
    ${filtered.map(dest => `<li>${highlight(dest.name, query)}</li>`).join("")}
  </ul>
`;

}

function handleAutocompleteClick(e) {
    if (e.target.tagName === "LI") {
        searchBox.value = e.target.textContent;
        autocompleteList.innerHTML = "";
        handleSearch();
    }
}

function handleSearchEnter(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
        autocompleteList.innerHTML = "";
        document.getElementById("destinationCards").scrollIntoView({ behavior: "smooth" });

    }
}
autocompleteList.addEventListener("click", handleAutocompleteClick);
searchBox.addEventListener("keydown", handleSearchEnter);
});
