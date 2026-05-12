import boto3
from ..config import settings

def get_s3_client():
    if not settings.R2_ACCOUNT_ID:
        # Local development with Minio
        return boto3.client(
            's3',
            endpoint_url="http://localhost:9000",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID or "r2_access_key",
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY or "r2_secret_key",
            region_name="us-east-1" # Minio default
        )
    return boto3.client(
        's3',
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    )

def get_presigned_url(s3_key: str):
    s3 = get_s3_client()
    return s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': settings.R2_BUCKET, 'Key': s3_key},
        ExpiresIn=3600
    )

def download_file(s3_key: str, local_path: str):
    s3 = get_s3_client()
    s3.download_file(settings.R2_BUCKET, s3_key, local_path)
