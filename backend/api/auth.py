from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import SessionLocal, get_db
from models import Users, UserRole
from core.authenticate import create_access_token
from schemas import RegisterRequest, LoginRequest, RegisterResponse, LoginResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



# -------------------------
# /register
# -------------------------
@router.post("/register", response_model=RegisterResponse)
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):

    # Check if email exists
    existing = db.query(Users).filter(Users.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(data.password)

    new_user = Users(
        full_name=data.full_name,
        user_name=data.user_name,
        email=data.email,
        password_hash=hashed_pw,
        role=UserRole.user   
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -------------------------
# /login
# -------------------------
@router.post("/login", response_model=LoginResponse)
def login_user(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(Users).filter(Users.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Create token
    token = create_access_token({
        "sub": user.user_id,
        "role": user.role.value
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "role": user.role.value
    }