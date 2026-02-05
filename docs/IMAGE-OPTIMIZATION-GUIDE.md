# 📸 Image Optimization Guide - Yourwellnessgirly

## Complete Ad-Ready Image Optimization System

This guide ensures all images meet Google's Core Web Vitals requirements and ad approval standards.

## 🎯 Quick Setup for New Recipes

### 1. Run the Image Optimization Script

```bash
# For hero images (main recipe photo)
python3 scripts/create-responsive-images.py path/to/original.jpg recipe-name --type hero

# For recipe card images
python3 scripts/create-responsive-images.py path/to/card.jpg recipe-name --type card

# For process/step images
python3 scripts/create-responsive-images.py path/to/step.jpg recipe-name --type process
```

### 2. Use the Generated HTML

The script outputs optimized HTML - copy and paste into your recipe template.

## ✅ Ad-Ready Checklist

### 1️⃣ Explicit Dimensions (CRITICAL)
```html
width="1600" height="2000"  <!-- Always include -->
```
- ✅ Prevents layout shift (CLS < 0.1)
- ✅ Reserves space for ads
- ✅ Required for ad network approval

### 2️⃣ Responsive Images (MANDATORY)
```html
<picture>
  <!-- WebP sources -->
  <source srcset="image-400.webp 400w, image-800.webp 800w" type="image/webp">
  <!-- JPG fallback -->
  <img srcset="image-400.jpg 400w, image-800.jpg 800w"
       sizes="(max-width: 768px) 100vw, 60vw" />
</picture>
```

### 3️⃣ Lazy Loading Strategy
- **Hero Image**: `loading="eager"` + `fetchpriority="high"`
- **All Other Images**: `loading="lazy"`

### 4️⃣ Fast LCP Requirements
- Hero image optimized for < 2.5s LCP
- High-quality but reasonable file size
- WebP format with JPG fallback

### 5️⃣ Zero Layout Shift (CLS)
- Dimensions locked in HTML
- Space reserved before image loads
- Consistent aspect ratios

### 6️⃣ Proper Intrinsic Sizing
- **Desktop**: 1200–1600px wide sources
- **Mobile**: 400–800px sources
- **Aspect**: 2:3 or 4:3 for food photos

### 7️⃣ Modern Format Support
- **Primary**: WebP (better compression)
- **Fallback**: Optimized JPG
- **Avoid**: PNG for photos

### 8️⃣ SEO-Optimized Markup
```html
alt="Descriptive, human-readable text about the food and context"
<!-- NOT: alt="image1" or generic descriptions -->
```

### 9️⃣ Ad-Safe Placement
- Natural gaps between content sections
- Images don't block scrolling
- Proper spacing for ad insertion

### 🔟 Performance Monitoring
- LCP: < 2.5s
- CLS: < 0.1
- FID: < 100ms

## 📋 Image Types & Specifications

### Hero Images
```
Sizes: 400w, 800w, 1200w, 1600w
Aspect: 4:5 (portrait, good for mobile)
Usage: Main recipe photo at top of page
Loading: eager + fetchpriority="high"
Alt: Detailed description including food, presentation, context
```

### Recipe Card Images
```
Sizes: 300w, 600w
Aspect: 4:3 (landscape)
Usage: Smaller image in recipe card
Loading: lazy
Alt: Brief but descriptive
```

### Process/Step Images
```
Sizes: 400w, 800w
Aspect: 4:3 (landscape)
Usage: Step-by-step instruction photos
Loading: lazy
Alt: Specific step description
```

### Gallery/Related Images
```
Sizes: 300w, 600w, 1200w
Aspect: Square or 4:3
Usage: Related recipes, thumbnails
Loading: lazy
Alt: Recipe name and brief description
```

## 🚀 Performance Optimizations

### File Size Targets
- **Hero WebP**: < 150KB (1200w)
- **Hero JPG**: < 200KB (1200w)
- **Card WebP**: < 50KB (600w)
- **Process WebP**: < 75KB (800w)

### Quality Settings
- **WebP**: 80% quality
- **JPG**: 85% quality with optimization

### Compression Strategy
1. Resize to exact dimensions needed
2. Apply quality compression
3. Strip metadata
4. Progressive/optimized encoding

## 📱 Responsive Breakpoints

### Sizes Attribute Patterns
```html
<!-- Hero Images -->
sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 60vw, 735px"

<!-- Card Images -->
sizes="(max-width: 768px) 50vw, 300px"

<!-- Process Images -->
sizes="(max-width: 768px) 100vw, 400px"
```

### Mobile-First Strategy
- Smallest images load on mobile
- Progressive enhancement for larger screens
- Bandwidth-conscious loading

## 🎨 Alt Text Best Practices

### Good Examples
```html
alt="No-Bake Mango Yogurt Chocolate Bites - creamy Greek yogurt and fresh mango wrapped in rich dark chocolate, displayed on white marble background"

alt="Step 2: Bowl of creamy Greek yogurt mixed with fresh diced mango pieces, showing the golden-yellow mixture ready to fill molds"

alt="Healthy Chocolate Banana Bites recipe card - three golden bites showing chocolate coating and banana filling"
```

### Avoid
```html
alt="image1"
alt="recipe photo"
alt="food"
alt="delicious healthy dessert recipe blog post"
```

### Formula
`[Recipe Name] - [visual description] + [context/setting]`

## 🔧 Technical Implementation

### Required HTML Attributes
```html
<img
  src="fallback.jpg"
  srcset="img-400.jpg 400w, img-800.jpg 800w, img-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 60vw"
  width="1200"     <!-- CRITICAL -->
  height="1500"    <!-- CRITICAL -->
  alt="Descriptive text"
  loading="lazy"   <!-- Or "eager" for hero -->
  decoding="async" <!-- Performance -->
  fetchpriority="high" <!-- Hero only -->
/>
```

### Picture Element Template
```html
<picture>
  <!-- Mobile WebP -->
  <source
    media="(max-width: 480px)"
    srcset="image-400.webp"
    type="image/webp">

  <!-- Desktop WebP -->
  <source
    srcset="image-800.webp 800w, image-1200.webp 1200w, image-1600.webp 1600w"
    type="image/webp">

  <!-- Mobile JPG fallback -->
  <source
    media="(max-width: 480px)"
    srcset="image-400.jpg"
    type="image/jpeg">

  <!-- Main img with full srcset -->
  <img src="image-1600.jpg"
       srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w, image-1600.jpg 1600w"
       sizes="(max-width: 480px) 100vw, 60vw"
       width="1600" height="2000"
       alt="Detailed description"
       loading="eager"
       fetchpriority="high" />
</picture>
```

## 🎯 Ad Network Requirements

### Critical Success Factors
1. **CLS < 0.1**: Images don't shift layout
2. **LCP < 2.5s**: Hero loads fast
3. **Proper spacing**: Ads can insert naturally
4. **Mobile optimized**: 70%+ traffic is mobile
5. **Fast global loading**: CDN recommended

### Testing Tools
- Google PageSpeed Insights
- Core Web Vitals extension
- WebP support testing
- Mobile-friendly test

## 🚧 Common Pitfalls to Avoid

### ❌ Layout Shift Killers
- Missing width/height attributes
- Images without defined aspect ratios
- JavaScript that resizes images post-load
- Inconsistent image sizes

### ❌ Performance Killers
- Hero image with `loading="lazy"`
- Serving huge images to mobile
- No WebP support
- Missing sizes attribute

### ❌ SEO Killers
- Generic alt text
- Images without context
- Broken image references
- Poor file naming

## 📊 Success Metrics

### Core Web Vitals Targets
- **LCP**: < 2.5s (Green)
- **FID**: < 100ms (Green)
- **CLS**: < 0.1 (Green)

### Image Performance
- WebP adoption rate: > 80%
- Average image load time: < 1s
- Mobile data usage: Minimized
- CDN cache hit rate: > 95%

## 🎉 Implementation Checklist

For each new recipe:

- [ ] Run image optimization script
- [ ] Generate all required sizes (400w, 800w, 1200w, 1600w)
- [ ] Create WebP versions
- [ ] Implement picture element with proper srcset
- [ ] Add explicit width/height dimensions
- [ ] Write descriptive, SEO-friendly alt text
- [ ] Set appropriate loading strategy
- [ ] Update schema.org JSON-LD with optimized URLs
- [ ] Test Core Web Vitals scores
- [ ] Verify mobile performance
- [ ] Check ad insertion points

---

*This system ensures your recipe blog meets all modern web performance standards and ad network requirements for maximum revenue potential.* 🚀