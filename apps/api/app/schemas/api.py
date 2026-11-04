from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    display_name: str = Field(default="", max_length=120)
    language: str = Field(default="fr", max_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, max_length=120)
    language: str | None = Field(default=None, max_length=8)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)


class AccountDelete(BaseModel):
    password: str = Field(min_length=1, max_length=128)


class SubmissionRequest(BaseModel):
    type: Literal["text", "url", "image"] = "text"
    content: str = Field(default="", max_length=8000)
    language: str = Field(default="fr", max_length=8)
