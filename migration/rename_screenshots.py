import os
import glob

PROJECT_ROOT = "/Users/rimas/Documents/antigravity/SHL Website"
APP_DIR = os.path.join(PROJECT_ROOT, "public/images/app")

def rename_screenshots():
    # Find all copied screenshots
    files = glob.glob(os.path.join(APP_DIR, "*.png"))
    
    # Exclude paywall.png and already renamed screens if any
    files = [f for f in files if "paywall.png" not in f and "app_screen_" not in f]
    
    # Sort files by their original filename (which contains date/time stamp)
    files.sort()
    
    for i, file_path in enumerate(files):
        new_name = f"app_screen_{i+1}.png"
        new_path = os.path.join(APP_DIR, new_name)
        os.rename(file_path, new_path)
        print(f"Renamed: {os.path.basename(file_path)} -> {new_name}")

if __name__ == "__main__":
    rename_screenshots()
