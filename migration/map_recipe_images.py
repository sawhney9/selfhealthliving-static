import os
import glob
import re

PROJECT_ROOT = "/Users/rimas/Documents/antigravity/SHL Website"
FUEL_DIR = os.path.join(PROJECT_ROOT, "src/content/fuel")
TRAIN_DIR = os.path.join(PROJECT_ROOT, "src/content/train")
FOOD_DIR = os.path.join(PROJECT_ROOT, "public/images/food")
PEOPLE_DIR = os.path.join(PROJECT_ROOT, "public/images/people")

def get_normalized_map():
    # Scan public/images/food and public/images/people
    food_images = glob.glob(os.path.join(FOOD_DIR, "*"))
    people_images = glob.glob(os.path.join(PEOPLE_DIR, "*"))
    
    mapping = {}
    
    # Helper to create a simplified key (alphanumeric only)
    def clean_key(filename):
        # Remove extension and non-alphanumeric chars, and lower-case it
        name_without_ext = os.path.splitext(filename)[0]
        # Remove rimas4real_ prefix if any
        name_without_prefix = name_without_ext.replace("rimas4real_", "")
        return re.sub(r'[^a-z0-9]', '', name_without_prefix.lower())

    for img_path in food_images:
        filename = os.path.basename(img_path)
        key = clean_key(filename)
        mapping[key] = f"/images/food/{filename}"
        
    for img_path in people_images:
        filename = os.path.basename(img_path)
        key = clean_key(filename)
        mapping[key] = f"/images/people/{filename}"
        
    return mapping

def update_markdown_files():
    img_map = get_normalized_map()
    print(f"Loaded {len(img_map)} high-res custom images for mapping.")
    
    markdown_files = glob.glob(os.path.join(FUEL_DIR, "*.md")) + glob.glob(os.path.join(TRAIN_DIR, "*.md"))
    # Also include the Chilla recipe page if it's markdown or MDX
    chilla_file = os.path.join(PROJECT_ROOT, "src/pages/besan-pancake-indian-style-chickpea-pancake.md")
    if os.path.exists(chilla_file):
        markdown_files.append(chilla_file)
        
    def clean_key_from_url(url):
        filename = os.path.basename(url)
        # Remove rimas4real_ prefix if any
        name_without_ext = os.path.splitext(filename)[0]
        name_without_prefix = name_without_ext.replace("rimas4real_", "")
        return re.sub(r'[^a-z0-9]', '', name_without_prefix.lower())

    updated_count = 0
    
    for file_path in markdown_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        # 1. Search for featured_image in frontmatter
        featured_image_match = re.search(r'featured_image:\s*["\']?([^"\']+)["\']?', content)
        if featured_image_match:
            old_url = featured_image_match.group(1)
            key = clean_key_from_url(old_url)
            if key in img_map:
                new_url = img_map[key]
                if old_url != new_url:
                    content = content.replace(f'featured_image: "{old_url}"', f'featured_image: "{new_url}"')
                    content = content.replace(f"featured_image: '{old_url}'", f"featured_image: '{new_url}'")
                    content = content.replace(f"featured_image: {old_url}", f"featured_image: {new_url}")
                    print(f"[{os.path.basename(file_path)}] Updated featured_image: {old_url} -> {new_url}")
                    modified = True
                    
        # 2. Search for any images in the content body (markdown or HTML img tags)
        # e.g., src="/images/uploads/..." or ![](/images/uploads/...)
        all_urls = re.findall(r'src=["\']?(/images/uploads/[^"\'>\s]+)["\']?', content)
        all_urls += re.findall(r'!\[.*?\]\((/images/uploads/[^)]+)\)', content)
        
        for old_url in set(all_urls):
            # Clean up URL parameters/sizes if any (e.g. -300x300.png)
            base_url = re.sub(r'-\d+x\d+(\.[a-zA-Z]+)$', r'\1', old_url)
            key = clean_key_from_url(base_url)
            if key in img_map:
                new_url = img_map[key]
                if old_url != new_url:
                    content = content.replace(old_url, new_url)
                    print(f"[{os.path.basename(file_path)}] Updated body image: {old_url} -> {new_url}")
                    modified = True
                    
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_count += 1
            
    print(f"Successfully updated {updated_count} markdown files with high-res images.")

if __name__ == "__main__":
    update_markdown_files()
