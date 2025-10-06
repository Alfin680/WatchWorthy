import React from 'react';

const MovieCard = ({ title, director, year }) => {
  return (
    <div>
      {/* We will build the movie card UI here */}
      <h3>{title}</h3>
      <p>{director}</p>
      <span>{year}</span>
    </div>
  );
};

export default MovieCard;