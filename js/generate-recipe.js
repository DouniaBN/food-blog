/**
 * Recipe Generator Tool
 * Run this in the browser console to generate recipe HTML files from JSON data
 */

async function generateRecipeFromJSON(slug) {
    // Load the recipe template and manager
    await window.recipeManager.loadRecipes();

    const recipe = window.recipeManager.getRecipe(slug);
    if (!recipe) {
        console.error(`Recipe not found: ${slug}`);
        return null;
    }

    // Generate the HTML content using the template
    const html = window.recipeTemplate.generateRecipePage(recipe);

    // Create a downloadable file
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log(`Generated ${slug}.html - check your downloads!`);
    return html;
}

// Helper function to generate all recipes
async function generateAllRecipes() {
    await window.recipeManager.loadRecipes();

    for (const recipe of window.recipeManager.recipes) {
        await generateRecipeFromJSON(recipe.slug);
        // Add small delay to prevent browser throttling
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('All recipes generated!');
}

// Usage instructions
console.log(`
Recipe Generator Tools Available:

1. Generate single recipe:
   generateRecipeFromJSON('banana-bites')

2. Generate all recipes:
   generateAllRecipes()

3. Add new recipe to data/recipes.json, then generate:
   generateRecipeFromJSON('your-new-recipe-slug')
`);

// Make functions available globally
window.generateRecipeFromJSON = generateRecipeFromJSON;
window.generateAllRecipes = generateAllRecipes;