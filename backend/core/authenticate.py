from jose import JWTError, jwt
from datetime import datetime, timedelta
import os


# ---- CONFIG ----
SECRET_KEY = os.environ.get("SECRET_KEY") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# -------------------------
# CREATE TOKEN
# -------------------------
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# -------------------------
# VERIFY + DECODE TOKEN
# -------------------------
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id: int = payload.get("sub")
        role: str = payload.get("role")

        if user_id is None:
            return None

        return {
            "user_id": user_id,
            "role": role
        }

    except JWTError:
        return None