import os
import shutil
import glob

# Source paths
DESKTOP_SCREENSHOTS = "/Users/rimas/Desktop/Screenshots SHL App"
DESKTOP_PHOTOS = "/Users/rimas/Desktop/SHL Photos"

# Destination paths
PROJECT_ROOT = "/Users/rimas/Documents/antigravity/SHL Website"
BRAND_DIR = os.path.join(PROJECT_ROOT, "public/images/brand")
APP_DIR = os.path.join(PROJECT_ROOT, "public/images/app")
FOOD_DIR = os.path.join(PROJECT_ROOT, "public/images/food")
PEOPLE_DIR = os.path.join(PROJECT_ROOT, "public/images/people")

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")

def copy_files():
    # Ensure all destination directories exist
    ensure_dir(BRAND_DIR)
    ensure_dir(APP_DIR)
    ensure_dir(FOOD_DIR)
    ensure_dir(PEOPLE_DIR)

    # 1. Copy Logo variations
    logo_loop_src = os.path.join(DESKTOP_PHOTOS, "rimas4real_A_single_razor-sharp_line_that_loops_into_a_vertical_4a0d1d65-cf13-41b0-b185-ccd4bc485779.png")
    logo_sh_src = os.path.join(DESKTOP_PHOTOS, "rimas4real_i_would_like_to_add_the_letters_S__H_into_the_middle_de339b5d-4b31-4322-be28-e864558bc71e.png")

    if os.path.exists(logo_loop_src):
        shutil.copy2(logo_loop_src, os.path.join(BRAND_DIR, "logo-loop.png"))
        print("Copied logo-loop.png to public/images/brand/")
    else:
        print("Warning: logo-loop src not found!")

    if os.path.exists(logo_sh_src):
        shutil.copy2(logo_sh_src, os.path.join(BRAND_DIR, "logo-sh.png"))
        print("Copied logo-sh.png to public/images/brand/")
    else:
        print("Warning: logo-sh src not found!")

    # 2. Copy Screenshots from "Screenshots SHL App"
    screenshot_files = glob.glob(os.path.join(DESKTOP_SCREENSHOTS, "*.png"))
    for file_path in screenshot_files:
        filename = os.path.basename(file_path)
        # Normalize the name to make it easier to reference
        normalized_name = filename.lower().replace(" ", "_").replace("-", "_").replace("simulator_screenshot_", "")
        dest_path = os.path.join(APP_DIR, normalized_name)
        shutil.copy2(file_path, dest_path)
        print(f"Copied screenshot: {filename} -> {normalized_name}")

    # 3. Copy Food photos
    food_files = glob.glob(os.path.join(DESKTOP_PHOTOS, "food", "*.png"))
    for file_path in food_files:
        filename = os.path.basename(file_path)
        normalized_name = filename.lower().replace(" ", "_").replace("-", "_").replace("rimas4real_", "")
        dest_path = os.path.join(FOOD_DIR, normalized_name)
        shutil.copy2(file_path, dest_path)
        print(f"Copied food photo: {filename} -> {normalized_name}")

    # 4. Copy People photos
    people_files = glob.glob(os.path.join(DESKTOP_PHOTOS, "People", "*"))
    for file_path in people_files:
        filename = os.path.basename(file_path)
        normalized_name = filename.lower().replace(" ", "_").replace("-", "_").replace("rimas4real_", "")
        dest_path = os.path.join(PEOPLE_DIR, normalized_name)
        shutil.copy2(file_path, dest_path)
        print(f"Copied people photo: {filename} -> {normalized_name}")

if __name__ == "__main__":
    copy_files()
    print("Asset copying complete!")
