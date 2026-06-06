import xml.etree.ElementTree as ET
import os
import re
import urllib.request
import urllib.error
import concurrent.futures
from unserialize import phpserialize_parse

# Path configurations
xml_path = "selfhealthliving.WordPress.2026-06-06.xml"
public_uploads_dir = "public/images/uploads"
src_content_train = "src/content/train"
src_content_fuel = "src/content/fuel"
src_pages = "src/pages"
redirects_path = "public/_redirects"

# Ensure directories exist
os.makedirs(public_uploads_dir, exist_ok=True)
os.makedirs(src_content_train, exist_ok=True)
os.makedirs(src_content_fuel, exist_ok=True)
os.makedirs(src_pages, exist_ok=True)

# Namespaces in WordPress XML
ns = {
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'wfw': 'http://wellformedweb.org/CommentAPI/',
    'dc': 'http://purl.org/dc/elements/1.1/',
    'wp': 'http://wordpress.org/export/1.2/'
}

print("Loading XML file...")
tree = ET.parse(xml_path)
root = tree.getroot()
channel = root.find('channel')
items = channel.findall('item')
print(f"Loaded {len(items)} items.")

# 1. Map attachment IDs to URLs
attachments = {}
for item in items:
    post_type = item.find('wp:post_type', ns)
    if post_type is not None and post_type.text == 'attachment':
        post_id = item.find('wp:post_id', ns).text
        url_el = item.find('wp:attachment_url', ns)
        if url_el is not None and url_el.text:
            attachments[post_id] = url_el.text

print(f"Mapped {len(attachments)} attachments.")

# 2. Extract and parse recipes
recipes = {}
for item in items:
    post_type = item.find('wp:post_type', ns)
    if post_type is not None and post_type.text == 'wprm_recipe':
        recipe_id = item.find('wp:post_id', ns).text
        title = item.find('title').text
        
        # Parse postmeta
        meta_data = {}
        for meta in item.findall('wp:postmeta', ns):
            key_el = meta.find('wp:meta_key', ns)
            val_el = meta.find('wp:meta_value', ns)
            if key_el is not None:
                meta_data[key_el.text] = val_el.text if val_el is not None else None
        
        # Parse ingredients
        ingredients_raw = meta_data.get('wprm_ingredients')
        ingredients_parsed = phpserialize_parse(ingredients_raw)
        ingredients_list = []
        if ingredients_parsed and isinstance(ingredients_parsed, dict):
            # Typically structure is {0: {'ingredients': {...}, 'name': '', 'id': ...}}
            for group_idx, group in ingredients_parsed.items():
                if isinstance(group, dict) and 'ingredients' in group:
                    for ing_idx, ing in group['ingredients'].items():
                        if isinstance(ing, dict):
                            ingredients_list.append({
                                'amount': ing.get('amount', ''),
                                'unit': ing.get('unit', ''),
                                'name': ing.get('name', '').strip(),
                                'notes': ing.get('notes', '')
                            })
                            
        # Parse instructions
        instructions_raw = meta_data.get('wprm_instructions')
        instructions_parsed = phpserialize_parse(instructions_raw)
        instructions_list = []
        if instructions_parsed and isinstance(instructions_parsed, dict):
            for group_idx, group in instructions_parsed.items():
                if isinstance(group, dict) and 'instructions' in group:
                    for inst_idx, inst in group['instructions'].items():
                        if isinstance(inst, dict):
                            text = inst.get('text', '')
                            # Clean up <p> tags inside instructions text if needed
                            text_clean = re.sub(r'</?p[^>]*>', '', text).strip()
                            instructions_list.append(text_clean)
                            
        recipes[recipe_id] = {
            'title': title,
            'prep_time': meta_data.get('wprm_prep_time', '0'),
            'cook_time': meta_data.get('wprm_cook_time', '0'),
            'total_time': meta_data.get('wprm_total_time', '0'),
            'servings': meta_data.get('wprm_servings', ''),
            'servings_unit': meta_data.get('wprm_servings_unit', 'servings'),
            'ingredients': ingredients_list,
            'instructions': instructions_list,
            'parent_post_id': meta_data.get('wprm_parent_post_id', ''),
            'thumbnail_id': meta_data.get('_thumbnail_id')
        }

print(f"Parsed {len(recipes)} recipes.")

# Map parent posts to recipes
post_recipes = {}
for r_id, r_data in recipes.items():
    p_id = r_data['parent_post_id']
    if p_id:
        post_recipes[p_id] = r_data

# Train slugs set for mapping
train_slugs = {
    'why-strength-training-after-40-isnt-optional-its-essential',
    'why-2026-is-the-year-to-start-a-meditation-practice',
    'unlocking-your-best-years-why-genetics-arent-the-whole-story-for-longevity',
    'decoding-your-blood-sugar-a-new-path-to-peak-health-longevity',
    'why-we-built-the-selfhealth-app-moving-from-data-to-direction'
}

def get_pillar_and_slug(slug):
    if slug == 'besan-pancake-indian-style-chickpea-pancake':
        return 'root', 'besan-pancake-indian-style-chickpea-pancake'
    if slug in train_slugs:
        if slug == 'why-strength-training-after-40-isnt-optional-its-essential':
            return 'train', 'strength-training-after-40'
        if slug == 'why-2026-is-the-year-to-start-a-meditation-practice':
            return 'train', 'meditation-practice-2026'
        if slug == 'unlocking-your-best-years-why-genetics-arent-the-whole-story-for-longevity':
            return 'train', 'genetics-longevity'
        if slug == 'decoding-your-blood-sugar-a-new-path-to-peak-health-longevity':
            return 'train', 'decoding-blood-sugar'
        if slug == 'why-we-built-the-selfhealth-app-moving-from-data-to-direction':
            return 'train', 'why-we-built-selfhealth-app'
        return 'train', slug
    else:
        clean_slug = slug
        if slug == 'purple-protein-smoothie-post-workout-nutrient-packed-powerhouse':
            clean_slug = 'purple-protein-smoothie'
        elif slug == 'berry-supreme-a-fortifying-blend-for-peak-performance':
            clean_slug = 'berry-supreme'
        elif slug == 'fiber-fix-why-your-body-needs-this-secret-superfood-for-a-healthy-gut':
            clean_slug = 'fiber-fix'
        elif slug == 'unlock-the-power-of-magnesium-why-this-mighty-mineral-is-key-to-better-health':
            clean_slug = 'magnesium-guide'
        elif slug == 'ashwagandha-the-ancient-herb-for-modern-stress':
            clean_slug = 'ashwagandha'
        elif slug == 'gut-and-glow-power-smoothie':
            clean_slug = 'gut-and-glow-smoothie'
        elif slug == 'mango-carrot-dream-smoothie':
            clean_slug = 'mango-carrot-dream'
        elif slug == 'berry-bean-protein-smoothie':
            clean_slug = 'berry-bean-protein'
        elif slug == 'eggs-with-prosciutto-and-avocado-on-a-almond-tortilla':
            clean_slug = 'eggs-prosciutto-avocado-tortilla'
        elif slug == 'healthy-quick-chicken-caesar-wrap':
            clean_slug = 'chicken-caesar-wrap'
        elif slug == 'spice-up-your-plate-healthy-chicken-and-black-bean-tostadas':
            clean_slug = 'chicken-black-bean-tostadas'
        elif slug == 'spiced-up-lunch-an-amazing-chipotle-chicken-salad-bowl':
            clean_slug = 'chipotle-chicken-salad-bowl'
        elif slug == 'smoked-salmon-power-bowl-flavor-meets-quick':
            clean_slug = 'smoked-salmon-power-bowl'
        elif slug == 'easy-miso-glazed-cod-recipe-healthy-delicious-quick-dinner':
            clean_slug = 'miso-glazed-cod'
        elif slug == 'healthy-chickpea-curry-high-protein-vegan-dinner':
            clean_slug = 'chickpea-curry'
        elif slug == 'beyond-the-hype-why-2026-is-the-year-of-fiber':
            clean_slug = 'year-of-fiber-2026'
        return 'fuel', clean_slug

# Download image helper
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
def download_image(url):
    filename = url.split('/')[-1]
    # Clean query parameters if any
    filename = filename.split('?')[0]
    local_path = os.path.join(public_uploads_dir, filename)
    
    if os.path.exists(local_path):
        return url, f"/images/uploads/{filename}"
        
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(local_path, 'wb') as f:
                f.write(response.read())
        # print(f"Downloaded: {filename}")
        return url, f"/images/uploads/{filename}"
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return url, None

# Collect all image URLs to download
image_urls = set()

# First collect featured images
posts_to_migrate = []
redirects = []

for item in items:
    post_type = item.find('wp:post_type', ns)
    status = item.find('wp:status', ns)
    
    if post_type is not None and post_type.text == 'post' and status is not None and status.text == 'publish':
        post_id = item.find('wp:post_id', ns).text
        title = item.find('title').text
        slug = item.find('wp:post_name', ns).text
        date = item.find('pubDate').text
        content_html = item.find('content:encoded', ns).text or ''
        
        # Find thumbnail
        thumbnail_id = None
        for meta in item.findall('wp:postmeta', ns):
            key = meta.find('wp:meta_key', ns).text
            if key == '_thumbnail_id':
                thumbnail_id = meta.find('wp:meta_value', ns).text
                break
                
        featured_image_url = None
        if thumbnail_id and thumbnail_id in attachments:
            featured_image_url = attachments[thumbnail_id]
        elif post_id in post_recipes:
            # Fallback: check if the linked recipe has a thumbnail
            r_data = post_recipes[post_id]
            r_thumb_id = r_data.get('thumbnail_id')
            if r_thumb_id and r_thumb_id in attachments:
                featured_image_url = attachments[r_thumb_id]
                
        if featured_image_url:
            image_urls.add(featured_image_url)
            
        # Extract inline images
        inline_imgs = re.findall(r'<img [^>]*src="([^"]+)"', content_html)
        for img_url in inline_imgs:
            if 'selfhealthliving.com' in img_url:
                image_urls.add(img_url)
                
        posts_to_migrate.append({
            'post_id': post_id,
            'title': title,
            'slug': slug,
            'date': date,
            'content_html': content_html,
            'featured_image_url': featured_image_url
        })

print(f"Found {len(image_urls)} unique image URLs to download.")

# Download all images concurrently
url_map = {}
print("Downloading images concurrently...")
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    results = executor.map(download_image, image_urls)
    for url, local_rel_path in results:
        if local_rel_path:
            url_map[url] = local_rel_path

print("Images download completed.")

# 3. Process and write posts
redirect_rules = []

for post in posts_to_migrate:
    content = post['content_html']
    slug = post['slug']
    title = post['title']
    date = post['date']
    post_id = post['post_id']
    
    pillar, clean_slug = get_pillar_and_slug(slug)
    
    # Track redirect rule
    if pillar == 'root':
        # 1:1 route, no redirect needed, served at root
        dest_path = f"/{clean_slug}/"
    else:
        dest_path = f"/{pillar}/{clean_slug}/"
        redirect_rules.append(f"/{slug}/ {dest_path} 301")
        redirect_rules.append(f"/{slug} {dest_path} 301")
        
    # Replace inline image URLs
    for remote_url, local_path in url_map.items():
        content = content.replace(remote_url, local_path)
        
    # Local featured image path
    local_featured_image = ""
    if post['featured_image_url'] and post['featured_image_url'] in url_map:
        local_featured_image = url_map[post['featured_image_url']]
        
    # Check if this post has an associated recipe
    recipe_frontmatter = ""
    recipe_data = post_recipes.get(post_id)
    
    if recipe_data:
        # Format recipe as frontmatter metadata
        recipe_frontmatter = (
            f"recipe:\n"
            f"  title: \"{recipe_data['title']}\"\n"
            f"  prep_time: {recipe_data['prep_time']}\n"
            f"  cook_time: {recipe_data['cook_time']}\n"
            f"  total_time: {recipe_data['total_time']}\n"
            f"  servings: \"{recipe_data['servings']}\"\n"
            f"  servings_unit: \"{recipe_data['servings_unit']}\"\n"
            f"  ingredients:\n"
        )
        for ing in recipe_data['ingredients']:
            name_clean = ing['name'].replace('"', '\\"')
            notes_clean = ing['notes'].replace('"', '\\"')
            recipe_frontmatter += (
                f"    - name: \"{name_clean}\"\n"
                f"      amount: \"{ing['amount']}\"\n"
                f"      unit: \"{ing['unit']}\"\n"
                f"      notes: \"{notes_clean}\"\n"
            )
        recipe_frontmatter += "  instructions:\n"
        for inst in recipe_data['instructions']:
            inst_clean = inst.replace('"', '\\"')
            recipe_frontmatter += f"    - \"{inst_clean}\"\n"
            
    # Format publication date nicely
    # Example format: pubDate: Sat, 06 Jun 2026 21:00:52 +0000 -> 2026-06-06
    pub_date = "2026-06-06"
    try:
        # Basic regex to extract YYYY-MM-DD from pubDate if possible, otherwise keep default
        # Format is often "Day, DD Mon YYYY HH:MM:SS"
        match = re.search(r'\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})', date)
        if match:
            months = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"}
            day_match = re.search(r'(\d{1,2})', date)
            day = int(day_match.group(1)) if day_match else 1
            month_str = match.group(1)
            year = match.group(2)
            pub_date = f"{year}-{months[month_str]}-{day:02d}"
    except Exception as e:
        print(f"Error parsing date {date}: {e}")
        
    # Categories
    categories = []
    for cat in item.findall('category'):
        if cat.attrib.get('domain') == 'category':
            categories.append(cat.text)
            
    # Clean up Gutenburg block comments and clean up empty paragraph classes
    content = re.sub(r'<!-- /?wp:[^>]*-->', '', content)
    content = re.sub(r'class=""', '', content)
    content = re.sub(r'\s*\n\s*\n+', '\n\n', content) # reduce blank lines
    
    # Strip fallback recipe divs since we render them natively in Astro components!
    content = re.sub(r'<div class="wprm-fallback-recipe">.*?</div>', '', content, flags=re.DOTALL)
    
    # Format Markdown content
    if pillar == 'root':
        markdown_content = f"""---
layout: ../layouts/ArticleLayout.astro
title: "{title}"
date: "{pub_date}"
featured_image: "{local_featured_image}"
pillar: "fuel"
slug: "{clean_slug}"
{recipe_frontmatter}---

{content}
"""
        file_path = os.path.join(src_pages, f"{clean_slug}.md")
    else:
        markdown_content = f"""---
title: "{title}"
date: "{pub_date}"
featured_image: "{local_featured_image}"
pillar: "{pillar}"
slug: "{clean_slug}"
{recipe_frontmatter}---

{content}
"""
        folder = src_content_train if pillar == 'train' else src_content_fuel
        file_path = os.path.join(folder, f"{clean_slug}.md")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
        
print(f"Successfully migrated {len(posts_to_migrate)} posts.")

# 4. Write Cloudflare _redirects file
with open(redirects_path, 'w', encoding='utf-8') as f:
    f.write("# selfhealthliving.com static redirects\n")
    for rule in redirect_rules:
        f.write(f"{rule}\n")
        
print(f"Generated {len(redirect_rules)} redirect rules in public/_redirects.")
