import os, urllib.request

os.makedirs("checkpoints", exist_ok=True)
os.makedirs("gfpgan/weights", exist_ok=True)

models = {
    "checkpoints/mapping_00109-model.pth.tar": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/mapping_00109-model.pth.tar",
    "checkpoints/mapping_00229-model.pth.tar": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/mapping_00229-model.pth.tar",
    "checkpoints/SadTalker_V0.0.2_256.safetensors": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_256.safetensors",
    "checkpoints/SadTalker_V0.0.2_512.safetensors": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_512.safetensors",
    "gfpgan/weights/alignment_WFLW_4HG.pth": "https://github.com/xinntao/facexlib/releases/download/v0.1.0/alignment_WFLW_4HG.pth",
    "gfpgan/weights/detection_Resnet50_Final.pth": "https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth",
}

def show_progress(block_num, block_size, total_size):
    downloaded = block_num * block_size
    percent = min(100, downloaded * 100 / total_size)
    print(f"\r  {percent:.1f}%", end="", flush=True)

for path, url in models.items():
    print(f"Downloading {path}...")
    urllib.request.urlretrieve(url, path, show_progress)
    print(f"\n  ✓ Done")

print("\nAll models downloaded!")