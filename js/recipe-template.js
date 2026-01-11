/**
 * Recipe Template Generator
 * Generates full recipe pages from JSON data
 */

class RecipeTemplate {
    constructor() {
        this.recipeManager = window.recipeManager;
    }

    // Generate complete recipe page HTML
    generateRecipePage(recipe) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${recipe.seo.metaTitle}</title>
    <meta name="description" content="${recipe.seo.metaDescription}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://yourwellnessgirly.com${recipe.seo.canonicalUrl}">
    <meta property="og:title" content="${recipe.title}">
    <meta property="og:description" content="${recipe.description}">
    <meta property="og:image" content="https://yourwellnessgirly.com${recipe.image.hero}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${recipe.title}">
    <meta property="twitter:description" content="${recipe.description}">
    <meta property="twitter:image" content="https://yourwellnessgirly.com${recipe.image.hero}">

    <!-- Canonical URL -->
    <link rel="canonical" href="https://yourwellnessgirly.com${recipe.seo.canonicalUrl}">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Karla:wght@400;700&display=swap" rel="stylesheet">

    <!-- Stylesheet -->
    <link rel="stylesheet" href="../style.css">

    <!-- Recipe Schema -->
    <script type="application/ld+json">
    ${JSON.stringify(this.recipeManager.generateRecipeSchema(recipe), null, 2)}
    </script>

    <style>
        .recipe-header {
            background: linear-gradient(135deg, var(--light-pink) 0%, var(--neutral-beige) 100%);
            padding: 3rem 2rem 2rem;
        }

        .recipe-title {
            font-family: var(--font-heading);
            font-size: 3rem;
            color: #2f4f2f;
            text-align: center;
            margin-bottom: 1rem;
        }

        .recipe-meta {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin: 2rem 0;
            flex-wrap: wrap;
        }

        .meta-item {
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .meta-label {
            font-size: 0.8rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
        }

        .meta-value {
            font-weight: bold;
            color: #2f4f2f;
            font-size: 1.1rem;
        }

        .recipe-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 3rem 2rem;
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 4rem;
        }

        .recipe-main {
            order: 1;
        }

        .recipe-sidebar {
            order: 2;
            background: var(--neutral-beige);
            padding: 2rem;
            border-radius: 20px;
            height: fit-content;
            position: sticky;
            top: 2rem;
        }

        .ingredient-list, .equipment-list {
            list-style: none;
            padding: 0;
        }

        .ingredient-list li, .equipment-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(47, 79, 47, 0.1);
            display: flex;
            justify-content: space-between;
        }

        .ingredient-amount {
            font-weight: bold;
            color: #2f4f2f;
        }

        .instruction-step {
            background: white;
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .step-number {
            background: var(--sage-green);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .recipe-notes {
            background: var(--light-pink);
            padding: 2rem;
            border-radius: 15px;
            margin-top: 2rem;
        }

        .category-tags {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            margin: 1rem 0;
            flex-wrap: wrap;
        }

        .category-tag {
            background: var(--sage-green);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        @media (max-width: 768px) {
            .recipe-content {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .recipe-sidebar {
                order: 1;
                position: static;
            }

            .recipe-main {
                order: 2;
            }

            .recipe-title {
                font-size: 2rem;
            }

            .recipe-meta {
                gap: 1rem;
            }

            .meta-item {
                padding: 0.8rem 1rem;
            }
        }
    </style>
</head>
<body>
    <header class="main-header">
        <div class="logo">
            <img src="../images/profile/logo.png" alt="Yourwellnessgirly Logo" class="logo-img">
            <a href="../index.html">yourwellnessgirly</a>
        </div>
        <nav>
            <ul>
                <li><a href="../index.html#recipes">Recipes ▾</a></li>
                <li><a href="../recipe-index.html">Recipe Index</a></li>
                <li><a href="../about.html">About Me</a></li>
                <li class="dropdown">
                    <a href="#" class="dropbtn">Contact ▾</a>
                    <div class="dropdown-content">
                        <a href="../work-with-me.html">Work With Me</a>
                        <a href="../contact.html">Contact Me</a>
                    </div>
                </li>
            </ul>
        </nav>
        <div class="social-icons">
            <a href="#" class="instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" class="pinterest"><i class="fab fa-pinterest"></i></a>
            <a href="#" class="tiktok"><i class="fab fa-tiktok"></i></a>
            <a href="#" class="email"><i class="fas fa-envelope"></i></a>
        </div>
    </header>

    <!-- Recipe Header -->
    <section class="recipe-header">
        <h1 class="recipe-title">${recipe.title}</h1>
        <p style="text-align: center; font-size: 1.2rem; color: #666; max-width: 600px; margin: 0 auto;">
            ${recipe.description}
        </p>

        <div class="category-tags">
            ${recipe.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
        </div>

        <div class="recipe-meta">
            <div class="meta-item">
                <div class="meta-label">Prep Time</div>
                <div class="meta-value">${recipe.timing.prepTimeDisplay}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Total Time</div>
                <div class="meta-value">${recipe.timing.totalTimeDisplay}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Servings</div>
                <div class="meta-value">${recipe.servings.yield} ${recipe.servings.unit}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Difficulty</div>
                <div class="meta-value">${recipe.difficulty}</div>
            </div>
        </div>
    </section>

    <!-- Recipe Content -->
    <div class="recipe-content">
        <!-- Sidebar with Ingredients -->
        <div class="recipe-sidebar">
            <h3 style="color: #2f4f2f; margin-bottom: 1.5rem;">Ingredients</h3>
            <ul class="ingredient-list">
                ${recipe.ingredients.map(ing => `
                    <li>
                        <span>${ing.ingredient}${ing.notes ? ` (${ing.notes})` : ''}</span>
                        <span class="ingredient-amount">${ing.amount} ${ing.unit}</span>
                    </li>
                `).join('')}
            </ul>

            <h3 style="color: #2f4f2f; margin: 2rem 0 1.5rem;">Equipment</h3>
            <ul class="equipment-list">
                ${recipe.equipment.map(item => `<li>${item}</li>`).join('')}
            </ul>

            <div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 10px;">
                <h4 style="color: #2f4f2f; margin-bottom: 1rem;">Nutrition (per serving)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                    <div>Calories: <strong>${recipe.nutrition.calories}</strong></div>
                    <div>Protein: <strong>${recipe.nutrition.protein}</strong></div>
                    <div>Carbs: <strong>${recipe.nutrition.carbs}</strong></div>
                    <div>Fat: <strong>${recipe.nutrition.fat}</strong></div>
                    <div>Fiber: <strong>${recipe.nutrition.fiber}</strong></div>
                    <div>Sugar: <strong>${recipe.nutrition.sugar}</strong></div>
                </div>
            </div>
        </div>

        <!-- Main Recipe Content -->
        <div class="recipe-main">
            <h2 style="color: #2f4f2f; margin-bottom: 2rem;">Instructions</h2>

            ${recipe.instructions.map(step => `
                <div class="instruction-step">
                    <div class="step-number">${step.step}</div>
                    <p style="line-height: 1.6; color: #444;">${step.text}</p>
                </div>
            `).join('')}

            ${recipe.notes && recipe.notes.length > 0 ? `
            <div class="recipe-notes">
                <h3 style="color: #2f4f2f; margin-bottom: 1rem;">Recipe Notes</h3>
                <ul style="line-height: 1.6; color: #666;">
                    ${recipe.notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h4>yourwellnessgirly</h4>
                <p>Healthy dessert recipes that don't compromise in taste for all dietary preferences. Because everyone deserves a sweet treat!</p>
            </div>
            <div class="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../recipe-index.html">Recipes</a></li>
                    <li><a href="../about.html">About Me</a></li>
                    <li><a href="../work-with-me.html">Work With Me</a></li>
                    <li><a href="../contact.html">Contact</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Follow Me</h4>
                <div class="footer-social">
                    <a href="#" class="instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="pinterest"><i class="fab fa-pinterest"></i></a>
                    <a href="#" class="tiktok"><i class="fab fa-tiktok"></i></a>
                    <a href="#" class="email"><i class="fas fa-envelope"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 yourwellnessgirly. All rights reserved.</p>
        </div>
    </footer>

    <script src="../js/recipe-manager.js"></script>
</body>
</html>
        `;
    }

    // Generate and save recipe page
    async generateRecipeFile(recipeSlug) {
        const recipe = this.recipeManager.getRecipe(recipeSlug);
        if (!recipe) {
            console.error(`Recipe not found: ${recipeSlug}`);
            return null;
        }

        const html = this.generateRecipePage(recipe);

        // In a real implementation, you'd save this to a file
        // For now, we'll return the HTML for manual saving
        return {
            filename: `${recipe.slug}.html`,
            content: html
        };
    }
}

// Create global instance
window.recipeTemplate = new RecipeTemplate();