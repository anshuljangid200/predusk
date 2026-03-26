import boto3
from botocore.exceptions import ClientError
from app.core.config import S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET

class S3Service:
    @staticmethod
    def get_client():
        return boto3.client(
            "s3",
            endpoint_url=S3_ENDPOINT,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY,
            region_name="us-east-1", # Minio doesn't care much about region
        )

    @staticmethod
    def upload_file(file_obj, object_name):
        client = S3Service.get_client()
        try:
            client.upload_fileobj(file_obj, S3_BUCKET, object_name)
            return True
        except ClientError as e:
            print(f"S3 Upload Error: {e}")
            return False

    @staticmethod
    def download_file(object_name, file_path):
        client = S3Service.get_client()
        try:
            client.download_file(S3_BUCKET, object_name, file_path)
            return True
        except ClientError as e:
            print(f"S3 Download Error: {e}")
            return False

    @staticmethod
    def get_presigned_url(object_name, expiration=3600):
        client = S3Service.get_client()
        try:
            url = client.generate_presigned_url(
                "get_object",
                Params={"Bucket": S3_BUCKET, "Key": object_name},
                ExpiresIn=expiration,
            )
            return url
        except ClientError as e:
            print(f"S3 Presigned URL Error: {e}")
            return None
