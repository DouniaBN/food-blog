#!/usr/bin/env python3
"""
Convert JPG images to WebP format for better web performance
"""

import os
import sys
from PIL import Image

def convert_jpg_to_webp(jpg_path, webp_path, quality=85):
    """Convert a single JPG image to WebP format"""
    try:
        with Image.open(jpg_path) as img:
            # Convert to RGB if necessary (for transparency handling)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            # Save as WebP with specified quality
            img.save(webp_path, 'WebP', quality=quality, optimize=True)

            # Get file sizes for comparison
            jpg_size = os.path.getsize(jpg_path)
            webp_size = os.path.getsize(webp_path)
            savings = ((jpg_size - webp_size) / jpg_size) * 100

            print(f"✅ {os.path.basename(jpg_path)} → {os.path.basename(webp_path)}")
            print(f"   Size: {jpg_size//1024}KB → {webp_size//1024}KB ({savings:.1f}% smaller)")

    except Exception as e:
        print(f"❌ Error converting {jpg_path}: {e}")

def main():
    # Directory containing the brownie bar images
    image_dir = "/Users/douniabenazha/Desktop/YWG.com/images/recipes/brownie-batter-bars/"

    if not os.path.exists(image_dir):
        print(f"❌ Directory not found: {image_dir}")
        return

    print("🔄 Converting JPG images to WebP format...\n")

    # Find all JPG files in the directory
    jpg_files = [f for f in os.listdir(image_dir) if f.lower().endswith('.jpg')]

    if not jpg_files:
        print("❌ No JPG files found in directory")
        return

    converted_count = 0

    for jpg_file in jpg_files:
        jpg_path = os.path.join(image_dir, jpg_file)
        webp_file = jpg_file.rsplit('.', 1)[0] + '.webp'
        webp_path = os.path.join(image_dir, webp_file)

        # Skip if WebP already exists and is newer
        if os.path.exists(webp_path) and os.path.getmtime(webp_path) > os.path.getmtime(jpg_path):
            print(f"⏭️  Skipping {jpg_file} (WebP already exists and is newer)")
            continue

        convert_jpg_to_webp(jpg_path, webp_path)
        converted_count += 1

    print(f"\n🎉 Conversion complete! {converted_count} images converted to WebP format.")
    print("WebP images are typically 25-35% smaller than JPG with similar quality.")

if __name__ == "__main__":
    main()