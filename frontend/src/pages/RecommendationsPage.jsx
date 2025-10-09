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
      try {
        const watchlist = await getWatchlist();
        if (watchlist.length === 0) {
          setError("Your watchlist is empty. Add a movie to get recommendations.");
          setLoading(false);
          return;
        }

        const latestMovie = watchlist[watchlist.length - 1];
        setSourceMovie(latestMovie);

        const recs = await getRecommendations(latestMovie.movie_title);
        const detailedRecs = await Promise.all(
          recs.map(rec => getMovieDetails(rec.id))
        );

        setRecommendations(detailedRecs.filter(Boolean));
      } catch (err) {
        setError("Could not fetch recommendations. Please try again later.");
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