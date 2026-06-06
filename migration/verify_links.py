import os
import re
from urllib.parse import urlparse, unquote

dist_dir = "dist"
errors = []

def check_file_exists(rel_path, base_file):
    # Unquote URL encoding
    rel_path = unquote(rel_path)
    
    # Remove query string / hash
    rel_path = rel_path.split('?')[0].split('#')[0]
    
    if not rel_path:
        return True
        
    if rel_path.startswith('/'):
        # Root-relative path
        abs_target = os.path.join(dist_dir, rel_path.lstrip('/'))
    else:
        # Relative path
        base_dir = os.path.dirname(base_file)
        abs_target = os.path.join(base_dir, rel_path)
        
    # Standardize path
    abs_target = os.path.abspath(abs_target)
    
    # Check if target exists as a file, or if it's a directory, check for index.html
    if os.path.exists(abs_target):
        return True
    
    # Cloudflare Pages / clean urls mapping
    if not os.path.splitext(abs_target)[1]:
        # Try appending .html or /index.html
        if os.path.exists(abs_target + ".html"):
            return True
        if os.path.exists(os.path.join(abs_target, "index.html")):
            return True
            
    return False

# Collect all files
html_files = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

print(f"Crawl began: found {len(html_files)} HTML files in dist/.")

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    # Find all hrefs
    hrefs = re.findall(r'href="([^"]+)"', content)
    for href in hrefs:
        # Ignore external links & anchors
        if href.startswith(('http://', 'https://', '//', 'mailto:', 'tel:')):
            continue
        if href.startswith('#'):
            continue
            
        if not check_file_exists(href, html_file):
            errors.append(f"Broken link in {html_file}: href=\"{href}\"")
            
    # Find all srcs (images, scripts)
    srcs = re.findall(r'src="([^"]+)"', content)
    for src in srcs:
        if src.startswith(('http://', 'https://', '//', 'data:')):
            continue
            
        if not check_file_exists(src, html_file):
            errors.append(f"Broken asset in {html_file}: src=\"{src}\"")

# Print results
print("\n--- LINK VERIFICATION RESULTS ---")
if not errors:
    print("SUCCESS: Zero broken links or local assets found!")
else:
    print(f"FAILED: Found {len(errors)} errors:")
    for err in errors:
        print(f"- {err}")
    exit(1)
