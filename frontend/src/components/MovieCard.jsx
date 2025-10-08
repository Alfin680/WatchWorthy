import React from 'react';
import './MovieCard.css';

const MovieCard = ({ movie, onCardClick, isSelected }) => {
  // Construct the full URL for the movie poster from TMDB
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null; // Use null if no poster path is available

  // Conditionally add the 'selected' class if the isSelected prop is true
  const cardClassName = `movie-card ${isSelected ? 'selected' : ''}`;

  return (
    // The onClick handler calls the function passed down from HomePage
    // The className is now dynamic based on the selection state
    <div className={cardClassName} onClick={() => onCardClick(movie)}>
      <div className="movie-poster">
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} />
        ) : (
          // Display a placeholder if there is no image
          <span>No Image</span>
        )}
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div className="movie-meta">
          {/* Safely get the year from the release_date string */}
          <span>{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;