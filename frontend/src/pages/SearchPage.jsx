import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import MovieDetails from '../components/MovieDetails';
import { searchMovies } from '../services/api';
import './SearchPage.css'; // Make sure you have created this CSS file

// The full genre list from TMDB
const genres = [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 16, "name": "Animation" },
    { "id": 35, "name": "Comedy" },
    { "id": 80, "name": "Crime" },
    { "id": 99, "name": "Documentary" },
    { "id": 18, "name": "Drama" },
    { "id": 10751, "name": "Family" },
    { "id": 14, "name": "Fantasy" },
    { "id": 36, "name": "History" },
    { "id": 27, "name": "Horror" },
    { "id": 10402, "name": "Music" },
    { "id": 9648, "name": "Mystery" },
    { "id": 10749, "name": "Romance" },
    { "id": 878, "name": "Science Fiction" },
    { "id": 10770, "name": "TV Movie" },
    { "id": 53, "name": "Thriller" },
    { "id": 10752, "name": "War" },
    { "id": 37, "name": "Western" }
];

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  // State for filters
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        setSelectedMovie(null); // Reset selection when filters change
        const genreId = genre ? parseInt(genre) : null;
        const yearValue = year ? parseInt(year) : null;
        const results = await searchMovies(query, yearValue, genreId);
        setSearchResults(results);
        setLoading(false);
      };
      fetchResults();
    }
  }, [query, year, genre]); // Re-fetch when query or filters change

  const handleMovieSelect = (movie) => {
    setSelectedMovie(prevMovie => (prevMovie && prevMovie.id === movie.id ? null : movie));
  };

  return (
    <div className="main-container">
      <Navbar />
      <main>
        <h1>Search Results for "{query}"</h1>

        <div className="filters-container">
          <input
            type="number"
            placeholder="Year"
            className="filter-input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <select className="filter-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Searching...</p>
        ) : (
          <div className={`home-layout ${!selectedMovie ? 'no-selection' : ''}`}>
            <section>
              <div className="movies-grid">
                {searchResults.length > 0 ? (
                  searchResults.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onCardClick={handleMovieSelect}
                      isSelected={selectedMovie && selectedMovie.id === movie.id}
                    />
                  ))
                ) : (
                  <p>No results found for your criteria.</p>
                )}
              </div>
            </section>

            <aside className="details-container">
              <div className="details-wrapper">
                <MovieDetails movie={selectedMovie} />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;