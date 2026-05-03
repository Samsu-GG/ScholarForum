from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    user_name: str
    full_name: str
    email: EmailStr
    password: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    user_id: int
    full_name: str
    user_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

    class Config:
        from_attributes = True



class SearchResponse(BaseModel):
    paper_id: int
    title: str
    abstract: str

    class Config:
        from_attributes = True
