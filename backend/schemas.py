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
    year: str

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class ResultPageResponse(BaseModel):
    title: str
    publish_date: str  
    abstract: str
    pdf_link: str
    authors: str  
    comments: list = []

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    text: str


class CommentResponse(BaseModel):
    id: int
    author_name: str
    date: str
    text: str

    class Config:
        from_attributes = True