import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..tools.s3 import get_s3_client
from ..config import settings
import os

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads a file to S3/Minio and returns the key.
    """
    try:
        s3 = get_s3_client()
        file_ext = os.path.splitext(file.filename)[1]
        unique_id = uuid.uuid4()
        s3_key = f"uploads/{unique_id}{file_ext}"
        
        # Read file content
        content = await file.read()
        
        # Upload to S3
        s3.put_object(
            Bucket=settings.R2_BUCKET,
            Key=s3_key,
            Body=content,
            ContentType=file.content_type
        )
        
        return {"s3_key": s3_key, "filename": file.filename}
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
