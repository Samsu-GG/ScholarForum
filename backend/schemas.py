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

    
class SearchRequest(BaseModel):
    q: str = Field(..., example="deep learning")
    limit: int = Field(10, ge=1, example=10)
    offset: int = Field(0, ge=0, example=0)


class SearchResult(BaseModel):
    paper_id: int
    title: str
    abstract: str