from sqlalchemy.orm import Session
import models
import schemas
from auth import get_password_hash

def get_user_by_username(db: Session, username: str):
    """
    Queries the database for a user with a specific username.
    """
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Creates a new user in the database.
    """
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_watchlist_items(db: Session, user_id: int):
    """
    Queries the database for all watchlist items belonging to a specific user.
    """
    return db.query(models.WatchlistItem).filter(models.WatchlistItem.owner_id == user_id).all()

def add_watchlist_item(db: Session, item: schemas.WatchlistItemCreate, user_id: int):
    """
    Creates a new watchlist item in the database for a specific user.
    """
    db_item = models.WatchlistItem(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def remove_watchlist_item(db: Session, item_id: int, user_id: int):
    """
    Removes a watchlist item from the database.
    Ensures that a user can only delete their own items.
    """
    db_item = db.query(models.WatchlistItem).filter(
        models.WatchlistItem.id == item_id,
        models.WatchlistItem.owner_id == user_id
    ).first()
    
    if db_item:
        db.delete(db_item)
        db.commit()
        return db_item
    return None