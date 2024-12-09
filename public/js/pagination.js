document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const paginationSection = document.getElementById('pagination');

    function updatePaginationButtons(currentPage, totalPage) {
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        const pageButtons = document.querySelectorAll('.page-btn');

        // Update page buttons
        pageButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.page) === currentPage) 
            {
                btn.classList.add('active');
            }
        });

        if (prevButton) 
        {
            if (currentPage > 1) 
            {
                prevButton.dataset.page = currentPage - 1;
                prevButton.disabled = false;
            }
            else 
            {
                prevButton.dataset.page = 1;
                prevButton.disabled = true;
            }
        }

        if (nextButton) 
        {
            if (currentPage < totalPage) 
            {
                nextButton.dataset.page = currentPage + 1;
                nextButton.disabled = false;
            }
            else 
            {
                nextButton.dataset.page = totalPage;
                nextButton.disabled = true;
            }
        }
    }

    async function fetchProducts(page, additionalParams = {}) {
        try {
            const currentUrl = new URL(window.location.href);
            const params = new URLSearchParams(currentUrl.search);
            params.set('page', page);

            Object.entries(additionalParams).forEach(([key, value]) => {
                params.set(key, value);
            });

            const response = await fetch(`/products/partial?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            productList.innerHTML = data.productHtml;
        
            // Update pagination
            updatePaginationButtons(data.currentPage, data.totalPage);

            // Update URL without page reload
            window.history.pushState(
                { page: data.currentPage }, 
                `Page ${data.currentPage}`, 
                `?${params.toString()}`
            );
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Event delegation for pagination
    paginationSection.addEventListener('click', (e) => {
        console.log('Pagination click detected', e.target);
        const pageBtn = e.target.closest('.page-btn, #prev-page, #next-page');
        if (pageBtn && !pageBtn.disabled) {
            const page = pageBtn.dataset.page;
            fetchProducts(page);
        }
    });
});