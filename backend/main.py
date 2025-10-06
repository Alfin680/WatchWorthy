from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session 
import joblib
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import models
import schemas
import crud
import auth
from database import engine, SessionLocal

# This line creates the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize the FastAPI app
app = FastAPI()

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173",    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Model Assets at Startup ---
try:
    movies = joblib.load('movies_df.joblib')
    similarity = joblib.load('similarity.joblib')
    print("✅ Model assets loaded successfully.")
except FileNotFoundError:
    print("⚠️ Error: Model files not found. Ensure 'movies_df.joblib' and 'similarity.joblib' are in the 'backend' folder.")
    movies = None
    similarity = None

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the WatchWorthy Recommendation API"}

# ... (imports)

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user_by_username = crud.get_user_by_username(db, username=user.username)
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user_by_email = crud.get_user_by_email(db, email=user.email) # Add this check
    if db_user_by_email: # Add this check
        raise HTTPException(status_code=400, detail="Email already registered") # Add this check

    return crud.create_user(db=db, user=user)

# ... (rest of the file)
@app.get("/users/me/", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user

# === WATCHLIST ENDPOINTS ===

@app.post("/watchlist/", response_model=schemas.WatchlistItem)
def add_movie_to_watchlist(
    item: schemas.WatchlistItemCreate,
    db: Session = Depends(auth.get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    return crud.add_watchlist_item(db=db, item=item, user_id=current_user.id)


@app.get("/watchlist/", response_model=list[schemas.WatchlistItem])
def get_user_watchlist(
    db: Session = Depends(auth.get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    return crud.get_watchlist_items(db=db, user_id=current_user.id)


@app.delete("/watchlist/{item_id}", response_model=schemas.WatchlistItem)
def delete_watchlist_item(
    item_id: int,
    db: Session = Depends(auth.get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    db_item = crud.remove_watchlist_item(db=db, item_id=item_id, user_id=current_user.id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Watchlist item not found or you do not have permission to delete it")
    return db_item

@app.get("/recommendations/{movie_title}")
def get_recommendations(movie_title: str):
    if movies is None or similarity is None:
        raise HTTPException(status_code=503, detail="Model is not available. Please check server logs.")

    matching_movies = movies[movies['title'] == movie_title]
    if matching_movies.empty:
        raise HTTPException(status_code=404, detail=f"Movie '{movie_title}' not found in the dataset.")

    movie_index = matching_movies.index[0]

    distances = similarity[movie_index]
    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]

    recommended_movies = []
    for i in movies_list:
        movie_id = movies.iloc[i[0]].id
        title = movies.iloc[i[0]].title
        recommended_movies.append({"id": int(movie_id), "title": title})

    return {"source_movie": movie_title, "recommendations": recommended_movies}

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(
        data={"sub": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}