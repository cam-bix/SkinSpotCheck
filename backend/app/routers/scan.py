from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from PIL import Image, UnidentifiedImageError
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.audit import write_audit_log
from app.config import get_settings
from app.database import get_db
from app.models import Scan, User
from app.rate_limit import limiter
from app.schemas import DISCLAIMER, ScanResult
from app.security import get_current_user
from app.storage import get_storage
from ml.inference import predict_skin_spot

router = APIRouter(tags=["scan"])
ALLOWED_CONTENT_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


async def read_limited_upload(file: UploadFile) -> bytes:
    settings = get_settings()
    content = await file.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image is too large.")
    return content


def validate_image(file: UploadFile, content: bytes) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported image type.")
    try:
        with Image.open(BytesIO(content)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file.") from exc
    return ALLOWED_CONTENT_TYPES[file.content_type]


@router.post("/scan", response_model=ScanResult, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_settings().rate_limit_scan)
async def create_scan(
    request: Request,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Scan:
    content = await read_limited_upload(image)
    suffix = validate_image(image, content)
    storage = get_storage(get_settings().upload_dir)
    stored_path = storage.save(content, suffix)
    prediction = predict_skin_spot(BytesIO(content))

    original_name = Path(image.filename or "upload").name[:255]
    scan = Scan(
        user_id=current_user.id,
        original_filename=original_name,
        stored_path=stored_path,
        result=prediction.result,
        confidence=prediction.confidence,
        disclaimer=DISCLAIMER,
        model_version=prediction.model_version,
    )
    db.add(scan)
    db.flush()
    write_audit_log(db, "scan.create", user_id=current_user.id, details=f"scan_id={scan.id}")
    db.commit()
    db.refresh(scan)
    return scan


@router.get("/scan/history", response_model=list[ScanResult])
def get_scan_history(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Scan]:
    return list(
        db.scalars(
            select(Scan).where(Scan.user_id == current_user.id).order_by(desc(Scan.created_at))
        )
    )
