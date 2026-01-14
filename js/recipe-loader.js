/**
 * Recipe Data Loader - Single Source of Truth System
 * Loads recipe data from recipes.json and provides utilities
 */

class RecipeLoader {
    constructor() {
        this.recipesData = null;
        this.loaded = false;
    }

    async loadRecipes() {
        if (this.loaded) return this.recipesData;

        try {
            const response = await fetch('/data/recipes.json');
            if (!response.ok) throw new Error('Failed to load recipes');
            this.recipesData = await response.json();
            this.loaded = true;
            return this.recipesData;
        } catch (error) {
            console.error('Error loading recipes:', error);
            throw error;
        }
    }

    async getRecipeBySlug(slug) {
        const data = await this.loadRecipes();
        return data.recipes.find(recipe => recipe.slug === slug);
    }

    async getAllRecipes() {
        const data = await this.loadRecipes();
        return data.recipes;
    }

    async getRecipesByCategory(category) {
        const data = await this.loadRecipes();
        return data.recipes.filter(recipe =>
            recipe.categories.includes(category)
        );
    }

    async getPopularRecipes() {
        const data = await this.loadRecipes();
        return data.recipes.filter(recipe => recipe.popular);
    }

    async getFeaturedRecipes() {
        const data = await this.loadRecipes();
        return data.recipes.filter(recipe => recipe.featured);
    }

    async getViralRecipes() {
        const data = await this.loadRecipes();
        return data.recipes.filter(recipe => recipe.viral);
    }

    generateJsonLdSchema(recipe) {
        return {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": recipe.title,
            "image": [
                `https://yourwellnessgirly.com/${recipe.image.hero}`,
                `https://yourwellnessgirly.com/${recipe.image.thumbnail}`
            ],
            "description": recipe.description,
            "keywords": recipe.tags.join(", "),
            "author": {
                "@type": "Person",
                "name": recipe.author.name,
                "url": "https://yourwellnessgirly.com/about"
            },
            "datePublished": recipe.datePublished,
            "dateModified": recipe.dateModified,
            "prepTime": recipe.timing.prepTime,
            "cookTime": recipe.timing.cookTime,
            "totalTime": recipe.timing.totalTime,
            "recipeCategory": recipe.categories[0] || "Dessert",
            "recipeCuisine": "American",
            "recipeYield": `${recipe.servings.yield} ${recipe.servings.unit}`,
            "nutrition": {
                "@type": "NutritionInformation",
                "calories": `${recipe.nutrition.calories} calories`,
                "carbohydrateContent": recipe.nutrition.carbs,
                "proteinContent": recipe.nutrition.protein,
                "fatContent": recipe.nutrition.fat,
                "fiberContent": recipe.nutrition.fiber,
                "sugarContent": recipe.nutrition.sugar
            },
            "recipeIngredient": recipe.ingredients.map(ing => {
                const amount = ing.amount || "";
                const unit = ing.unit || "";
                const ingredient = ing.ingredient;
                const notes = ing.notes ? ` (${ing.notes})` : "";
                return `${amount} ${unit} ${ingredient}${notes}`.trim();
            }),
            "recipeInstructions": recipe.instructions.map(instruction => ({
                "@type": "HowToStep",
                "text": instruction.text
            })),
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127"
            }
        };
    }

    generateBreadcrumbSchema(recipe) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://yourwellnessgirly.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Recipes",
                    "item": "https://yourwellnessgirly.com/recipe-index.html"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": recipe.title
                }
            ]
        };
    }

    injectSchema(schema, id) {
        // Remove existing schema with same ID
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        // Create and inject new schema
        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    }

    formatTime(timeString) {
        // Convert PT15M to "15 minutes", PT2H30M to "2h 30m", etc.
        const match = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (!match) return timeString;

        const hours = match[1] ? `${match[1]}h` : '';
        const minutes = match[2] ? `${match[2]} min` : '';

        return `${hours} ${minutes}`.trim() || '0 min';
    }
}

// Create global instance
window.recipeLoader = new RecipeLoader();