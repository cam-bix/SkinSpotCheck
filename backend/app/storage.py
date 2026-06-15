from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


class LocalStorage:
    def __init__(self, upload_dir: str) -> None:
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save(self, file: UploadFile, content: bytes, suffix: str) -> str:
        safe_suffix = suffix.lower() if suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} else ".img"
        path = self.upload_dir / f"{uuid4().hex}{safe_suffix}"
        path.write_bytes(content)
        return str(path)
