import React from 'react';
import './WatchlistCard.css';

const WatchlistCard = ({ item, posterPath, onRemove }) => {
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  const handleRemoveClick = (e) => {
    e.stopPropagation(); // Prevent card click event when clicking the button
    onRemove(item.id);
  };

  return (
    <div className="watchlist-card">
      <div className="watchlist-card-poster">
        {posterUrl ? (
          <img src={posterUrl} alt={item.movie_title} />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>No Image</div>
        )}
      </div>
      <div className="watchlist-card-title">{item.movie_title}</div>
      <button onClick={handleRemoveClick} className="remove-button">×</button>
    </div>
  );
};

export default WatchlistCard;