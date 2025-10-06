from pydantic import BaseModel
from typing import List, Optional

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