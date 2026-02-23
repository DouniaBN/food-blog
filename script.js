// Recipe database for search functionality
const recipeDatabase = [
  {
    title: "Healthy Chocolate Banana Bites",
    url: "/recipes/banana-bites.html",
    description: "Easy 15-minute healthy chocolate banana bites with only 5 ingredients. No-bake, vegan, and gluten-free.",
    keywords: ["chocolate", "banana", "no-bake", "vegan", "gluten-free", "healthy", "dessert", "15 minutes", "5 ingredients"]
  },
  {
    title: "Strawberry Chia Cups",
    url: "/recipes/chia-cups.html",
    description: "Creamy strawberry chia pudding cups perfect for breakfast or dessert.",
    keywords: ["strawberry", "chia", "pudding", "breakfast", "healthy", "vegan", "gluten-free"]
  },
  {
    title: "Cookie Dough Cups",
    url: "/recipes/cookie-dough-cups.html",
    description: "Viral no-bake cookie dough cups that taste like the real thing but healthier.",
    keywords: ["cookie dough", "no-bake", "viral", "chocolate chips", "healthy"]
  },
  {
    title: "Healthy No Bake Brownie Batter Bars (4 Ingredients)",
    url: "/recipes/brownie-batter-bars.html",
    description: "No bake healthy brownie batter bars made with just 4 ingredients. Gluten-free, refined sugar-free and ready in minutes.",
    keywords: ["brownie", "no-bake", "gluten-free", "vegan", "dairy-free", "paleo", "refined-sugar-free", "chocolate", "almond-flour", "4-ingredients", "healthy-dessert"]
  },
  {
    title: "Matcha Fudge",
    url: "/recipes/matcha-fudge.html",
    description: "Creamy matcha fudge squares with white chocolate drizzle.",
    keywords: ["matcha", "fudge", "green tea", "white chocolate", "squares"]
  }
];

// Search functionality
function toggleSearch() {
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');

  if (searchOverlay && searchInput) {
    searchOverlay.classList.add('show');
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }
}

function closeSearch() {
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');

  if (searchOverlay && searchInput) {
    searchOverlay.classList.remove('show');
    searchInput.value = '';
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      searchResults.innerHTML = `
        <div style="text-align: center; color: #666; padding: 1rem;">
          Start typing to search recipes...
        </div>
      `;
    }
  }
}

// Mobile hamburger menu functionality
function toggleMobileMenu() {
  const dropdown = document.getElementById('mobileNavDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Initialize search functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();

      if (query === '') {
        searchResults.innerHTML = `
          <div style="text-align: center; color: #666; padding: 1rem;">
            Start typing to search recipes...
          </div>
        `;
        return;
      }

      const results = recipeDatabase.filter(recipe => {
        return recipe.title.toLowerCase().includes(query) ||
               recipe.description.toLowerCase().includes(query) ||
               recipe.keywords.some(keyword => keyword.toLowerCase().includes(query));
      });

      if (results.length === 0) {
        searchResults.innerHTML = `
          <div style="text-align: center; color: #666; padding: 1rem;">
            No recipes found for "${query}"
          </div>
        `;
      } else {
        searchResults.innerHTML = results.map(recipe => `
          <a href="${recipe.url}" class="search-result-item" onclick="closeSearch()">
            <div class="search-result-title">${recipe.title}</div>
            <div class="search-result-description">${recipe.description}</div>
          </a>
        `).join('');
      }
    });
  }

  // Close mobile menu when clicking outside or on menu items
  document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('mobileNavDropdown');
    const hamburger = document.querySelector('.hamburger-menu');

    if (dropdown && hamburger) {
      // Close if clicking outside menu
      if (!hamburger.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
      }

      // Close if clicking on a menu item (for same-page navigation)
      if (event.target.tagName === 'A' && dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    }
  });

  // Close search when clicking outside
  document.addEventListener('click', function(event) {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchContainer = document.querySelector('.search-container');

    if (searchOverlay && searchOverlay.classList.contains('show') &&
        searchContainer && !searchContainer.contains(event.target)) {
      closeSearch();
    }
  });
});