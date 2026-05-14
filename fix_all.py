import os
import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

assets_dir = r"C:\Users\mutet\OneDrive\Desktop\el_uncle\assets"
for filename in os.listdir(assets_dir):
    if filename.endswith(".png"):
        path = os.path.join(assets_dir, filename)
        try:
            img = Image.open(path).convert("RGBA")
            img.save(path, "PNG")
        except Exception as e:
            pass
