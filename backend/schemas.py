from pydantic import BaseModel, EmailStr


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