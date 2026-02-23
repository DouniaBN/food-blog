#!/usr/bin/env python3
"""
Sitemap Generator for Yourwellnessgirly
========================================
Reads recipes from data/recipes.json and generates sitemap.xml.

Usage:
    python3 scripts/generate-sitemap.py

Run this script whenever you:
- Publish a new recipe (add it to data/recipes.json first)
- Update a recipe page
- Add a new static page
"""

import json
import os
from datetime import date

# Paths relative to project root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
RECIPES_JSON = os.path.join(ROOT_DIR, 'data', 'recipes.json')
SITEMAP_OUT = os.path.join(ROOT_DIR, 'sitemap.xml')

BASE_URL = "https://yourwellnessgirly.com"
TODAY = date.today().isoformat()

# Static pages — update this list when you add new non-recipe pages
STATIC_PAGES = [
    {"loc": "/",              "changefreq": "weekly",  "priority": "1.0", "lastmod": TODAY},
    {"loc": "/recipe-index",  "changefreq": "weekly",  "priority": "0.9", "lastmod": TODAY},
    {"loc": "/about",         "changefreq": "monthly", "priority": "0.8", "lastmod": "2025-01-10"},
    {"loc": "/work-with-me",  "changefreq": "monthly", "priority": "0.7", "lastmod": "2025-01-10"},
    {"loc": "/contact",       "changefreq": "monthly", "priority": "0.6", "lastmod": "2025-01-10"},
]


def build_url_entry(loc, lastmod, changefreq, priority):
    return (
        f"  <url>\n"
        f"    <loc>{BASE_URL}{loc}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        f"  </url>"
    )


def generate():
    with open(RECIPES_JSON, 'r') as f:
        data = json.load(f)

    entries = []

    # Static pages
    entries.append("  <!-- Main pages -->")
    for page in STATIC_PAGES:
        entries.append(build_url_entry(
            page["loc"], page["lastmod"], page["changefreq"], page["priority"]
        ))

    # Recipe pages from JSON
    entries.append("\n  <!-- Recipe pages -->")
    for recipe in data["recipes"]:
        slug = recipe["slug"]
        lastmod = recipe.get("dateModified") or recipe.get("datePublished") or TODAY
        entries.append(build_url_entry(
            f"/recipes/{slug}", lastmod, "monthly", "0.8"
        ))

    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries) + "\n"
        "</urlset>\n"
    )

    with open(SITEMAP_OUT, 'w') as f:
        f.write(sitemap)

    print(f"sitemap.xml updated — {len(data['recipes'])} recipe(s) + {len(STATIC_PAGES)} static page(s)")
    for r in data["recipes"]:
        print(f"  ✓ /recipes/{r['slug']}")


if __name__ == "__main__":
    generate()
