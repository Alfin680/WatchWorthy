from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib

# Corrected imports (no leading dots)
import models
from database import engine

# This line creates the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app
app = FastAPI()

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
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