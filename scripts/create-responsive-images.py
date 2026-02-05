#!/usr/bin/env python3
"""
Image Optimization Script for Yourwellnessgirly Recipe Blog
Creates responsive image variants and WebP versions for optimal performance

Requirements: pip install Pillow
"""

import os
from PIL import Image
import argparse
from pathlib import Path

def create_responsive_images(input_path, recipe_name, image_type="hero"):
    """
    Create responsive image variants with proper sizing for food blog

    Args:
        input_path: Path to original image
        recipe_name: Recipe folder name (e.g., 'mango-yogurt-bites')
        image_type: 'hero', 'card', 'process', or 'gallery'
    """

    # Define sizes based on image type
    sizes = {
        'hero': {
            '400': (400, 500),   # Mobile portrait
            '800': (800, 1000),  # Small desktop
            '1200': (1200, 1500), # Large desktop
            '1600': (1600, 2000)  # High-res/retina
        },
        'card': {
            '300': (300, 225),   # Small card (4:3 aspect)
            '600': (600, 450),   # Retina card
        },
        'process': {
            '400': (400, 300),   # Step images (4:3 aspect)
            '800': (800, 600),   # Retina step images
        },
        'gallery': {
            '300': (300, 300),   # Square thumbnails
            '600': (600, 600),   # Retina thumbnails
            '1200': (1200, 900), # Gallery lightbox (4:3)
        }
    }

    # Create output directory
    recipe_dir = f"images/recipes/{recipe_name}"
    os.makedirs(recipe_dir, exist_ok=True)

    # Open original image
    with Image.open(input_path) as img:
        # Convert to RGB if necessary (for WebP compatibility)
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')

        original_width, original_height = img.size
        print(f"Original image: {original_width}x{original_height}")

        # Get base filename without extension
        base_name = Path(input_path).stem

        # Create each size variant
        for size_name, (width, height) in sizes[image_type].items():
            # Calculate dimensions maintaining aspect ratio
            img_ratio = original_width / original_height
            target_ratio = width / height

            if img_ratio > target_ratio:
                # Image is wider, fit to height
                new_height = height
                new_width = int(height * img_ratio)
            else:
                # Image is taller, fit to width
                new_width = width
                new_height = int(width / img_ratio)

            # Resize image
            resized = img.resize((new_width, new_height), Image.LANCZOS)

            # Crop to exact dimensions if needed (center crop)
            if new_width != width or new_height != height:
                left = (new_width - width) // 2
                top = (new_height - height) // 2
                right = left + width
                bottom = top + height
                resized = resized.crop((left, top, right, bottom))

            # Save JPG version (optimized)
            jpg_path = f"{recipe_dir}/{base_name}-{size_name}.jpg"
            resized.save(jpg_path, 'JPEG', quality=85, optimize=True)
            print(f"Created: {jpg_path} ({width}x{height})")

            # Save WebP version (better compression)
            webp_path = f"{recipe_dir}/{base_name}-{size_name}.webp"
            resized.save(webp_path, 'WebP', quality=80, optimize=True)
            print(f"Created: {webp_path} ({width}x{height})")

def generate_picture_element(recipe_name, base_name, image_type, alt_text, width, height, loading="lazy", fetchpriority=None):
    """Generate optimized HTML picture element"""

    sizes_map = {
        'hero': ['400', '800', '1200', '1600'],
        'card': ['300', '600'],
        'process': ['400', '800'],
        'gallery': ['300', '600', '1200']
    }

    sizes = sizes_map[image_type]

    # Build srcset strings
    webp_srcset = []
    jpg_srcset = []

    for size in sizes:
        webp_srcset.append(f"../images/recipes/{recipe_name}/{base_name}-{size}.webp {size}w")
        jpg_srcset.append(f"../images/recipes/{recipe_name}/{base_name}-{size}.jpg {size}w")

    # Generate sizes attribute based on image type
    if image_type == 'hero':
        sizes_attr = "(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 60vw, 735px"
    elif image_type == 'card':
        sizes_attr = "(max-width: 768px) 50vw, 300px"
    elif image_type == 'process':
        sizes_attr = "(max-width: 768px) 100vw, 400px"
    else:
        sizes_attr = "(max-width: 768px) 50vw, 300px"

    # Build picture element
    picture_html = f'''<picture>
    <source
        srcset="{', '.join(webp_srcset)}"
        type="image/webp">
    <img
        src="../images/recipes/{recipe_name}/{base_name}-{sizes[-1]}.jpg"
        srcset="{', '.join(jpg_srcset)}"
        sizes="{sizes_attr}"
        width="{width}"
        height="{height}"
        alt="{alt_text}"
        loading="{loading}"'''

    if fetchpriority:
        picture_html += f'\n        fetchpriority="{fetchpriority}"'

    picture_html += ' />\n</picture>'

    return picture_html

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Create responsive images for recipe blog')
    parser.add_argument('input_path', help='Path to original image')
    parser.add_argument('recipe_name', help='Recipe folder name')
    parser.add_argument('--type', choices=['hero', 'card', 'process', 'gallery'],
                       default='hero', help='Image type')

    args = parser.parse_args()

    create_responsive_images(args.input_path, args.recipe_name, args.type)

    # Example HTML output
    print("\nExample HTML:")
    print(generate_picture_element(
        args.recipe_name,
        Path(args.input_path).stem,
        args.type,
        f"Descriptive alt text for {args.recipe_name}",
        1600 if args.type == 'hero' else 600,
        2000 if args.type == 'hero' else 450,
        "eager" if args.type == 'hero' else "lazy",
        "high" if args.type == 'hero' else None
    ))