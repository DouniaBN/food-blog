# Yourwellnessgirly - Healthy Desserts Recipe Blog

## Project Overview
A high-performance, SEO-optimized recipe blog focused on healthy desserts. Built for maximum Google visibility, fast Core Web Vitals scores, and high user engagement.

## IMPORTANT — Editing Existing Recipes

Whenever Dounia makes any change to a recipe (fixing a typo, updating prep time, changing ingredients, adding tags, updating images etc.), **always ask**:

> "Do you want me to update the other copies too?"

The same data lives in up to 4 places and they must stay in sync:
1. `recipes-data/[slug].json` — build script source
2. `data/recipes/[slug].json` — homepage/cards JS source
3. The hardcoded `recipes` array in `recipe-index.html` — filter/index page
4. `data/recipe-manifest.json` — only needed if slug or order changes

Never assume only one place needs updating. Always check and ask.

---

## Adding a New Recipe — REQUIRED STEPS

Every new recipe MUST follow these steps. Never skip any of them.

### 1. Create the recipe JSON file in `recipes-data/`
Add `recipes-data/[slug].json` — this is the PRIMARY source file. Copy the structure from an existing file (e.g. `recipes-data/apple-fritters.json`). This is what the build script reads to auto-generate HTML pages.

### 2. Create the matching JSON file in `data/recipes/`
Add `data/recipes/[slug].json` — this is the SAME content as step 1. The live site JavaScript (`recipe-manager.js`) reads from this folder to populate the homepage and recipe index cards. Both folders currently need to be kept in sync manually.

> **Why two folders?** `recipes-data/` feeds the Node build script. `data/recipes/` feeds the browser-side JS. They serve different parts of the system and are intentionally kept separate for easy manual editing.

### 3. Add the slug to the manifest
Add the recipe slug to the `recipes` array in `data/recipe-manifest.json`. This is what tells `recipe-manager.js` which slugs to fetch from `data/recipes/`. Order = display order (newest first = add to the END of the array).

### 4. Create the HTML recipe page
Create `recipes/[slug].html` using the existing recipe pages as a template — OR run the build script: `node build/generate-recipes.js [slug]`

### 5. Add to sitemap.xml
Add a `<url>` entry to `sitemap.xml` for every new recipe page. Use `priority 0.8` and today's date as `lastmod`. This is critical for Google indexing.

### 6. Add to the hardcoded recipes array in `recipe-index.html`
The recipe index page has a **hardcoded `recipes` array** inside a `<script>` tag (around line 874). This is completely separate from the JSON files and `recipe-manager.js` — it is what powers the filter, search, sort, and "Showing X recipes" count on the index page. You MUST add a new entry here for every recipe or it will not appear in the index.

Find the array (`const recipes = [`) and add a new object at the end (before the closing `];`). Use the next sequential `id`. Required fields:
```js
{
    id: <next number>,
    title: "Recipe Title",
    description: "Recipe description.",
    image: "images/recipes/[slug]/[slug]-card-300px.webp",
    url: "recipes/[slug].html",
    dietTypes: ["gluten-free", "dairy-free", "paleo", "refined-sugar-free", ...],
    ingredientCount: <number>,
    prepTime: <minutes as number>,
    difficulty: "easy",
    mealType: ["snack", "dessert"],
    mainIngredient: ["chocolate", "fruit", "matcha", ...],
    allergens: ["eggs", "nuts", "dairy", ...],
    equipment: ["no-bake", "oven", "mixer", "stovetop", "blender", ...]
}
```

### File Structure for Recipes
```
recipes-data/
└── [slug].json          ← PRIMARY source (build script reads this)

data/
├── recipe-manifest.json ← add slug here so homepage JS knows to load it
└── recipes/
    └── [slug].json      ← COPY of recipes-data file (live site JS reads this)

recipes/
└── [slug].html          ← generated HTML page (manual or via build script)

recipe-index.html        ← hardcoded recipes array MUST be updated manually
```

### How it works
- **Build script** (`build/generate-recipes.js`): reads `recipes-data/[slug].json` → outputs `recipes/[slug].html`
- **Live site JS** (`recipe-manager.js`): reads `data/recipe-manifest.json` for slug list → fetches each `data/recipes/[slug].json` → renders homepage/index cards
- **Recipe index page** (`recipe-index.html`): reads from its own hardcoded `recipes` array → powers filters, search, sort, and recipe count display

### NEVER edit `data/recipes.json` directly — it is now legacy/unused.

### Ingredient amount formatting
- Always use fractions, never decimals: `"1/2"` not `"0.5"`, `"1/4"` not `"0.25"`, `"3/4"` not `"0.75"`

---

## Quick Commands
```bash
# Start development server
python3 -m http.server 8000

# Lint and validate HTML
# TODO: Add HTML validator command

# Performance testing
# TODO: Add Lighthouse/PageSpeed commands

# Build/deployment
# TODO: Add build commands
```

## Current Status: 20% Complete

### ✅ What's Working
- Basic HTML structure and CSS styling
- Responsive layout with sidebar
- Social media integration
- Recipe card components
- Color scheme and typography (Libre Baskerville + Karla)

### ❌ Critical Issues Found

#### SEO Issues (HIGH PRIORITY)
- **NO H1 TAG** - Missing main heading for homepage
- **Multiple H2s without H1** - Breaks heading hierarchy (lines 56, 73, 88, 120)
- **Missing meta description** - No SEO description
- **Generic title tag** - "Yourwellnessgirly Blog" not optimized
- **No Open Graph tags** - Missing social media previews
- **No schema markup** - Missing recipe and organization structured data
- **Poor alt text** - Generic descriptions like "Post 1", "About Me"
- **No canonical URLs** - Missing duplicate content prevention

#### Performance Issues (HIGH PRIORITY)
- **No image optimization** - Missing lazy loading, WebP format, srcset
- **External font loading** - Google Fonts not optimized
- **No resource optimization** - Missing minification, compression
- **Inline CSS issues** - Unused styles, large CSS file
- **No service worker** - Missing offline/caching capability

## Image Optimization Standards

### Hero Images (Critical for LCP)
All hero images must include these performance optimizations:
```html
<picture>
    <source srcset="image-400.webp 400w, image-600.webp 600w, image-800.webp 800w, image-1200.webp 1200w, image-1600.webp 1600w"
            sizes="(max-width: 768px) 100vw, 50vw"
            type="image/webp">
    <img src="image-800.jpg"
         srcset="image-400.jpg 400w, image-600.jpg 600w, image-800.jpg 800w, image-1200.jpg 1200w, image-1600.jpg 1600w"
         sizes="(max-width: 768px) 100vw, 50vw"
         width="800"
         height="600"
         alt="Descriptive alt text of what's actually visible"
         loading="eager"
         fetchpriority="high"
         decoding="async" />
</picture>
```

### Recipe Card Images & Process Images
All non-hero images should use lazy loading:
```html
<img src="image.jpg"
     srcset="image-300.jpg 300w, image-600.jpg 600w"
     sizes="(max-width: 768px) 50vw, 300px"
     width="300"
     height="400"
     alt="Descriptive alt text"
     loading="lazy"
     decoding="async" />
```

### Image Creation Requirements
- **Multiple sizes**: 300px, 400px, 600px, 800px, 1200px, 1600px
- **WebP conversion**: Use convert-to-webp.py script for all images
- **Recipe cards**: Portrait format (300x508px, 600x1016px)
- **Hero images**: Landscape format optimized for responsive display
- **Alt text**: Describe what's actually visible, not marketing claims

#### Technical Issues (MEDIUM PRIORITY)
- **Missing viewport optimizations** - Mobile performance could be better
- **No error handling** - Missing 404 page, broken link handling
- **No analytics** - Missing Google Analytics/Search Console
- **Missing sitemap** - No XML sitemap for search engines
- **No robots.txt** - Missing crawler instructions

## SEO Strategy & Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Fix heading hierarchy**
   - Add H1: "Healthy Dessert Recipes" on homepage
   - Restructure existing H2s under proper H1

2. **Implement meta tags**
   - Title optimization: "Healthy Dessert Recipes | Quick & Easy | Yourwellnessgirly"
   - Meta descriptions for all pages
   - Open Graph and Twitter Card tags

3. **Add schema markup**
   - Organization schema for homepage
   - Recipe schema template for recipe pages
   - BreadcrumbList schema for navigation

### Phase 2: Content & Structure (Week 2)
1. **Recipe page template**
   - Complete recipe card with all required fields
   - JSON-LD recipe schema implementation
   - Print-friendly styles
   - User rating system

2. **Navigation improvements**
   - SEO-friendly URLs (/recipes/recipe-name)
   - Category pages with proper H1s
   - Breadcrumb navigation
   - Internal linking strategy

3. **Image optimization system**
   - WebP conversion with JPG fallbacks
   - Lazy loading implementation
   - Responsive images with srcset
   - Optimized alt text for all images

### Phase 3: Performance & Features (Week 3)
1. **Performance optimization**
   - CSS/JS minification
   - Font optimization (font-display: swap)
   - Image compression and optimization
   - Service worker for caching

2. **User engagement features**
   - Search functionality
   - Recipe filtering system
   - Social sharing buttons

3. **Advanced SEO**
   - XML sitemap generation
   - robots.txt optimization
   - Google Analytics integration
   - Search Console setup

## File Structure
```
/
├── index.html              # Homepage (needs H1 + meta tags)
├── style.css              # Main styles (needs optimization)
├── script.js              # Main JavaScript (not yet created)
├── CLAUDE.md              # This documentation
├── recipes/               # Recipe pages (to be created)
│   ├── banana-bites.html
│   ├── chia-cups.html
│   └── ...
├── categories/            # Category pages (to be created)
│   ├── no-bake.html
│   ├── vegan.html
│   └── ...
├── images/                # Optimized images (to be organized)
├── sitemap.xml           # Auto-generated sitemap
└── robots.txt            # Crawler instructions
```

## Recipe Schema Template
```json
{
  "@context": "https://schema.org/",
  "@type": "Recipe",
  "name": "Recipe Name",
  "image": ["image1.jpg", "image2.jpg"],
  "description": "Brief recipe description",
  "keywords": "healthy, dessert, no-bake, vegan",
  "author": {
    "@type": "Person",
    "name": "Dounia"
  },
  "datePublished": "2025-01-01",
  "prepTime": "PT15M",
  "cookTime": "PT0M",
  "totalTime": "PT15M",
  "recipeCategory": "Dessert",
  "recipeCuisine": "American",
  "recipeYield": "12 servings",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "150 calories"
  },
  "recipeIngredient": ["ingredient 1", "ingredient 2"],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "text": "Step 1 instructions"
    }
  ],
  "aggregateRating": 
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
```

## SEO Checklist for Each Recipe
- [ ] H1 with recipe name
- [ ] Meta title (recipe name + quick descriptor)
- [ ] Meta description (compelling, 150-160 chars)
- [ ] Recipe schema markup
- [ ] High-quality hero image (1200px+ wide)
- [ ] Optimized alt text for all images
- [ ] Canonical URL
- [ ] Social sharing buttons
- [ ] Internal links to related recipes
- [ ] Print-friendly styles

## Performance Targets
- **Page Load Speed**: <3 seconds
- **Largest Contentful Paint (LCP)**: <2.5s
- **First Input Delay (FID)**: <100ms
- **Cumulative Layout Shift (CLS)**: <0.1
- **Mobile PageSpeed Score**: 90+
- **Desktop PageSpeed Score**: 95+

## Content Guidelines
- **Recipe introductions**: 200-300 words with natural keyword inclusion
- **Alt text**: Descriptive and keyword-rich ("healthy chocolate avocado brownies on white plate")
- **Internal linking**: 3-5 related recipes per page
- **Meta descriptions**: Benefit-focused with clear value proposition

## Social Media Optimization
- **Pinterest**: Tall images (2:3 ratio), recipe overlay text
- **Instagram**: Square crops available for all recipe images
- **Facebook**: Open Graph tags with compelling descriptions
- **Twitter**: Twitter Card optimization for recipe sharing

## Analytics & Tracking
- Google Analytics 4 setup
- Google Search Console integration
- Core Web Vitals monitoring
- Recipe engagement tracking (saves, prints, shares)

## Future Enhancements
- User accounts and recipe saving
- Recipe rating and review system
- Recipe collections/meal plans
- Advanced search with filters
- Mobile app considerations
- Video recipe integration
- Nutrition calculator
- Shopping list generation
- Recipe scaling functionality

## Notes
- Focus on mobile-first design (majority of food blog traffic is mobile)
- Pinterest is the primary traffic driver for recipe blogs
- Google Recipe rich results are crucial for discovery
- Page speed directly impacts search rankings
- User engagement metrics (time on page, bounce rate) affect SEO