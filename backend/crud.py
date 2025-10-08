from sqlalchemy.orm import Session
import models
import schemas
from auth import get_password_hash

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str): # Add this new function
    """
    Queries the database for a user with a specific email.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email, # Add this
        full_name=user.full_name, # Add this
        hashed_password=hashed_password
    )
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

def update_user_password(db: Session, user: models.User, new_password: str):
    """
    Updates a user's password with a new hashed password.
    """
    hashed_password = get_password_hash(new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    db.refresh(user)
    return user