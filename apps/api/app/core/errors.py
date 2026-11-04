from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def error_body(code: str, message: str, request_id: str) -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "request_id": request_id}}


def request_id_of(request: Request) -> str:
    return getattr(request.state, "request_id", None) or str(uuid4())


class ApiError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(status_code=status_code, detail={"code": code, "message": message})
        self.code = code
        self.message = message


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error_handler(request: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(exc.code, exc.message, request_id_of(request)),
        )

    @app.exception_handler(HTTPException)
    async def http_error_handler(request: Request, exc: HTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict) and "code" in exc.detail:
            code = str(exc.detail.get("code"))
            message = str(exc.detail.get("message", "Request failed"))
        elif exc.status_code == 401:
            code, message = "unauthenticated", "Authentication required"
        elif exc.status_code == 403:
            code, message = "forbidden", "This action is not allowed"
        elif exc.status_code == 404:
            code, message = "not_found", "Resource not found"
        elif exc.status_code == 429:
            code, message = "rate_limited", "Too many requests"
        else:
            code, message = "request_failed", str(exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(code, message, request_id_of(request)),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        del exc
        return JSONResponse(
            status_code=422,
            content=error_body("invalid_input", "The request payload is invalid", request_id_of(request)),
        )
