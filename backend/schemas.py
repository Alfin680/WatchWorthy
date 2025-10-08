from pydantic import BaseModel
from typing import List, Optional
from pydantic import BaseModel, validator
import re

# ==================================
# Schemas for Watchlist Items
# ==================================

class WatchlistItemBase(BaseModel):
    movie_id: int
    movie_title: str

class WatchlistItemCreate(WatchlistItemBase):
    pass

class WatchlistItem(WatchlistItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

# ==================================
# Schemas for Users
# ==================================

class UserBase(BaseModel):
    username: str
    email: str # Add this
    full_name: str # Add this

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    full_name: str # Ensure this line is present
    watchlist_items: list[WatchlistItem] = []

    class Config:
        from_attributes = True # Updated from orm_mode for Pydantic v2

# ==================================
# Schemas for Authentication (Tokens)
# ==================================

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(UserBase):
    password: str

    @validator('email')
    def validate_email(cls, v):
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        if not re.match(email_regex, v):
            raise ValueError('Invalid email address')
        return v

    @validator('password')
    def validate_password(cls, v):
        # Minimum eight characters, at least one letter and one number
        password_regex = r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
        if not re.match(password_regex, v):
            raise ValueError('Password must be at least 8 characters long and contain at least one number')
        return v