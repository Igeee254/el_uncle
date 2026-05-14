import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def fix_image(path):
    print(f"Fixing {path}")
    try:
        img = Image.open(path).convert('RGBA')
        img.save(path, 'PNG')
        print(f"Saved {path} safely as genuine PNG.")
    except Exception as e:
        print(f"Error reading {path}: {e}")

fix_image('assets/background.png')
fix_image('assets/bracelet.png')
fix_image('assets/keychain.png')
