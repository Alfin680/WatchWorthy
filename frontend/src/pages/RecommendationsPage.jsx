import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {  getRecommendations, getMovieDetails } from '../services/api';
import MovieCard from '../components/MovieCard';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [sourceMovie, setSourceMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchRecommendations = async () => {
    try {
      // The logic is now much simpler on the frontend
      const data = await getRecommendations();
      if (data.recommendations) {
        const detailedRecs = await Promise.all(
          data.recommendations.map(rec => getMovieDetails(rec.id))
        );
        setRecommendations(detailedRecs.filter(Boolean));
        setSourceMovie({ movie_title: data.source_movie });
      } else {
        setError("Could not generate recommendations from your watchlist.");
      }
    } catch (err) {
      setError(err.detail || "Could not fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };
  fetchRecommendations();
}, []);

  if (loading) {
    return (
      <div className="main-container">
        <Navbar />
        <main>
          <h1>Here are some recommendations for you...</h1>
          <p>Generating recommendations based on your watchlist...</p>
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
            <div className="movies-grid">
              {recommendations.map(movie => (
                // We don't need a click handler for recommendations, so we pass an empty function
                <MovieCard key={movie.id} movie={movie} onCardClick={() => {}} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RecommendationsPage;