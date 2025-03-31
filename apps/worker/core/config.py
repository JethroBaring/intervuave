import os

CHUNK_SAVE_DIR = os.path.join(os.path.dirname(__file__), "../chunks")
os.makedirs(CHUNK_SAVE_DIR, exist_ok=True)
