#!/usr/bin/env node

/**
 * Static Recipe HTML Generator - Refactored for Individual Recipe Files
 *
 * NEW ARCHITECTURE:
 * - Reads individual recipe JSON files from /recipes-data/ folder
 * - Can generate ONE specific recipe or ALL recipes
 * - Maintains same HTML output and SEO structure
 * - Includes safety features for missing/malformed files
 *
 * USAGE:
 *   node build/generate-recipes.js banana-bites    # Generate single recipe
 *   node build/generate-recipes.js all             # Generate all recipes
 *
 * FOLDER STRUCTURE:
 *   /recipes-data/
 *     banana-bites.json       ← Individual recipe files
 *     mango-yogurt-bites.json
 *     strawberry-tarts.json
 *     ...
 */

const fs = require('fs');
const path = require('path');

class RecipeGenerator {
    constructor() {
        this.baseDir = path.join(__dirname, '..');
        this.recipesDataDir = path.join(this.baseDir, 'recipes-data');
        this.outputDir = path.join(this.baseDir, 'recipes');
        this.templateFile = path.join(__dirname, 'recipe-template.html');

        // Track errors and warnings for safety reporting
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Load a single recipe from its individual JSON file
     * @param {string} slug - Recipe slug (filename without .json)
     * @returns {Object|null} Recipe data or null if failed
     */
    loadSingleRecipe(slug) {
        const recipeFile = path.join(this.recipesDataDir, `${slug}.json`);

        try {
            if (!fs.existsSync(recipeFile)) {
                this.errors.push(`Recipe file not found: ${recipeFile}`);
                return null;
            }

            const data = fs.readFileSync(recipeFile, 'utf8');
            const recipe = JSON.parse(data);

            // Validate required fields
            if (!recipe.slug || !recipe.title) {
                this.warnings.push(`Recipe ${slug} missing required fields (slug or title)`);
            }

            return recipe;
        } catch (error) {
            this.errors.push(`Error loading recipe ${slug}: ${error.message}`);
            return null;
        }
    }

    /**
     * Load all recipes from individual JSON files in recipes-data directory
     * @returns {Array} Array of valid recipe objects
     */
    loadAllRecipes() {
        const recipes = [];

        try {
            if (!fs.existsSync(this.recipesDataDir)) {
                console.error(`Recipes data directory not found: ${this.recipesDataDir}`);
                process.exit(1);
            }

            const files = fs.readdirSync(this.recipesDataDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            console.log(`Found ${jsonFiles.length} recipe files in ${this.recipesDataDir}`);

            for (const file of jsonFiles) {
                const slug = file.replace('.json', '');
                const recipe = this.loadSingleRecipe(slug);

                if (recipe) {
                    recipes.push(recipe);
                } else {
                    console.warn(`⚠️  Skipping failed recipe: ${slug}`);
                }
            }

            return recipes;
        } catch (error) {
            console.error('Error scanning recipes directory:', error);
            process.exit(1);
        }
    }

    loadTemplate() {
        try {
            return fs.readFileSync(this.templateFile, 'utf8');
        } catch (error) {
            console.error('Error loading template:', error);
            process.exit(1);
        }
    }

    generateJsonLdSchema(recipe) {
        // Handle both legacy and new image formats
        const getImageUrl = (imageData) => {
            if (typeof imageData === 'string') {
                return `https://yourwellnessgirly.com/${imageData}`;
            }
            return `https://yourwellnessgirly.com/${imageData.src || imageData}`;
        };

        const heroImage = getImageUrl(recipe.image.hero);
        const thumbnailImage = getImageUrl(recipe.image.thumbnail);

        return {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": recipe.title,
            "image": [heroImage, thumbnailImage],
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
            }))
            // Aggregate rating commented out for now - can be enabled later
            // "aggregateRating": {
            //     "@type": "AggregateRating",
            //     "ratingValue": "4.8",
            //     "reviewCount": "127"
            // }
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

    /**
     * Generate responsive picture element with WebP support
     * @param {Object} imageData - Image data from recipe JSON
     * @param {string} type - 'hero', 'thumbnail', or 'gallery'
     * @param {Object} options - Additional options for sizing/lazy loading
     */
    generateResponsiveImage(imageData, type = 'hero', options = {}) {
        // Handle legacy string format for backward compatibility
        if (typeof imageData === 'string') {
            return `<img src="../${imageData}" alt="${options.alt || 'Recipe image'}" loading="lazy">`;
        }

        // Handle new responsive format
        if (!imageData.src) {
            console.warn('Invalid image data structure');
            return '';
        }

        const {
            src,
            srcset = {},
            webp = {},
            alt = 'Recipe image',
            width = 400,
            height = 300
        } = imageData;

        let sizesAttr = '';
        let fetchPriority = '';
        let loading = 'lazy';

        // Configure based on image type
        switch (type) {
            case 'hero':
                sizesAttr = `(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 60vw, 735px`;
                fetchPriority = options.aboveFold ? 'high' : '';
                loading = options.aboveFold ? 'eager' : 'lazy';
                break;
            case 'thumbnail':
                sizesAttr = `(max-width: 768px) 50vw, 300px`;
                break;
            case 'gallery':
                sizesAttr = `(max-width: 768px) 100vw, 400px`;
                break;
        }

        // Build srcset strings for WebP and JPEG
        const buildSrcset = (sources) => {
            return Object.entries(sources)
                .map(([size, path]) => `../${path} ${size}w`)
                .join(', ');
        };

        const webpSrcset = Object.keys(webp).length > 0 ? buildSrcset(webp) : '';
        const jpegSrcset = Object.keys(srcset).length > 0 ? buildSrcset(srcset) : '';

        // Build picture element
        let pictureHtml = '<picture>';

        // WebP sources (if available)
        if (webpSrcset) {
            if (type === 'hero') {
                // Mobile WebP source
                pictureHtml += `
                    <source
                        media="(max-width: 480px)"
                        srcset="../${webp['400'] || webp[Object.keys(webp)[0]]}"
                        type="image/webp">`;
            }
            // Main WebP source
            pictureHtml += `
                <source
                    srcset="${webpSrcset}"
                    type="image/webp">`;
        }

        // JPEG fallback sources
        if (jpegSrcset) {
            if (type === 'hero') {
                // Mobile JPEG source
                pictureHtml += `
                    <source
                        media="(max-width: 480px)"
                        srcset="../${srcset['400'] || srcset[Object.keys(srcset)[0]]}"
                        type="image/jpeg">`;
            }
        }

        // Main img element
        pictureHtml += `
            <img
                src="../${src}"
                ${jpegSrcset ? `srcset="${jpegSrcset}"` : ''}
                ${sizesAttr ? `sizes="${sizesAttr}"` : ''}
                width="${width}"
                height="${height}"
                alt="${alt}"
                loading="${loading}"
                decoding="async"
                ${fetchPriority ? `fetchpriority="${fetchPriority}"` : ''} />`;

        pictureHtml += '</picture>';

        return pictureHtml;
    }

    /**
     * Generate simple img element for thumbnails and small images
     */
    generateSimpleImage(imageData, options = {}) {
        if (typeof imageData === 'string') {
            return `<img src="../${imageData}" alt="${options.alt || 'Recipe image'}" loading="lazy">`;
        }

        const {
            src,
            srcset = {},
            alt = 'Recipe image',
            width = 300,
            height = 225
        } = imageData;

        const jpegSrcset = Object.keys(srcset).length > 0
            ? Object.entries(srcset).map(([size, path]) => `../${path} ${size}w`).join(', ')
            : '';

        return `<img
            src="../${src}"
            ${jpegSrcset ? `srcset="${jpegSrcset}"` : ''}
            ${jpegSrcset ? `sizes="(max-width: 768px) 50vw, 300px"` : ''}
            width="${width}"
            height="${height}"
            alt="${alt}"
            loading="lazy"
            decoding="async" />`;
    }

    renderDietBadges(recipe) {
        const badgeMap = {
            'Gluten-Free': 'gluten-free',
            'Vegan': 'vegan',
            'No-Bake': 'no-bake',
            'Refined Sugar-Free': 'refined-sugar-free',
            'Summer Desserts': 'summer',
            '3 Ingredients': '3-ingredient'
        };

        return recipe.categories.map(category => {
            const className = badgeMap[category] || category.toLowerCase().replace(/\s+/g, '-');
            return `<span class="badge ${className}">${category}</span>`;
        }).join('');
    }

    renderIngredients(recipe) {
        return recipe.ingredients.map((ingredient, index) => {
            const amount = ingredient.amount || '';
            const unit = ingredient.unit || '';
            const notes = ingredient.notes ? ` <span class="ingredient-notes">(${ingredient.notes})</span>` : '';

            return `
                <li>
                    <input type="checkbox" id="ingredient-${index + 1}">
                    <label for="ingredient-${index + 1}">
                        <span class="amount">${amount}</span> ${unit} ${ingredient.ingredient}${notes}
                    </label>
                </li>
            `;
        }).join('');
    }

    renderInstructions(recipe) {
        return recipe.instructions.map(instruction => {
            let html = `<li><strong>Step ${instruction.step}:</strong> ${instruction.text}`;

            // Add step image if it exists with full optimization
            if (instruction.image) {
                const stepImageHtml = this.generateResponsiveImage(instruction.image, 'gallery', {
                    alt: `Step ${instruction.step}: ${instruction.text.substring(0, 50)}...`
                });

                html += `
                        <div class="step-image" style="margin: 1rem 0; border-radius: 8px; overflow: hidden;">
                            ${stepImageHtml}
                        </div>`;
            }

            html += `</li>`;
            return html;
        }).join('');
    }

    renderNutrition(recipe) {
        return `
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

    renderStory(recipe) {
        if (!recipe.story) return '';

        return `
            <h2>${recipe.title} <em style="font-weight: 300; color: #e0a5a5;">(${recipe.story.subtitle})</em></h2>
            ${recipe.story.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}
        `;
    }

    renderTips(recipe) {
        if (!recipe.tips || recipe.tips.length === 0) return '';

        return `
            <h3>Pro Tips</h3>
            <ul class="tips-list">
                ${recipe.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;
    }

    renderFAQ(recipe) {
        if (!recipe.faq || recipe.faq.length === 0) return '';

        return `
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
    }

    renderRelatedRecipes(recipe, allRecipes) {
        // Get recipes from same categories
        const related = allRecipes
            .filter(r => r.slug !== recipe.slug) // Exclude current recipe
            .filter(r => r.categories.some(cat => recipe.categories.includes(cat))) // Same category
            .slice(0, 3); // Max 3 related

        if (related.length === 0) return '';

        return related.map(relatedRecipe => {
            // Generate responsive thumbnail for related recipe
            const relatedImageHtml = this.generateSimpleImage(relatedRecipe.image.thumbnail, {
                alt: relatedRecipe.title
            });

            return `
            <a href="${relatedRecipe.slug}.html" class="recipe-card-small">
                ${relatedImageHtml}
                <div class="recipe-info">
                    <h3>${relatedRecipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="time"><i class="far fa-clock"></i> ${relatedRecipe.timing.prepTimeDisplay}</span>
                        <span class="difficulty">${relatedRecipe.difficulty}</span>
                    </div>
                </div>
            </a>
        `;
        }).join('');
    }

    generateRecipeHTML(recipe, allRecipes, template) {
        const recipeSchema = this.generateJsonLdSchema(recipe);
        const breadcrumbSchema = this.generateBreadcrumbSchema(recipe);

        // Replace all template variables
        let html = template;

        // Meta tags
        html = html.replace(/{{TITLE}}/g, recipe.seo.metaTitle || `${recipe.title} | Yourwellnessgirly`);
        html = html.replace(/{{DESCRIPTION}}/g, recipe.seo.metaDescription || recipe.description);
        html = html.replace(/{{CANONICAL_URL}}/g, `https://yourwellnessgirly.com/recipes/${recipe.slug}`);
        html = html.replace(/{{OG_TITLE}}/g, recipe.seo.metaTitle || recipe.title);
        html = html.replace(/{{OG_DESCRIPTION}}/g, recipe.seo.metaDescription || recipe.description);
        // Open Graph image
        const ogImageSrc = typeof recipe.image.hero === 'string' ? recipe.image.hero : recipe.image.hero.src;
        html = html.replace(/{{OG_IMAGE}}/g, `https://yourwellnessgirly.com/${ogImageSrc}`);
        html = html.replace(/{{OG_URL}}/g, `https://yourwellnessgirly.com/recipes/${recipe.slug}`);

        // JSON-LD Schemas
        html = html.replace('{{RECIPE_SCHEMA}}', JSON.stringify(recipeSchema, null, 2));
        html = html.replace('{{BREADCRUMB_SCHEMA}}', JSON.stringify(breadcrumbSchema, null, 2));

        // Recipe content
        html = html.replace(/{{RECIPE_TITLE}}/g, recipe.title);
        html = html.replace(/{{RECIPE_DESCRIPTION}}/g, recipe.description);
        html = html.replace(/{{BREADCRUMB_TITLE}}/g, recipe.title);

        // Hero meta info
        html = html.replace(/{{PREP_TIME}}/g, recipe.timing.prepTimeDisplay);
        html = html.replace(/{{COOK_TIME}}/g, recipe.timing.cookTimeDisplay);
        html = html.replace(/{{TOTAL_TIME}}/g, recipe.timing.totalTimeDisplay);
        html = html.replace(/{{SERVINGS}}/g, `${recipe.servings.yield} ${recipe.servings.unit}`);

        // Diet badges
        html = html.replace('{{DIET_BADGES}}', this.renderDietBadges(recipe));
        html = html.replace(/{{DIFFICULTY}}/g, recipe.difficulty);

        // Hero image - responsive with WebP support
        const heroImageHtml = this.generateResponsiveImage(recipe.image.hero, 'hero', {
            aboveFold: true,
            alt: `${recipe.title} - healthy dessert recipe`
        });
        html = html.replace('{{HERO_IMAGE_HTML}}', heroImageHtml);

        // Fallback for legacy template variables
        const heroSrc = typeof recipe.image.hero === 'string' ? recipe.image.hero : recipe.image.hero.src;
        const heroAlt = typeof recipe.image.hero === 'string'
            ? `${recipe.title} - healthy dessert recipe`
            : recipe.image.hero.alt || `${recipe.title} - healthy dessert recipe`;
        html = html.replace(/{{HERO_IMAGE}}/g, `../${heroSrc}`);
        html = html.replace(/{{HERO_IMAGE_ALT}}/g, heroAlt);

        // Story section
        html = html.replace('{{STORY_CONTENT}}', this.renderStory(recipe));

        // Recipe card content
        html = html.replace(/{{RECIPE_SUBTITLE}}/g, recipe.categories.slice(0, 3).join(', '));
        html = html.replace(/{{AUTHOR_NAME}}/g, recipe.author.name.toUpperCase());
        html = html.replace(/{{CARD_PREP_TIME}}/g, recipe.timing.prepTimeDisplay.replace(' minutes', '').replace(' min', ''));
        html = html.replace(/{{CARD_COOK_TIME}}/g, recipe.timing.cookTimeDisplay.replace(' minutes', '').replace(' min', ''));
        html = html.replace(/{{CARD_TOTAL_TIME}}/g, recipe.timing.totalTimeDisplay.toUpperCase());
        html = html.replace(/{{CARD_YIELD}}/g, `${recipe.servings.yield} ${recipe.servings.unit}`);
        // Recipe card image - responsive thumbnail
        const cardImageHtml = this.generateSimpleImage(recipe.image.thumbnail, {
            alt: `${recipe.title} recipe card image`
        });
        html = html.replace('{{CARD_IMAGE_HTML}}', cardImageHtml);

        // Fallback for legacy template variables
        const cardSrc = typeof recipe.image.thumbnail === 'string' ? recipe.image.thumbnail : recipe.image.thumbnail.src;
        const cardAlt = typeof recipe.image.thumbnail === 'string'
            ? `${recipe.title} recipe card image`
            : recipe.image.thumbnail.alt || `${recipe.title} recipe card image`;
        html = html.replace(/{{CARD_IMAGE}}/g, `../${cardSrc}`);
        html = html.replace(/{{CARD_IMAGE_ALT}}/g, cardAlt);

        // Servings for adjuster
        html = html.replace(/{{INITIAL_SERVINGS}}/g, recipe.servings.yield);

        // Base amounts for servings calculator
        const baseAmounts = recipe.ingredients.map(ing => parseFloat(ing.amount) || 0);
        html = html.replace('{{BASE_AMOUNTS}}', baseAmounts.join(', '));

        // Recipe components
        html = html.replace('{{INGREDIENTS_LIST}}', this.renderIngredients(recipe));
        html = html.replace('{{INSTRUCTIONS_LIST}}', this.renderInstructions(recipe));
        html = html.replace('{{NUTRITION_TABLE}}', this.renderNutrition(recipe));

        // Tips section
        html = html.replace('{{TIPS_CONTENT}}', this.renderTips(recipe));

        // FAQ section
        html = html.replace('{{FAQ_CONTENT}}', this.renderFAQ(recipe));

        // Related recipes
        html = html.replace('{{RELATED_RECIPES}}', this.renderRelatedRecipes(recipe, allRecipes));

        return html;
    }

    /**
     * Generate a single recipe HTML file
     * @param {string} slug - Recipe slug to generate
     * @param {Array} allRecipes - All recipes for related recipe links
     */
    generateSingle(slug, allRecipes = null) {
        console.log(`Loading recipe: ${slug}`);
        const recipe = this.loadSingleRecipe(slug);

        if (!recipe) {
            console.error(`❌ Failed to load recipe: ${slug}`);
            this.reportIssues();
            return false;
        }

        // If allRecipes not provided, load them for related recipes
        if (!allRecipes) {
            console.log('Loading all recipes for related recipe links...');
            allRecipes = this.loadAllRecipes();
        }

        console.log('Loading HTML template...');
        const template = this.loadTemplate();

        console.log(`Generating ${recipe.slug}.html...`);
        const html = this.generateRecipeHTML(recipe, allRecipes, template);

        // Safety check: ensure we're writing to the correct output directory
        const outputFile = path.join(this.outputDir, `${recipe.slug}.html`);
        if (!outputFile.includes('/recipes/') || !outputFile.endsWith('.html')) {
            console.error(`❌ Invalid output path detected: ${outputFile}`);
            return false;
        }

        fs.writeFileSync(outputFile, html, 'utf8');
        console.log(`✅ Generated ${recipe.slug}.html`);

        this.reportIssues();
        return true;
    }

    /**
     * Generate all recipe HTML files
     */
    generateAll() {
        console.log('Loading all recipes...');
        const recipes = this.loadAllRecipes();

        if (recipes.length === 0) {
            console.error('❌ No valid recipes found!');
            this.reportIssues();
            process.exit(1);
        }

        console.log('Loading HTML template...');
        const template = this.loadTemplate();

        console.log(`Generating ${recipes.length} recipe pages...`);

        let successCount = 0;
        let failedCount = 0;

        recipes.forEach(recipe => {
            try {
                console.log(`Generating ${recipe.slug}.html...`);
                const html = this.generateRecipeHTML(recipe, recipes, template);

                // Safety check: ensure we're writing to the correct output directory
                const outputFile = path.join(this.outputDir, `${recipe.slug}.html`);
                if (!outputFile.includes('/recipes/') || !outputFile.endsWith('.html')) {
                    console.error(`❌ Invalid output path detected: ${outputFile}`);
                    failedCount++;
                    return;
                }

                fs.writeFileSync(outputFile, html, 'utf8');
                console.log(`✓ Generated ${recipe.slug}.html`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to generate ${recipe.slug}.html:`, error.message);
                failedCount++;
            }
        });

        console.log(`\n✅ Generation complete!`);
        console.log(`  - Successfully generated: ${successCount} recipes`);
        if (failedCount > 0) {
            console.log(`  - Failed: ${failedCount} recipes`);
        }

        console.log('\nGenerated files:');
        recipes.forEach(recipe => {
            console.log(`  - recipes/${recipe.slug}.html`);
        });

        this.reportIssues();
    }

    /**
     * Report any errors or warnings encountered during processing
     */
    reportIssues() {
        if (this.errors.length > 0) {
            console.log('\n🔴 ERRORS:');
            this.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n🟡 WARNINGS:');
            this.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
    }

    /**
     * Main entry point - handles command line arguments
     */
    run() {
        const args = process.argv.slice(2);

        if (args.length === 0) {
            console.log('Usage:');
            console.log('  node build/generate-recipes.js <recipe-slug>  # Generate single recipe');
            console.log('  node build/generate-recipes.js all            # Generate all recipes');
            console.log('');
            console.log('Examples:');
            console.log('  node build/generate-recipes.js banana-bites');
            console.log('  node build/generate-recipes.js all');
            process.exit(1);
        }

        const command = args[0];

        if (command === 'all') {
            this.generateAll();
        } else {
            // Validate slug format
            if (!/^[a-z0-9-]+$/.test(command)) {
                console.error(`❌ Invalid recipe slug format: "${command}"`);
                console.log('Recipe slugs should only contain lowercase letters, numbers, and hyphens.');
                process.exit(1);
            }

            const success = this.generateSingle(command);
            if (!success) {
                process.exit(1);
            }
        }
    }
}

// Run the generator
if (require.main === module) {
    const generator = new RecipeGenerator();
    generator.run();
}

module.exports = RecipeGenerator;