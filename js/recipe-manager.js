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

    // Load recipe data from individual JSON files via manifest
    async loadRecipes() {
        try {
            const manifestResponse = await fetch('./data/recipe-manifest.json');
            const manifest = await manifestResponse.json();
            this.categories = manifest.categories;

            const recipePromises = manifest.recipes.map(slug =>
                fetch(`./data/recipes/${slug}.json`).then(r => r.json())
            );
            this.recipes = await Promise.all(recipePromises);
            this.loaded = true;
            return { recipes: this.recipes, categories: this.categories };
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
    getPopularRecipes(limit = 4) {
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

        // Build responsive srcset if multiple thumbnail sizes available
        const thumbnailSrc = (recipe.image.thumbnail && recipe.image.thumbnail.src) || (recipe.image.hero && recipe.image.hero.src) || '';
        const srcset300 = recipe.image.thumbnail && recipe.image.thumbnail.srcset && recipe.image.thumbnail.srcset['300'];
        const srcset600 = recipe.image.thumbnail && recipe.image.thumbnail.srcset && recipe.image.thumbnail.srcset['600'];
        const srcsetParts = [];

        if (srcset300) srcsetParts.push(`${srcset300} 300w`);
        if (srcset600) srcsetParts.push(`${srcset600} 600w`);

        const srcsetAttr = srcsetParts.length > 0 ? `srcset="${srcsetParts.join(', ')}"` : '';
        const sizesAttr = srcsetParts.length > 0 ? `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"` : '';

        // Use specific alt text if available, otherwise fall back to title
        const altText = (recipe.image.thumbnail && recipe.image.thumbnail.alt) || (recipe.image.hero && recipe.image.hero.alt) || recipe.title;

        const cardHTML = `
            <a href="./recipes/${recipe.slug}.html" class="${cardClass}" data-recipe-id="${recipe.id}">
                <img src="${thumbnailSrc}"
                     ${srcsetAttr}
                     ${sizesAttr}
                     alt="${altText}"
                     width="400"
                     height="267"
                     loading="lazy"
                     decoding="async">
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
            const viralRecipes = this.getViralRecipes(4);
            const viralCounts = {
                'apple-fritters': '15M+',
                'no-bake-lemon-bars': '4M+',
                'gluten-free-brownie-cookies': '500K+',
                'mango-yogurt-bites': '400K+'
            };
            viralContainer.innerHTML = viralRecipes.map((recipe) =>
                this.generateRecipeCard(recipe, {
                    cardClass: 'recipe-card viral-card',
                    showViralBadge: true,
                    viralCount: viralCounts[recipe.slug] || ''
                })
            ).join('');
        }

        // Update popular recipes section
        const popularContainer = document.getElementById('popular-recipes');
        if (popularContainer) {
            const popularSlugs = ['cinnamon-roll-overnight-oats', 'matcha-marshmallows', 'chocolate-chip-banana-bread-bars', 'blueberry-fritters'];
            const popularRecipes = popularSlugs.map(slug => this.recipes.find(r => r.slug === slug)).filter(Boolean);
            popularContainer.innerHTML = popularRecipes.map(recipe =>
                this.generateRecipeCard(recipe, { cardClass: 'recipe-card' })
            ).join('');
        }

        // Update no bake favorites section
        const recentContainer = document.getElementById('recent-recipes');
        if (recentContainer) {
            const noBakeSlugs = ['brownie-batter-bars', 'coconut-truffles', 'matcha-ganache-bars', 'chocolate-banana-freezer-fudge'];
            const noBakeRecipes = noBakeSlugs.map(slug => this.recipes.find(r => r.slug === slug)).filter(Boolean);
            recentContainer.innerHTML = noBakeRecipes.map(recipe =>
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