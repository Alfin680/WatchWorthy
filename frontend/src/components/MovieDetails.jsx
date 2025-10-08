import React from 'react';
import './MovieDetails.css';
import { addMovieToWatchlist } from '../services/api'; // Import the new function

const MovieDetails = ({ movie }) => {
  if (!movie) {
    return null;
  }

  const handleAddToWatchlist = async () => {
    // Check if the user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Please log in to add movies to your watchlist.');
      // Optionally, redirect to login page
      // navigate('/login');
      return;
    }

    try {
      await addMovieToWatchlist(movie.id, movie.title);
      alert(`${movie.title} has been added to your watchlist!`);
    } catch (error) {
      // Handle cases where the movie might already be in the watchlist, etc.
      alert(`Could not add movie. Error: ${error.detail || 'Server error'}`);
    }
  };

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : 'https://via.placeholder.com/1280x720.png?text=No+Image+Available';

  return (
    <div className="movie-details-panel">
      <img src={backdropUrl} alt={movie.title} className="details-backdrop" />
      <h2 className="details-title">{movie.title}</h2>
      <p className="details-meta">{movie.release_date?.substring(0, 4)} | Action | Comedy</p>
      <p className="details-overview">{movie.overview || "No overview available."}</p>
      
      <div className="details-rating">
        <span className="rating-box">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
        <span>IMDb</span>
      </div>

      <button onClick={handleAddToWatchlist} className="add-watchlist-btn">
        + Add to Watchlist
      </button>
    </div>
  );
};

export default MovieDetails;