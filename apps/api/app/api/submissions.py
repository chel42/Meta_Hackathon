import json

from fastapi import APIRouter, Depends, Request
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.core.deps import current_user
from app.core.errors import ApiError
from app.core.images import to_data_url
from app.core.rate_limit import submission_limiter
from app.core.run_manager import RunManager
from app.models import User
from app.schemas.api import SubmissionRequest

router = APIRouter(tags=["submissions"])


@router.post("/submissions", status_code=202)
async def create_submission(
    request: Request,
    user: User = Depends(current_user),
    settings: Settings = Depends(get_settings),
) -> dict:
    submission_limiter.hit(user.id, limit=settings.submissions_per_hour, window_seconds=3600)
    header = request.headers.get("content-type", "")
    image_data_url = None
    if "multipart/form-data" in header:
        form = await request.form()
        content_type = str(form.get("type") or "image")
        text = str(form.get("content") or "")
        language = str(form.get("language") or user.language or "fr")
        upload = form.get("file")
        if content_type == "image":
            if upload is None or not hasattr(upload, "read"):
                raise ApiError(422, "invalid_input", "An image file is required")
            data = await upload.read()
            image_data_url = to_data_url(data, settings.max_image_bytes)
            text = text or getattr(upload, "filename", None) or "image"
    else:
        try:
            payload = SubmissionRequest.model_validate(await request.json())
        except (ValidationError, json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise ApiError(422, "invalid_input", "The request payload is invalid") from exc
        content_type = payload.type
        text = payload.content
        language = payload.language or user.language or "fr"
    if content_type not in {"text", "url", "image"}:
        raise ApiError(422, "invalid_input", "The request payload is invalid")
    if len(text) > settings.max_content_chars:
        raise ApiError(422, "invalid_input", "The request payload is invalid")
    if content_type != "image" and not text.strip():
        raise ApiError(422, "invalid_input", "The request payload is invalid")
    manager: RunManager = request.app.state.run_manager
    run_id = await manager.submit(
        user_id=user.id,
        content=text,
        content_type=content_type,
        language=language,
        image_data_url=image_data_url,
    )
    return {"run_id": run_id}
