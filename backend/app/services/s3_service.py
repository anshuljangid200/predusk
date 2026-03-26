import os
from io import BytesIO
from pathlib import Path

class S3Service:
    """
    Local file storage service — files are saved to disk.
    Drop-in replacement for the real S3 service for demo/dev deployments.
    """
    UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/tmp/predusk_uploads"))

    @classmethod
    def _ensure_dir(cls):
        cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def upload_file(file_obj, object_name):
        try:
            S3Service._ensure_dir()
            dest = S3Service.UPLOAD_DIR / object_name
            with open(dest, "wb") as f:
                f.write(file_obj.read())
            return True
        except Exception as e:
            print(f"Local Upload Error: {e}")
            return False

    @staticmethod
    def download_file(object_name, file_path):
        try:
            src = S3Service.UPLOAD_DIR / object_name
            import shutil
            shutil.copy(str(src), file_path)
            return True
        except Exception as e:
            print(f"Local Download Error: {e}")
            return False

    @staticmethod
    def get_presigned_url(object_name, expiration=3600):
        # Not meaningful for local storage; just return the path
        return f"/uploads/{object_name}"
