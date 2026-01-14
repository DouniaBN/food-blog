/**
 * Recipe Page Dynamic Renderer
 * Updates existing recipe pages with data from JSON
 */

class RecipeRenderer {
    constructor() {
        this.loader = window.recipeLoader;
    }

    async renderRecipePage(slug) {
        const recipe = await this.loader.getRecipeBySlug(slug);
        if (!recipe) {
            this.renderNotFound();
            return;
        }

        // Update page metadata
        this.updatePageMeta(recipe);

        // Inject schemas
        this.injectSchemas(recipe);

        // Render page content
        this.renderContent(recipe);

        // Initialize interactive elements
        this.initializeInteractions(recipe);
    }

    updatePageMeta(recipe) {
        // Update title
        document.title = recipe.seo.metaTitle || `${recipe.title} | Yourwellnessgirly`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = recipe.seo.metaDescription || recipe.description;
        }

        // Update canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.href = `https://yourwellnessgirly.com/recipes/${recipe.slug}`;
        }

        // Update Open Graph tags
        this.updateOpenGraphMeta(recipe);

        // Update Twitter Card tags
        this.updateTwitterMeta(recipe);
    }

    updateOpenGraphMeta(recipe) {
        const ogTags = {
            'og:title': recipe.seo.metaTitle || recipe.title,
            'og:description': recipe.seo.metaDescription || recipe.description,
            'og:url': `https://yourwellnessgirly.com/recipes/${recipe.slug}`,
            'og:image': `https://yourwellnessgirly.com/${recipe.image.hero}`
        };

        Object.entries(ogTags).forEach(([property, content]) => {
            const meta = document.querySelector(`meta[property="${property}"]`);
            if (meta) meta.content = content;
        });
    }

    updateTwitterMeta(recipe) {
        const twitterTags = {
            'twitter:title': recipe.seo.metaTitle || recipe.title,
            'twitter:description': recipe.seo.metaDescription || recipe.description,
            'twitter:url': `https://yourwellnessgirly.com/recipes/${recipe.slug}`,
            'twitter:image': `https://yourwellnessgirly.com/${recipe.image.hero}`
        };

        Object.entries(twitterTags).forEach(([property, content]) => {
            const meta = document.querySelector(`meta[property="${property}"]`);
            if (meta) meta.content = content;
        });
    }

    injectSchemas(recipe) {
        // Remove existing schemas
        const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
        existingSchemas.forEach(script => script.remove());

        // Recipe schema
        const recipeSchema = this.loader.generateJsonLdSchema(recipe);
        this.loader.injectSchema(recipeSchema, 'recipe-schema');

        // Breadcrumb schema
        const breadcrumbSchema = this.loader.generateBreadcrumbSchema(recipe);
        this.loader.injectSchema(breadcrumbSchema, 'breadcrumb-schema');
    }

    renderContent(recipe) {
        // Update breadcrumbs
        this.renderBreadcrumbs(recipe);

        // Update hero section
        this.renderHero(recipe);

        // Update story section
        this.renderStory(recipe);

        // Update recipe card
        this.renderRecipeCard(recipe);

        // Update FAQ section
        this.renderFAQ(recipe);

        // Update related recipes
        this.renderRelatedRecipes(recipe);
    }

    renderBreadcrumbs(recipe) {
        const breadcrumbContainer = document.querySelector('.breadcrumbs ol');
        if (breadcrumbContainer) {
            breadcrumbContainer.innerHTML = `
                <li><a href="../index.html">Home</a></li>
                <li><a href="../recipe-index.html">Recipe Index</a></li>
                <li>${recipe.title}</li>
            `;
        }
    }

    renderHero(recipe) {
        // Update recipe title
        const titleEl = document.querySelector('.recipe-title');
        if (titleEl) titleEl.textContent = recipe.title;

        // Update description
        const descEl = document.querySelector('.recipe-description');
        if (descEl) descEl.textContent = recipe.description;

        // Update meta info
        this.renderMetaInfo(recipe);

        // Update diet badges
        this.renderDietBadges(recipe);

        // Update hero image
        const heroImage = document.querySelector('.recipe-hero-image img');
        if (heroImage) {
            heroImage.src = `../${recipe.image.hero}`;
            heroImage.alt = `${recipe.title} - healthy dessert recipe`;
        }
    }

    renderMetaInfo(recipe) {
        const metaContainer = document.querySelector('.recipe-meta');
        if (!metaContainer) return;

        metaContainer.innerHTML = `
            <div class="meta-item">
                <i class="far fa-clock"></i>
                <span class="meta-label">Prep</span>
                <span class="meta-value">${recipe.timing.prepTimeDisplay}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-fire"></i>
                <span class="meta-label">Cook</span>
                <span class="meta-value">${recipe.timing.cookTimeDisplay}</span>
            </div>
            <div class="meta-item">
                <i class="far fa-clock"></i>
                <span class="meta-label">Total</span>
                <span class="meta-value">${recipe.timing.totalTimeDisplay}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-users"></i>
                <span class="meta-label">Servings</span>
                <span class="meta-value">${recipe.servings.yield} ${recipe.servings.unit}</span>
            </div>
        `;
    }

    renderDietBadges(recipe) {
        const badgeContainer = document.querySelector('.diet-badges');
        if (!badgeContainer) return;

        const badgeMap = {
            'Gluten-Free': 'gluten-free',
            'Vegan': 'vegan',
            'No-Bake': 'no-bake',
            'Refined Sugar-Free': 'refined-sugar-free',
            'Summer Desserts': 'summer',
            '3 Ingredients': '3-ingredient'
        };

        const badges = recipe.categories.map(category => {
            const className = badgeMap[category] || category.toLowerCase().replace(/\s+/g, '-');
            return `<span class="badge ${className}">${category}</span>`;
        }).join('');

        badgeContainer.innerHTML = badges;

        // Add difficulty badge
        const difficultyContainer = document.querySelector('.difficulty-badge');
        if (difficultyContainer) {
            difficultyContainer.innerHTML = `
                <span class="difficulty ${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</span>
            `;
        }
    }

    renderRecipeCard(recipe) {
        // Update recipe card title
        const cardTitle = document.querySelector('.recipe-card-title');
        if (cardTitle) {
            const subtitle = recipe.categories.slice(0, 3).join(', ');
            cardTitle.innerHTML = `${recipe.title}<br><span class="recipe-subtitle">(${subtitle})</span>`;
        }

        // Update card meta info
        this.renderCardMeta(recipe);

        // Update ingredients
        this.renderIngredients(recipe);

        // Update instructions
        this.renderInstructions(recipe);

        // Update nutrition facts
        this.renderNutrition(recipe);

        // Update recipe card image
        const cardImage = document.querySelector('.recipe-card-image img');
        if (cardImage) {
            cardImage.src = `../${recipe.image.thumbnail}`;
            cardImage.alt = `${recipe.title} recipe card image`;
        }
    }

    renderCardMeta(recipe) {
        const metaGrid = document.querySelector('.recipe-meta-grid');
        if (!metaGrid) return;

        metaGrid.innerHTML = `
            <div class="meta-row">
                <span class="meta-label">author:</span>
                <span class="meta-value">${recipe.author.name.toUpperCase()}</span>
            </div>
            <div class="meta-row">
                <i class="far fa-clock"></i>
                <span class="meta-label">prep time:</span>
                <span class="meta-value">${recipe.timing.prepTimeDisplay.replace(' minutes', '').replace(' min', '')}</span>
            </div>
            <div class="meta-row">
                <i class="far fa-clock"></i>
                <span class="meta-label">cook time:</span>
                <span class="meta-value">${recipe.timing.cookTimeDisplay.replace(' minutes', '').replace(' min', '')}</span>
            </div>
            <div class="meta-row">
                <i class="far fa-clock"></i>
                <span class="meta-label">total time:</span>
                <span class="meta-value">${recipe.timing.totalTimeDisplay.toUpperCase()}</span>
            </div>
            <div class="meta-row">
                <i class="fas fa-utensils"></i>
                <span class="meta-label">yield:</span>
                <span class="meta-value">${recipe.servings.yield} ${recipe.servings.unit}</span>
            </div>
        `;
    }

    renderIngredients(recipe) {
        const ingredientsList = document.querySelector('.ingredients-list');
        if (!ingredientsList) return;

        const ingredients = recipe.ingredients.map((ingredient, index) => {
            const amount = ingredient.amount || '';
            const unit = ingredient.unit || '';
            const notes = ingredient.notes ? ` (${ingredient.notes})` : '';

            return `
                <li>
                    <input type="checkbox" id="ingredient-${index + 1}">
                    <label for="ingredient-${index + 1}">
                        <span class="amount">${amount}</span> ${unit} ${ingredient.ingredient}${notes}
                    </label>
                </li>
            `;
        }).join('');

        ingredientsList.innerHTML = ingredients;
    }

    renderInstructions(recipe) {
        const instructionsList = document.querySelector('.instructions-list');
        if (!instructionsList) return;

        const instructions = recipe.instructions.map(instruction =>
            `<li><strong>Step ${instruction.step}:</strong> ${instruction.text}</li>`
        ).join('');

        instructionsList.innerHTML = instructions;
    }

    renderNutrition(recipe) {
        const nutritionTable = document.querySelector('.nutrition-table');
        if (!nutritionTable) return;

        nutritionTable.innerHTML = `
            <div class="nutrition-item">
                <span class="nutrition-label">Calories</span>
                <span class="nutrition-value">${recipe.nutrition.calories}</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Total Fat</span>
                <span class="nutrition-value">${recipe.nutrition.fat}</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Carbohydrates</span>
                <span class="nutrition-value">${recipe.nutrition.carbs}</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Fiber</span>
                <span class="nutrition-value">${recipe.nutrition.fiber}</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Protein</span>
                <span class="nutrition-value">${recipe.nutrition.protein}</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Sugar</span>
                <span class="nutrition-value">${recipe.nutrition.sugar}</span>
            </div>
        `;
    }

    async renderRelatedRecipes(recipe) {
        // Get recipes from same categories
        const allRecipes = await this.loader.getAllRecipes();
        const related = allRecipes
            .filter(r => r.slug !== recipe.slug) // Exclude current recipe
            .filter(r => r.categories.some(cat => recipe.categories.includes(cat))) // Same category
            .slice(0, 3); // Max 3 related

        const relatedGrid = document.querySelector('.related-grid-small');
        if (!relatedGrid || related.length === 0) return;

        const relatedHTML = related.map(relatedRecipe => `
            <a href="${relatedRecipe.slug}.html" class="recipe-card-small">
                <img src="../${relatedRecipe.image.thumbnail}" alt="${relatedRecipe.title}" loading="lazy">
                <div class="recipe-info">
                    <h3>${relatedRecipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="time"><i class="far fa-clock"></i> ${relatedRecipe.timing.prepTimeDisplay}</span>
                        <span class="difficulty">${relatedRecipe.difficulty}</span>
                    </div>
                </div>
            </a>
        `).join('');

        relatedGrid.innerHTML = relatedHTML;
    }

    initializeInteractions(recipe) {
        // Initialize servings adjuster
        this.initializeServingsAdjuster(recipe);

        // Initialize ingredient checkboxes
        this.initializeIngredientCheckboxes();
    }

    initializeServingsAdjuster(recipe) {
        const servingCount = document.querySelector('.serving-count');
        const plusBtn = document.querySelector('.serving-btn.plus');
        const minusBtn = document.querySelector('.serving-btn.minus');

        if (!servingCount || !plusBtn || !minusBtn) return;

        let currentServings = parseInt(recipe.servings.yield);
        const baseServings = currentServings;
        servingCount.textContent = currentServings;

        // Store base amounts for scaling
        const baseAmounts = recipe.ingredients.map(ing => parseFloat(ing.amount) || 0);

        const updateAmounts = () => {
            const multiplier = currentServings / baseServings;
            const amounts = document.querySelectorAll('.ingredients-list .amount');

            amounts.forEach((amount, index) => {
                if (baseAmounts[index] > 0) {
                    const newAmount = (baseAmounts[index] * multiplier).toFixed(2);
                    amount.textContent = parseFloat(newAmount).toString();
                }
            });
        };

        plusBtn.addEventListener('click', () => {
            if (currentServings < 50) {
                currentServings++;
                servingCount.textContent = currentServings;
                updateAmounts();
            }
        });

        minusBtn.addEventListener('click', () => {
            if (currentServings > 1) {
                currentServings--;
                servingCount.textContent = currentServings;
                updateAmounts();
            }
        });
    }

    initializeIngredientCheckboxes() {
        const checkboxes = document.querySelectorAll('.ingredients-list input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const label = this.nextElementSibling;
                if (this.checked) {
                    label.style.textDecoration = 'line-through';
                    label.style.opacity = '0.6';
                } else {
                    label.style.textDecoration = 'none';
                    label.style.opacity = '1';
                }
            });
        });
    }

    renderStory(recipe) {
        const storySection = document.querySelector('.recipe-story');
        if (!storySection || !recipe.story) return;

        const storyHTML = `
            <h2>${recipe.title} <em style="font-weight: 300; color: #e0a5a5;">(${recipe.story.subtitle})</em></h2>
            ${recipe.story.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}
        `;

        storySection.innerHTML = storyHTML;
    }

    renderFAQ(recipe) {
        const faqSection = document.querySelector('.faq-section');
        if (!faqSection || !recipe.faq) return;

        const faqHTML = `
            <h3>Frequently Asked Questions</h3>
            <div class="faq-list">
                ${recipe.faq.map(faqItem => `
                    <div class="faq-item">
                        <h4 class="faq-question">${faqItem.question}</h4>
                        <p class="faq-answer">${faqItem.answer}</p>
                    </div>
                `).join('')}
            </div>
        `;

        faqSection.innerHTML = faqHTML;
    }

    renderTips(recipe) {
        // Optional: Add tips section to template if needed
        const tipsSection = document.querySelector('.tips-section');
        if (!tipsSection || !recipe.tips) return;

        const tipsHTML = `
            <h3>Pro Tips</h3>
            <ul class="tips-list">
                ${recipe.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;

        tipsSection.innerHTML = tipsHTML;
    }

    renderSubstitutions(recipe) {
        // Optional: Add substitutions section to template if needed
        const substitutionsSection = document.querySelector('.substitutions-section');
        if (!substitutionsSection || !recipe.substitutions) return;

        const substitutionsHTML = `
            <h3>Substitutions</h3>
            <div class="substitutions-list">
                ${recipe.substitutions.map(sub => `
                    <div class="substitution-item">
                        <strong>${sub.ingredient}:</strong>
                        <ul>
                            ${sub.alternatives.map(alt => `<li>${alt}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;

        substitutionsSection.innerHTML = substitutionsHTML;
    }

    renderNotFound() {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h1>Recipe Not Found</h1>
                <p>The recipe you're looking for doesn't exist.</p>
                <a href="../index.html">Return to Home</a>
            </div>
        `;
    }
}

// Helper function to get slug from URL
function getRecipeSlugFromURL() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const slug = getRecipeSlugFromURL();
    if (slug && slug !== 'index') {
        const renderer = new RecipeRenderer();
        await renderer.renderRecipePage(slug);
    }
});

// Create global instance
window.recipeRenderer = new RecipeRenderer();