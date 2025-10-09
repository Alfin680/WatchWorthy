import requests
import pandas as pd
import time
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import os

load_dotenv()

# --- Replace with your actual TMDB API key ---
API_KEY = os.getenv('API_KEY')

# Use a Session object for connection pooling and headers
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
})

def fetch_movie_data(api_key, num_pages=250):
    all_movies = []
    base_url = "https://api.themoviedb.org/3/movie/popular"
    for page in range(1, num_pages + 1):
        print(f"Fetching popular movies page {page}/{num_pages}...")
        try:
            response = session.get(base_url, params={'api_key': api_key, 'page': page}, timeout=10)
            response.raise_for_status()  # This will raise an exception for HTTP errors
            all_movies.extend(response.json()['results'])
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            # Optional: break the loop if one page fails
            break
        time.sleep(0.1)
    return pd.DataFrame(all_movies)

def get_movie_details(movie_id, api_key):
    base_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    try:
        response = session.get(base_url, params={'api_key': api_key, 'append_to_response': 'credits,keywords'}, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching details for movie ID {movie_id}: {e}")
        return None

# --- Main script execution ---

# Step 1: Fetch initial list of popular movies
movies_df = fetch_movie_data(API_KEY, num_pages=150)

if not movies_df.empty:
    # Step 2: Fetch details for each movie
    all_details = []
    total_movies = len(movies_df)
    for i, movie_id in enumerate(movies_df['id']):
        print(f"Fetching details for movie {i+1}/{total_movies} (ID: {movie_id})...")
        details = get_movie_details(movie_id, API_KEY)
        if details:
            all_details.append(details)
        time.sleep(0.1) # IMPORTANT: Add delay here too!

    details_df = pd.json_normalize(all_details)
    
    # Merge the dataframes carefully
    # Ensure columns don't clash by dropping duplicates from the original df
    movies_df = movies_df.drop(columns=[col for col in details_df.columns if col in movies_df.columns and col != 'id'], errors='ignore')
    movies_df = pd.merge(movies_df, details_df, on='id', how='inner')

    print(f"Dataset shape after fetching details: {movies_df.shape}")

    # --- Preprocessing and Feature Engineering (from here it's mostly the same) ---
    movies = movies_df[['id', 'title', 'overview', 'genres', 'keywords.keywords', 'credits.cast', 'credits.crew']].copy()

    def extract_names(data, key='name', limit=3):
        if isinstance(data, list):
            return [i[key] for i in data[:limit]]
        return []

    def get_director(crew_data):
        if isinstance(crew_data, list):
            for member in crew_data:
                if member['job'] == 'Director':
                    return [member['name']]
        return []

    movies['genres'] = movies['genres'].apply(extract_names)
    movies['keywords.keywords'] = movies['keywords.keywords'].apply(extract_names)
    movies['credits.cast'] = movies['credits.cast'].apply(extract_names)
    movies['credits.crew'] = movies['credits.crew'].apply(get_director)

    movies.rename(columns={'keywords.keywords': 'keywords', 'credits.cast': 'cast', 'credits.crew': 'director'}, inplace=True)

    for feature in ['genres', 'keywords', 'cast', 'director']:
      if feature in movies.columns:
        movies[feature] = movies[feature].apply(lambda x: [i.replace(" ", "") for i in x] if isinstance(x, list) else [])


    movies['tags'] = movies['overview'].fillna('').apply(lambda x: x.split()) + \
                     movies['genres'] + movies['keywords'] + movies['cast'] + movies['director']

    movies['tags'] = movies['tags'].apply(lambda x: " ".join(x).lower())

    final_df = movies[['id', 'title', 'tags']]
    print("Sample of final data:")
    print(final_df.head())

    # --- Vectorization and Similarity Calculation ---
    cv = CountVectorizer(max_features=5000, stop_words='english')
    vectors = cv.fit_transform(final_df['tags']).toarray()
    print(f"Vector shape: {vectors.shape}")

    similarity = cosine_similarity(vectors)
    print(f"Similarity matrix shape: {similarity.shape}")

    # --- Save Model Assets ---
    backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')

    # Create the backend directory if it doesn't exist
    os.makedirs(backend_dir, exist_ok=True)

    # Define the full file paths
    movies_df_path = os.path.join(backend_dir, 'movies_df.joblib')
    similarity_path = os.path.join(backend_dir, 'similarity.joblib')

    # Save the files to the specified paths
    joblib.dump(final_df, movies_df_path)
    joblib.dump(similarity, similarity_path)

    print(f"✅ Model assets saved successfully to the '{backend_dir}' directory!")
else:
    print("Could not fetch movie data. Aborting.")