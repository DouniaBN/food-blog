# Yourwellnessgirly - Healthy Desserts Recipe Blog

## Project Overview
A high-performance, SEO-optimized recipe blog focused on healthy desserts. Built for maximum Google visibility, fast Core Web Vitals scores, and high user engagement.

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
   - Newsletter signup integration

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
- Conversion tracking for newsletter signups

## Future Enhancements
- User accounts and recipe saving
- Recipe rating and review system
- Email newsletter automation
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