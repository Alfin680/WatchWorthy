import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import MovieDetails from '../components/MovieDetails'; // Import MovieDetails
import { searchMovies } from '../services/api';

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null); // Add state for selection
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        setSelectedMovie(null); // Reset selection on new search
        const results = await searchMovies(query);
        setSearchResults(results);
        setLoading(false);
      };
      fetchResults();
    }
  }, [query]);

  // Handler to set the selected movie
  const handleMovieSelect = (movie) => {
    setSelectedMovie(prevMovie => (prevMovie && prevMovie.id === movie.id ? null : movie));
  };

  return (
    <div className="main-container">
      <Navbar />
      <main>
        <h1>Search Results for "{query}"</h1>
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
                      onCardClick={handleMovieSelect} // Pass the click handler
                      isSelected={selectedMovie && selectedMovie.id === movie.id} // Pass selection state
                    />
                  ))
                ) : (
                  <p>No results found.</p>
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