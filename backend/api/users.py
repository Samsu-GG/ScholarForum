from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Users
from schemas import RegisterResponse
from pydantic import BaseModel, Field, field_validator
import re

router = APIRouter(prefix="/users", tags=["users"])

class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    user_name: str | None = Field(default=None, min_length=3, max_length=30)

    @field_validator("user_name")
    @classmethod
    def username_alphanumeric(cls, v):
        if v is not None and not re.match(r"^\w+$", v):
            raise ValueError("user_name can only contain letters, numbers and underscores")
        return v

@router.get("/me", response_model=RegisterResponse)
def get_me(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=RegisterResponse)
def update_me(payload: UpdateProfileRequest, user_id: int, db: Session = Depends(get_db)):
    if not payload.full_name and not payload.user_name:
        raise HTTPException(status_code=422, detail="At least one field is required")

    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.user_name and payload.user_name != user.user_name:
        if db.query(Users).filter(Users.user_name == payload.user_name).first():
            raise HTTPException(status_code=409, detail="user_name already taken")
        user.user_name = payload.user_name

    if payload.full_name:
        user.full_name = payload.full_name

    db.commit()
    db.refresh(user)
    return user