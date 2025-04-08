document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchBox");
    const autocompleteList = document.getElementById("autocomplete-list");
    const destinationContainer = document.getElementById("destinations");
    const storyContainer = document.getElementById("story-slider");
    let destinations = [];
    let stories = [];
    let currentStoryIndex = 0;
    let currentIndex = 0;
    const highlight = (text, term) => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, "gi");
        return text.replace(regex, `<span class="highlight">$1</span>`);
  
      };

    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector("nav");
  
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
    });

    // 🔁 Auto-filter by hash if present in URL
    async function fetchDestinations() {
        try {
            const response = await fetch("https://67eba8c5aa794fb3222b15df.mockapi.io/Destination"); 
            const data = await response.json();
            console.log("Fetched Destinations:", data);

            if (Array.isArray(data)) {
                destinations = data;
                renderDestinations(destinations);
            } else {
                console.error("Unexpected API response format:", data);
            }
        } catch (error) {
            console.error("Error fetching destinations:", error);
        }
    }

    function renderDestinations(data,query="") {
        destinationContainer.innerHTML = data
            .map(dest => `
                <div class="destination-card">
                    <img src="${dest.image}" alt="${dest.name}">
                    <h3>${highlight(dest.name,query)}</h3>
                </div>
            `).join("");
    }

    async function fetchStories() {
        try {
            // const response = await fetch("https://67eba8c5aa794fb3222b15df.mockapi.io/Stories");
            const response=await fetch("https://67f015332a80b06b8896d88f.mockapi.io/Travel");
            stories = await response.json();
            renderStory();
            setInterval(renderStory, 3000);
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    }

    function renderStory() {
        if (!stories.length) return;
        storyContainer.innerHTML=`
        <div class="post">
            <img class="avatar" src="${stories[currentIndex].avatar}" alt="${stories[currentIndex].author}" />
            <div class="content">
              <strong>${stories[currentIndex].author}</strong><br />
              ${stories[currentIndex].content}
            </div>
          </div>
          `;

        currentStoryIndex = (currentStoryIndex + 1) % stories.length;
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        const filtered = destinations.filter(dest => dest.name.toLowerCase().includes(query));

        renderDestinations(filtered,query);
        autocompleteList.innerHTML = `
        <ul>
            ${filtered.map(dest => `<li data-name="${dest.name}">${highlight(dest.name, query)}</li>`).join("")}
        </ul>`
        ;

    }

    function handleAutocompleteClick(e) {
        if (e.target.tagName === "LI") {
            searchInput.value = e.target.getAttribute("data-name");
            autocompleteList.innerHTML = "";
            handleSearch();
        }
    }
    
    function handleSearchEnter(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
            autocompleteList.innerHTML = "";
            destinationContainer.scrollIntoView({ behavior: "smooth" });
        }
    }

    function setupSlider() {
        const slides = document.querySelectorAll(".slide");
        const prevBtn = document.querySelector(".prev");
        const nextBtn = document.querySelector(".next");

        if (!slides.length) return;

        function changeSlide(direction) {
            slides[currentIndex].classList.remove("active");
            currentIndex = (currentIndex + direction + slides.length) % slides.length;
            slides[currentIndex].classList.add("active");
        }

        prevBtn?.addEventListener("click", () => changeSlide(-1));
        nextBtn?.addEventListener("click", () => changeSlide(1));

        setInterval(() => changeSlide(1), 5000);
    }

    searchInput?.addEventListener("input", handleSearch);
    searchInput?.addEventListener("keydown", handleSearchEnter);
    autocompleteList?.addEventListener("click", handleAutocompleteClick);

    fetchDestinations();
    fetchStories();
    setupSlider();
});

