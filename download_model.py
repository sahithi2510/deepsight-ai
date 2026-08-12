import os
import gdown

FILE_ID = "1940F97LpBKhGmywIMmz-K0Ib7QFXzhi0"
DEST_PATH = "backend/models/deepsight_model.pt"

def download_model():
    os.makedirs(os.path.dirname(DEST_PATH), exist_ok=True)
    if os.path.exists(DEST_PATH) and os.path.getsize(DEST_PATH) > 1000000:
        print(f"Model checkpoint already exists at {DEST_PATH} ({os.path.getsize(DEST_PATH)} bytes). Skipping download.")
        return

    print(f"Downloading model checkpoint from Google Drive (ID: {FILE_ID})...")
    url = f"https://drive.google.com/uc?id={FILE_ID}"
    gdown.download(url, DEST_PATH, quiet=False)
    print(f"Model downloaded successfully. File size: {os.path.getsize(DEST_PATH)} bytes.")

if __name__ == "__main__":
    download_model()
