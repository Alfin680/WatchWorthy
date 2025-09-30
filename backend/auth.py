from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
from jose import JWTError, jwt

# Setup for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# You should generate a truly random secret key.
# In your terminal, you can run: openssl rand -hex 32
SECRET_KEY = os.getenv("SECRET_KEY", "a_default_secret_key_for_dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt