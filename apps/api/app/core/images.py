import base64

from app.core.errors import ApiError

MAGIC = {
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/jpeg": b"\xff\xd8\xff",
    "image/webp": b"RIFF",
}


def detect_image_mime(data: bytes) -> str:
    if data.startswith(MAGIC["image/png"]):
        return "image/png"
    if data.startswith(MAGIC["image/jpeg"]):
        return "image/jpeg"
    if data.startswith(MAGIC["image/webp"]) and data[8:12] == b"WEBP":
        return "image/webp"
    raise ApiError(422, "invalid_input", "Unsupported or invalid image file")


def to_data_url(data: bytes, max_bytes: int) -> str:
    if len(data) > max_bytes:
        raise ApiError(413, "payload_too_large", "Image files must be 5 MB or smaller")
    mime = detect_image_mime(data)
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{encoded}"
