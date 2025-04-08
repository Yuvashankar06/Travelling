let allGuides = [];
let itinerary = [];

document.addEventListener("DOMContentLoaded", () => {
  const availableDestinationsList = document.getElementById("availableDestinationsList");
  const destinationList = document.getElementById("destinationList");
  const saveBtn = document.getElementById("saveItinerary");
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("nav");

  // Menu toggle functionality
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  // Fetch travel guides
  fetch('https://67eba8c5aa794fb3222b15df.mockapi.io/Stories')
    .then(res => res.json())
    .then(data => {
      allGuides = data;
      renderGuides(data);
      setupGuideFilters(); // setup filters after data load
      const category = new URLSearchParams(window.location.search).get("category");
    if (category) {
      const targetBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
      if (targetBtn) {
        targetBtn.click();
      }
    }
    });

  // Fetch destinations
  fetch("https://67eba8c5aa794fb3222b15df.mockapi.io/Destination")
    .then(res => res.json())
    .then(destinations => {
      setupWeatherWidget(destinations);
      renderAvailableDestinations(destinations);

      const saved = JSON.parse(localStorage.getItem("itinerary"));
      itinerary = saved?.length ? saved : [];
      renderItinerary();
    });

  // Render travel guides
  function renderGuides(guides) {
    const container = document.getElementById("guideCards");
    container.innerHTML = guides.map(guide => `
      <div class="guide-card">
        <h3>${guide.title}</h3>
        <p><strong>${guide.author}</strong></p>
        <p>${guide.description}</p>
        <button>Read More</button>
      </div>
    `).join('');
  }

  // Setup filtering buttons
  function setupGuideFilters() {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const selectedCategory = button.dataset.category;
        const filteredGuides = selectedCategory === "all"
          ? allGuides
          : allGuides.filter(guide =>
              guide.category?.toLowerCase() === selectedCategory.toLowerCase()
            );

        renderGuides(filteredGuides);
      });
    });
  }

  // Render available destinations
  function renderAvailableDestinations(destinations) {
    availableDestinationsList.innerHTML = "";
    destinations.forEach(dest => {
      const li = document.createElement("li");
      li.textContent = dest.name;
      li.classList.add("available");
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handleDragStart);
      availableDestinationsList.appendChild(li);
    });
  }

  // Render itinerary list
  function renderItinerary() {
    destinationList.innerHTML = "";
    itinerary.forEach(dest => {
      const li = document.createElement("li");
      li.textContent = dest;
      li.classList.add("itinerary");
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handleDragStart);
      li.addEventListener("dragend", handleDragEnd);
      destinationList.appendChild(li);
    });
  }

  let draggedItem = null;

  // Drag handlers
  function handleDragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging");
    updateItineraryFromDOM();
  }

  destinationList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(destinationList, e.clientY);
    const dragging = document.querySelector(".dragging");
    if (afterElement == null) {
      destinationList.appendChild(dragging);
    } else {
      destinationList.insertBefore(dragging, afterElement);
    }
  });

  destinationList.addEventListener("drop", (e) => {
    e.preventDefault();
    const name = draggedItem.textContent;
    if (!itinerary.includes(name)) {
      itinerary.push(name);
      renderItinerary();
    } else {
      updateItineraryFromDOM();
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function updateItineraryFromDOM() {
    itinerary = [...destinationList.children].map(li => li.textContent);
  }

  // Save itinerary
  saveBtn.addEventListener("click", () => {
    localStorage.setItem("itinerary", JSON.stringify(itinerary));
    alert("Itinerary saved!");
  });

  // Weather widget
  function setupWeatherWidget(destinations) {
    const select = document.getElementById("weatherCity");
    const output = document.getElementById("weatherOutput");

    select.innerHTML = "";
    destinations.forEach(dest => {
      const option = document.createElement("option");
      option.value = dest.name;
      option.textContent = dest.name;
      select.appendChild(option);
    });

    updateWeather(destinations, select.value);

    select.addEventListener("change", () => {
      updateWeather(destinations, select.value);
    });
  }

  function updateWeather(destinations, selectedCity) {
    const output = document.getElementById("weatherOutput");
    const destination = destinations.find(d => d.name === selectedCity);

    if (destination?.weather) {
      const { main, temp, description } = destination.weather;
      output.innerHTML = `
        <strong>Condition:</strong> ${main}<br />
        <strong>Temperature:</strong> ${temp}°C<br />
        <strong>Description:</strong> ${description}
      `;
    } else {
      output.textContent = "Weather data not available.";
    }
  }

  // Load saved checklist state
  const checklistItems = document.querySelectorAll("#checklist input[type='checkbox']");
  const STORAGE_KEY = "packingChecklist";

  // Load checklist state from localStorage
  const savedChecklist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  checklistItems.forEach((checkbox) => {
    // Set checkbox checked state from saved array
    checkbox.checked = savedChecklist.includes(checkbox.id);

    // Update array on change
    checkbox.addEventListener("change", () => {
      const updatedChecklist = Array.from(checklistItems)
        .filter(item => item.checked)
        .map(item => item.id);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklist));
    });
  });


});
