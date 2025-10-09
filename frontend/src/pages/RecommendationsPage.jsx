import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getWatchlist, getRecommendations, getMovieDetails } from '../services/api';
import MovieCard from '../components/MovieCard';
import MovieDetails from '../components/MovieDetails'; // Import MovieDetails

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [sourceMovie, setSourceMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null); // Add state for selection

  useEffect(() => {
  const fetchRecommendations = async () => {
    // Make sure user is logged in before fetching
    if (!localStorage.getItem('userToken')) {
        setError("You must be logged in to get recommendations.");
        setLoading(false);
        return;
    }

    try {
      const watchlist = await getWatchlist();
      if (watchlist.length === 0) {
        setError("Your watchlist is empty. Add a movie to get recommendations.");
        setLoading(false);
        return;
      }

      // We'll now use the robust backend endpoint that finds a suitable movie
      const data = await getRecommendations();
      
      // IMPORTANT: Check if the backend returned recommendations
      if (data && data.recommendations && data.recommendations.length > 0) {
        setSourceMovie({ movie_title: data.source_movie });

        const detailedRecs = await Promise.all(
          data.recommendations.map(rec => getMovieDetails(rec.id))
        );
        
        setRecommendations(detailedRecs.filter(Boolean)); // Filter out any failed detail fetches
      } else {
        // This handles cases where the backend couldn't find a match
        setError("Could not generate recommendations from your current watchlist.");
      }
    } catch (err) {
      // This will now only catch actual network or server errors
      setError("An error occurred while fetching recommendations. Please try again later.");
      console.error("Recommendation fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchRecommendations();
}, []);

  // Handler to set the selected movie
  const handleMovieSelect = (movie) => {
    setSelectedMovie(prevMovie => (prevMovie && prevMovie.id === movie.id ? null : movie));
  };

  if (loading) {
    return (
      <div className="main-container">
        <Navbar />
        <main>
          <h1>Generating recommendations...</h1>
          <p>Please wait while we find movies you might like.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Navbar />
      <main>
        <h1>Recommendations</h1>
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            <p>Because you watched "{sourceMovie?.movie_title}"</p>
            <div className={`home-layout ${!selectedMovie ? 'no-selection' : ''}`}>
              <section>
                <div className="movies-grid">
                  {recommendations.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onCardClick={handleMovieSelect}
                      isSelected={selectedMovie && selectedMovie.id === movie.id}
                    />
                  ))}
                </div>
              </section>

              <aside className="details-container">
                <div className="details-wrapper">
                  <MovieDetails movie={selectedMovie} />
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RecommendationsPage;