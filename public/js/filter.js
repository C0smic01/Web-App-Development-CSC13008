const toggleButtons = document.querySelectorAll(".toggle-section");

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
const fetchData = (subQuery = "") => {
  const filters = document.querySelectorAll(".filter");
  let queryString = "";
  filters.forEach((filter) => {
    if (filter.classList.contains("selected")) {
      queryString += filter.dataset.query + "&";
    }
  });
  if (subQuery.length > 0) {
    queryString += subQuery + "&";
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

document.querySelector(".search-btn").addEventListener("click", () => {
  const searchBar = document.querySelector("#search-input");
  fetchData(`${searchBar.name}=${searchBar.value}`);
});
