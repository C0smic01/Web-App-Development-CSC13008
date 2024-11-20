const toggleButtons = document.querySelectorAll(".toggle-section");

// Handle toggle hidden sections when clicking on the title
toggleButtons.forEach((button) => {
  let isClicked = false;

  button.addEventListener("mouseenter", () => {
    if (!isClicked) {
      const img = button.querySelector("img");
      img.src = "./img/arrow-down-hover.png";
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!isClicked) {
      const img = button.querySelector("img");
      img.src = "./img/arrow-down.png";
    }
  });

  button.addEventListener("click", () => {
    const contentSection = button.nextElementSibling;
    const img = button.querySelector("img");
    isClicked = !isClicked;

    if (isClicked) {
      img.src = "./img/arrow-down-hover.png";
      img.classList.add("rotate-180");
      contentSection.classList.remove("max-h-0");
      contentSection.classList.add("max-h-[500px]", "py-4");
    } else {
      img.src = "./img/arrow-down.png";
      img.classList.remove("rotate-180");
      contentSection.classList.remove("max-h-[500px]", "py-4");
      contentSection.classList.add("max-h-0");
    }
  });
});

// Fetch data via AJAX
const fetchData = () => {
  const filters = document.querySelectorAll(".filter");
  let queryString = "";

  // Foreach checkboxes
  filters.forEach((filter) => {
    if (filter.classList.contains("selected")) {
      queryString += filter.dataset.query + "&";
    }
  });

  // Concat the price's query
  const priceInputs = document.querySelectorAll(".price-filter");
  priceInputs.forEach((input) => {
    const name = input.name;
    const value = input.value;
    if (value) {
      queryString += `${name}=${value}&`;
    }
  });

  // Concat the search's query
  const searchInput = document.querySelector("#search-input");
  if (searchInput.value) {
    queryString += `${searchInput.name}=${searchInput.value}&`;
  }

  queryString = queryString.slice(0, -1);
  const response = fetch(`/products/partial?${queryString}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      if (data.productHtml) {
        document.querySelector("#product-list").innerHTML = data.productHtml;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

// Handle price filter when input

const priceInputs = document.querySelectorAll(".price-filter");
priceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    fetchData();
  });
});

// Handle filter when click on checkbox

const checkboxes = document.querySelectorAll(".check-box");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("click", () => {
    const selectedCheckbox = document.createElement("img");
    const img = checkbox.querySelector("div").querySelector("img");
    const h1 = checkbox.querySelector("h1");

    checkbox.classList.toggle("selected");

    if (checkbox.classList.contains("selected")) {
      const selectedCheckbox = document.createElement("img");
      selectedCheckbox.src = "./img/checkbox.png";
      selectedCheckbox.alt = "Image";
      selectedCheckbox.classList.add("w-full", "h-full");
      checkbox.querySelector("div").appendChild(selectedCheckbox);

      h1.classList.remove("text-gray-600");
      h1.classList.add("text-black");
      fetchData();
    } else {
      if (img) img.remove();
      h1.classList.remove("text-black");
      h1.classList.add("text-gray-600");
      fetchData();
    }
  });
});

// Handle when clicking search button
document.querySelector(".search-btn").addEventListener("click", () => {
  const searchBar = document.querySelector("#search-input");
  if (searchBar.value) {
    fetchData();
  }
});
