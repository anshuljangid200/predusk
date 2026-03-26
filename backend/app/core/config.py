import os
from redis import Redis

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# S3 / Minio Config
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://minio:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin")
S3_BUCKET = os.getenv("S3_BUCKET", "documents")

redis_client = Redis.from_url(REDIS_URL, decode_responses=True)

def get_redis():
    return redis_client
