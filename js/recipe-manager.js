/**
 * Recipe Manager - Dynamic Recipe Loading and Rendering System
 * Loads recipes from JSON and generates HTML dynamically
 */

class RecipeManager {
    constructor() {
        this.recipes = [];
        this.categories = [];
        this.loaded = false;
    }

    // Load recipe data from JSON
    async loadRecipes() {
        try {
            const response = await fetch('./data/recipes.json');
            const data = await response.json();
            this.recipes = data.recipes;
            this.categories = data.categories;
            this.loaded = true;
            return data;
        } catch (error) {
            console.error('Error loading recipes:', error);
            return null;
        }
    }

    // Get recipe by slug
    getRecipe(slug) {
        return this.recipes.find(recipe => recipe.slug === slug);
    }

    // Get recipes by category
    getRecipesByCategory(categorySlug) {
        return this.recipes.filter(recipe =>
            recipe.categories.some(cat => cat.toLowerCase().replace(/\s+/g, '-') === categorySlug)
        );
    }

    // Get featured recipes
    getFeaturedRecipes(limit = 3) {
        return this.recipes.filter(recipe => recipe.featured).slice(0, limit);
    }

    // Get viral recipes
    getViralRecipes(limit = 3) {
        return this.recipes.filter(recipe => recipe.viral).slice(0, limit);
    }

    // Get popular recipes
    getPopularRecipes(limit = 6) {
        return this.recipes.filter(recipe => recipe.popular).slice(0, limit);
    }

    // Search recipes
    searchRecipes(query) {
        const searchTerm = query.toLowerCase();
        return this.recipes.filter(recipe => {
            return recipe.title.toLowerCase().includes(searchTerm) ||
                   recipe.description.toLowerCase().includes(searchTerm) ||
                   recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                   recipe.categories.some(cat => cat.toLowerCase().includes(searchTerm));
        });
    }

    // Generate recipe card HTML
    generateRecipeCard(recipe, options = {}) {
        const {
            showDescription = true,
            showTiming = true,
            showCategories = true,
            cardClass = 'recipe-card',
            showViralBadge = false,
            viralCount = ''
        } = options;

        const cardHTML = `
            <a href="./recipes/${recipe.slug}.html" class="${cardClass}" data-recipe-id="${recipe.id}">
                <img src="${recipe.image.thumbnail || recipe.image.hero}"
                     alt="${recipe.title}"
                     loading="lazy">
                ${showViralBadge ? `
                <div class="viral-badge">
                    <i class="fas fa-fire"></i>
                    <span>${viralCount}</span>
                </div>
                ` : ''}
                <div class="recipe-overlay">
                    <h3>${recipe.title}</h3>
                    <div class="read-recipe">→ Read Recipe</div>
                </div>
                <div class="recipe-info">
                    <h3>${recipe.title}</h3>
                    ${showTiming ? `
                    <div class="recipe-meta">
                        <span class="time">
                            <i class="far fa-clock"></i> ${recipe.timing.totalTimeDisplay}
                        </span>
                        <span class="difficulty">${recipe.difficulty}</span>
                    </div>
                    ` : ''}
                </div>
            </a>
        `;

        console.log('Generated card HTML:', cardHTML);
        return cardHTML;
    }

    // Generate recipe schema markup
    generateRecipeSchema(recipe) {
        return {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": recipe.title,
            "description": recipe.description,
            "image": [recipe.image.hero, ...(recipe.image.gallery || [])],
            "author": {
                "@type": "Person",
                "name": recipe.author.name,
                "jobTitle": recipe.author.title
            },
            "datePublished": recipe.datePublished,
            "dateModified": recipe.dateModified,
            "prepTime": recipe.timing.prepTime,
            "cookTime": recipe.timing.cookTime,
            "totalTime": recipe.timing.totalTime,
            "recipeYield": `${recipe.servings.yield} ${recipe.servings.unit}`,
            "recipeCategory": recipe.categories,
            "keywords": recipe.tags.join(", "),
            "nutrition": {
                "@type": "NutritionInformation",
                "calories": `${recipe.nutrition.calories} calories`,
                "proteinContent": recipe.nutrition.protein,
                "carbohydrateContent": recipe.nutrition.carbs,
                "fatContent": recipe.nutrition.fat,
                "fiberContent": recipe.nutrition.fiber,
                "sugarContent": recipe.nutrition.sugar
            },
            "recipeIngredient": recipe.ingredients.map(ing =>
                `${ing.amount} ${ing.unit} ${ing.ingredient}${ing.notes ? ` (${ing.notes})` : ''}`
            ),
            "recipeInstructions": recipe.instructions.map(step => ({
                "@type": "HowToStep",
                "name": `Step ${step.step}`,
                "text": step.text,
                "image": step.image || recipe.image.hero
            }))
        };
    }

    // Update homepage with recipe data
    async updateHomepage() {
        if (!this.loaded) {
            await this.loadRecipes();
        }

        // Update viral recipes section
        const viralContainer = document.getElementById('viral-recipes');
        if (viralContainer) {
            const viralRecipes = this.getViralRecipes(3);
            const viralCounts = ['2.3M', '1.8M', '950K']; // Sample viral counts
            viralContainer.innerHTML = viralRecipes.map((recipe, index) =>
                this.generateRecipeCard(recipe, {
                    cardClass: 'recipe-card viral-card',
                    showViralBadge: true,
                    viralCount: viralCounts[index] || '100K'
                })
            ).join('');
        }

        // Update popular recipes section
        const popularContainer = document.getElementById('popular-recipes');
        if (popularContainer) {
            const popularRecipes = this.getPopularRecipes(6);
            popularContainer.innerHTML = popularRecipes.map(recipe =>
                this.generateRecipeCard(recipe, { cardClass: 'popular-card' })
            ).join('');
        }

        // Update recent recipes section
        const recentContainer = document.getElementById('recent-recipes');
        if (recentContainer) {
            const recentRecipes = this.recipes.slice(0, 4);
            recentContainer.innerHTML = recentRecipes.map(recipe =>
                this.generateRecipeCard(recipe, { cardClass: 'recipe-card' })
            ).join('');
        }
    }

    // Update recipe index page
    async updateRecipeIndex() {
        if (!this.loaded) {
            await this.loadRecipes();
        }

        const container = document.getElementById('recipe-grid');
        if (container) {
            container.innerHTML = this.recipes.map(recipe =>
                this.generateRecipeCard(recipe)
            ).join('');
        }

        // Update categories
        const categoriesContainer = document.getElementById('recipe-categories');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = this.categories.map(category => `
                <button class="category-filter" data-category="${category.slug}">
                    ${category.name}
                </button>
            `).join('');
        }
    }

    // Initialize recipe functionality
    async init() {
        await this.loadRecipes();

        // Update search functionality
        this.initializeSearch();

        // Add category filtering
        this.initializeCategoryFiltering();
    }

    // Initialize search functionality
    initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        if (searchInput && searchResults) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();

                if (query === '') {
                    searchResults.innerHTML = `
                        <div style="text-align: center; color: #666; padding: 1rem;">
                            Start typing to search recipes...
                        </div>
                    `;
                    return;
                }

                const results = this.searchRecipes(query);

                if (results.length === 0) {
                    searchResults.innerHTML = `
                        <div style="text-align: center; color: #666; padding: 1rem;">
                            No recipes found for "${query}"
                        </div>
                    `;
                } else {
                    searchResults.innerHTML = results.map(recipe => `
                        <a href="./recipes/${recipe.slug}.html" class="search-result-item">
                            <div class="search-result-title">${recipe.title}</div>
                            <div class="search-result-description">${recipe.description}</div>
                        </a>
                    `).join('');
                }
            });
        }
    }

    // Initialize category filtering
    initializeCategoryFiltering() {
        const categoryButtons = document.querySelectorAll('.category-filter');

        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;

                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                e.target.classList.add('active');

                // Filter recipes
                const container = document.getElementById('recipe-grid');
                if (container) {
                    const filteredRecipes = category === 'all'
                        ? this.recipes
                        : this.getRecipesByCategory(category);

                    container.innerHTML = filteredRecipes.map(recipe =>
                        this.generateRecipeCard(recipe)
                    ).join('');
                }
            });
        });
    }
}

// Create global instance
window.recipeManager = new RecipeManager();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.recipeManager.init();
});