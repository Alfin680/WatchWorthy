from fastapi import FastAPI, HTTPException, Depends, Body, Query 
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session 
import joblib
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import models
import schemas
import crud
import auth
from database import engine, SessionLocal
import requests 
import os

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
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",")]

print(f"✅ Allowing CORS for origins: {origins}") # Helpful for debugging

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
    print("--- SIGNUP STEP 1: Received request ---")
    
    print("--- SIGNUP STEP 2: Checking for existing username ---")
    db_user_by_username = crud.get_user_by_username(db, username=user.username)
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    print("--- SIGNUP STEP 3: Checking for existing email ---")
    db_user_by_email = crud.get_user_by_email(db, email=user.email)
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    print("--- SIGNUP STEP 4: Calling CRUD function to create user ---")
    new_user = crud.create_user(db=db, user=user)
    print("--- SIGNUP STEP 7: CRUD function finished, returning user ---")
    return new_user

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

# === RECOMMENDATION ENDPOINT ===
@app.get("/recommendations/")
def get_user_recommendations(
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Fetch the user's entire watchlist, ordered by most recent
    user_watchlist = db.query(models.WatchlistItem).filter(
        models.WatchlistItem.owner_id == current_user.id
    ).order_by(models.WatchlistItem.id.desc()).all()

    if not user_watchlist:
        raise HTTPException(status_code=404, detail="Watchlist is empty.")

    if movies is None or similarity is None:
        raise HTTPException(status_code=503, detail="Model is not available.")

    # Iterate through the watchlist to find a movie in our ML dataset
    for item in user_watchlist:
        matching_movies = movies[movies['title'] == item.movie_title]
        if not matching_movies.empty:
            movie_index = matching_movies.index[0]
            source_movie_title = item.movie_title
            
            # Found a match, now generate recommendations
            distances = similarity[movie_index]
            movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]

            recommended_movies = []
            for i in movies_list:
                rec_id = movies.iloc[i[0]].id
                rec_title = movies.iloc[i[0]].title
                recommended_movies.append({"id": int(rec_id), "title": rec_title})
            
            return {"source_movie": source_movie_title, "recommendations": recommended_movies}

    # If no movie in the watchlist was found in the dataset
    raise HTTPException(
        status_code=404,
        detail="Could not find any of your watchlist movies in our recommendation dataset."
    )

@app.get("/movies/search")
def search_movies(
    query: str,
    start_year: int = Query(None, description="Filter by start year"),
    end_year: int = Query(None, description="Filter by end year"),
    genre_id: int = Query(None, description="Filter by genre ID")
):
    tmdb_api_key = os.getenv("API_KEY")
    # ... (api key check) ...

    # Use the /discover/movie endpoint for better filtering, or fall back to /search
    # For simplicity, we'll enhance the /search and filter results.
    # A more advanced solution would be to use the /discover endpoint.
    
    base_url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": tmdb_api_key,
        "language": "en-US",
        "query": query,
        "page": 1,
        "include_adult": False
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])

        # Filter by genre if provided
        if genre_id:
            results = [movie for movie in results if genre_id in movie.get("genre_ids", [])]

        # Filter by year range if provided
        if start_year:
            results = [movie for movie in results if movie.get("release_date") and int(movie["release_date"][:4]) >= start_year]
        if end_year:
            results = [movie for movie in results if movie.get("release_date") and int(movie["release_date"][:4]) <= end_year]

        data["results"] = results
        return data
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error fetching from TMDB: {e}")

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

@app.get("/movies/popular")
def get_popular_movies():
    tmdb_api_key = os.getenv("API_KEY") # We already set this up in Model phase
    if not tmdb_api_key:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")

    url = f"https://api.themoviedb.org/3/movie/popular?api_key={tmdb_api_key}&language=en-US&page=1"
    
    try:
        response = requests.get(url)
        response.raise_for_status() # Raise an exception for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error fetching from TMDB: {e}")

@app.get("/movies/{movie_id}")
def get_movie_details(movie_id: int):
    tmdb_api_key = os.getenv("API_KEY")
    if not tmdb_api_key:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")

    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={tmdb_api_key}&language=en-US"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error fetching from TMDB: {e}")
    
@app.post("/password-recovery/{email}")
def recover_password(email: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=email)
    if not user:
        # Don't reveal that the user does not exist for security reasons
        # We'll just return a success message
        return {"msg": "If an account with this email exists, a password reset link has been sent."}
    
    password_reset_token = auth.create_password_reset_token(email=email)
    
    # In a real app, you would email this link.
    # For now, we print it to the backend terminal.
    reset_link = f"http://localhost:5173/reset-password?token={password_reset_token}"
    print("--- PASSWORD RESET LINK ---")
    print(reset_link)
    print("--------------------------")

    return {"msg": "If an account with this email exists, a password reset link has been sent."}


@app.post("/reset-password/")
def reset_password(
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(get_db)
):
    email = auth.verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    crud.update_user_password(db, user, new_password)
    return {"msg": "Password updated successfully."}    