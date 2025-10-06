from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base # Corrected import

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True) # Add this
    full_name = Column(String) # Add this
    hashed_password = Column(String)

    watchlist_items = relationship("WatchlistItem", back_populates="owner")


class WatchlistItem(Base):
    """
    SQLAlchemy model for the 'watchlist_items' table.
    """
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, index=True)
    movie_title = Column(String)
    
    # This column is a foreign key that links to the 'id' column of the 'users' table.
    owner_id = Column(Integer, ForeignKey("users.id"))

    # This creates the other side of the one-to-many relationship.
    # The 'owner' attribute on a WatchlistItem instance will be the User object it belongs to.
    owner = relationship("User", back_populates="watchlist_items")