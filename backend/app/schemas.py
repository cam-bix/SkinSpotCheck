from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


DISCLAIMER = "This is not a diagnosis."


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ScanResult(BaseModel):
    id: int
    result: str
    confidence: float | None
    disclaimer: str
    model_version: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status: str
