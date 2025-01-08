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

// Fetch data via AJAX
const fetchData = (page = 1) => {
  const currentUrl = new URL(window.location.href);
  const params = new URLSearchParams();

  params.set('page', page);

  const filters = document.querySelectorAll(".filter");

  filters.forEach((filter) => {
    if (filter.classList.contains("selected")) {
      const [key, value] = filter.dataset.query.split('=');
      if (key && value) {
        params.set(key, value); 
      }
    }
  });

  const priceInputs = document.querySelectorAll(".price-filter");
  priceInputs.forEach((input) => {
    const name = input.name;
    const value = input.value;
    if (value) {
      params.set(name, value)
    }
  });

  const searchInput = document.querySelector("#search-input");
  if (searchInput.value) {
    params.set(searchInput.name, searchInput.value)
  }

  const sortProductSelect = document.querySelector('#product-sort')
  if(sortProductSelect.value){
    const [sortBy,sortOrder] = sortProductSelect.value.split(':')
    if (sortBy && sortOrder) {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder)
    }
  }

  fetch(`/products/partial?${params.toString()}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      if (data.productHtml) {
        document.querySelector("#product-list").innerHTML = data.productHtml;
        
        const paginationSection = document.getElementById('pagination');
        paginationSection.innerHTML = data.paginationHtml;

        attachPaginationListeners();
      }
      
      const newUrl = `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
      window.history.pushState(null, '', newUrl);    
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const attachPaginationListeners = () => {
  const paginationSection = document.getElementById('pagination');
  
  paginationSection.querySelectorAll('.page-btn, #prev-page, #next-page').forEach(button => {
    button.addEventListener('click', (e) => {
      if (!button.disabled) {
        const page = button.dataset.page;
        fetchData(page);
      }
    });
  });
};

const priceInputs = document.querySelectorAll(".price-filter");
priceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    fetchData();
  });
});

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
  if (searchBar.value) {
    fetchData();
  }
});

document.querySelector("#search-input").addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); 
    const searchBar = document.querySelector("#search-input");
    if (searchBar.value) {
      fetchData();
    }
  }
});

document.querySelector('#product-sort').addEventListener('change', (event) => {
  const selectedValue = event.target.value; 
  const [sortBy, sortOrder] = selectedValue.split(':');
  if(sortBy && sortOrder)
  {
    fetchData()
    params.set('sortBy', sortBy)
    params.set('sortOrder',sortOrder)
  }

});

document.addEventListener('DOMContentLoaded', attachPaginationListeners);