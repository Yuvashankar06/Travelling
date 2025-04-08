document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const postContainer = document.getElementById("post-container");
    const loadMoreBtn = document.getElementById("load-more");
    const galleryInput = document.getElementById("gallery-upload");
    const galleryContainer = document.getElementById("gallery");
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector("nav");
    const voteButton = document.getElementById("vote-btn");
    const pollOptions = document.querySelectorAll('input[name="destination"]');
    const pollResults = document.getElementById("poll-results");
    const MAX_IMAGES = 10;
    let allPosts = [];
    let currentIndex = 0;
    const postsPerPage = 3;
    function fetchPosts() {
      return new Promise((resolve, reject) => {
        fetch("https://67f015332a80b06b8896d88f.mockapi.io/Travel")
          .then(response => {
            if (!response.ok) throw new Error("Failed to fetch posts.");
            return response.json();
          })
          .then(data => {
            allPosts = data;
            resolve();
          })
          .catch(error => {
            console.error("Error fetching posts:", error);
            reject(error);
          });
      });
    }

    function loadPosts() {
      if (!postContainer) return;
  
      const nextPosts = allPosts.slice(currentIndex, currentIndex + postsPerPage);
      nextPosts.forEach(post => {
        const postHTML = `
          <div class="post">
            <img class="avatar" src="${post.avatar}" alt="${post.author}" />
            <div class="content">
              <strong>${post.author}</strong><br />
              ${post.content}
            </div>
          </div>
        `;
        postContainer.innerHTML += postHTML;
      });
  
      currentIndex += postsPerPage;
  
      // Hide button if all posts are loaded
      if (currentIndex >= allPosts.length && loadMoreBtn) {
        loadMoreBtn.style.display = "none";
      }
    }
  
    /** -------------- Handle Load More Button -------------- **/
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", loadPosts);
    }
  
    // Fetch and display initial posts
    fetchPosts().then(() => loadPosts());
  
    /** -------------- Gallery Upload (Simulated via localStorage) -------------- **/

    function loadGallery() {
      if (!galleryContainer) return;
    
      const savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    
      // Clear previous content
      galleryContainer.innerHTML = "";
    
      savedImages.forEach(img => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("photo-container");
    
        const image = document.createElement("img");
        image.src = img;
        image.alt = "User Upload";
    
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-image";
        deleteBtn.dataset.src = img;
        deleteBtn.title = "Delete";
        deleteBtn.textContent = "✖";
    
        wrapper.appendChild(image);
        wrapper.appendChild(deleteBtn);
        galleryContainer.appendChild(wrapper);
      });
    }
    
    
    function compressAndStoreImage(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
    
      reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
    
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 600;
          const scaleSize = maxWidth / img.width;
    
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
    
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedData = canvas.toDataURL("image/jpeg", 0.7);
    
          try {
            let savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    
            if (savedImages.length >= MAX_IMAGES) {
              savedImages.shift(); // Remove the oldest
            }
    
            savedImages.push(compressedData);
            localStorage.setItem("galleryImages", JSON.stringify(savedImages));
    
            loadGallery();
          } catch (error) {
            console.error("Storage Error: LocalStorage is full or image is too large.");
            alert("Storage full! Try removing some images.");
          }
        };
      };
    }
    
    if (galleryInput) {
        galleryInput.addEventListener("change", event => {
          const file = event.target.files[0];
    
          if (file) {
            // Ensure file is an image
            if (!file.type.startsWith("image/")) {
              alert("Please upload a valid image file.");
              return;
            }
    
            compressAndStoreImage(file);
          }
        });
    }
    
    loadGallery();
    galleryContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-image")) {
        const srcToDelete = e.target.dataset.src;
        let savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    
        savedImages = savedImages.filter(img => img !== srcToDelete);
        localStorage.setItem("galleryImages", JSON.stringify(savedImages));
        loadGallery(); // Refresh the gallery view
      }
    });
    
  
    /** -------------- Poll System -------------- **/
    function loadPollResults() {
        const votes = JSON.parse(localStorage.getItem("pollVotes")) || {
          Paris: 0,
          Bali: 0,
          Tokyo: 0,
          NewYork: 0
        };
    
        pollResults.innerHTML = `
          <p>🌍 Paris: ${votes.Paris} votes</p>
          <p>🏝️ Bali: ${votes.Bali} votes</p>
          <p>🗼 Tokyo: ${votes.Tokyo} votes</p>
          <p>🗽 New York: ${votes.NewYork} votes</p>
        `;
    }
    if (voteButton) {
        voteButton.addEventListener("click", () => {
          let selectedOption;
          pollOptions.forEach(option => {
            if (option.checked) {
              selectedOption = option.value;
            }
          });
    
          if (!selectedOption) {
            alert("Please select an option before voting!");
            return;
          }
    
          let votes = JSON.parse(localStorage.getItem("pollVotes")) || {
            Paris: 0,
            Bali: 0,
            Tokyo: 0,
            NewYork: 0
          };
    
          // Update vote count
          votes[selectedOption]++;
          localStorage.setItem("pollVotes", JSON.stringify(votes));
    
          alert("Thank you for voting!");
          loadPollResults();
        });
    }
    
    loadPollResults();
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
    });



    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");
    const amount = document.getElementById("amount");
    const result = document.getElementById("result");
    const convertBtn = document.getElementById("convertBtn");

// Static currency list
const currencyList = ["USD", "EUR", "INR", "GBP", "JPY", "CAD", "AUD"];

currencyList.forEach(curr => {
  const option1 = document.createElement("option");
  option1.value = option1.textContent = curr;

  const option2 = document.createElement("option");
  option2.value = option2.textContent = curr;

  fromCurrency.appendChild(option1);
  toCurrency.appendChild(option2);
});

fromCurrency.value = "USD";
toCurrency.value = "INR";
convertBtn.addEventListener("click", () => {
  const amountValue = parseFloat(amount.value);
  if (isNaN(amountValue) || amountValue <= 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  const from = fromCurrency.value;
  const to = toCurrency.value;

  // ✋ Prevent conversion if both currencies are the same
  if (from === to) {
    result.textContent = "Please select different currencies for conversion.";
    return;
  }

  fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    .then(response => response.json())
    .then(data => {
      const rate = data.rates[to];
      const converted = (amountValue * rate).toFixed(2);
      result.textContent = `${amountValue} ${from} = ${converted} ${to}`;
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      result.textContent = "Conversion failed. Try again later.";
    });
});    
});
  