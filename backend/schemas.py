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

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    watchlist_items: List[WatchlistItem] = []

    class Config:
        orm_mode = True

# ==================================
# Schemas for Authentication (Tokens)
# ==================================

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None