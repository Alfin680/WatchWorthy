import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import MovieDetails from '../components/MovieDetails';
import { getPopularMovies } from '../services/api';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await getPopularMovies();
        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Error fetching movies on component mount:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(prevMovie => (prevMovie && prevMovie.id === movie.id ? null : movie));
  };

  return (
    <div className="main-container">
      <Navbar />
      <main>
        <section className="recs-section">
          <h2>Don't know what to watch next? We gotchu...</h2>
          <Link to="/recommendations" className="recs-button">Get Recommendations ✨</Link>
        </section>

        {/* Wrap the movies and details in the home-layout div */}
        <div className={`home-layout ${!selectedMovie ? 'no-selection' : ''}`}>
          <section>
            <h2>Latest Movies</h2>
            {loading ? (
              <p>Loading movies...</p>
            ) : (
              <div className="movies-grid">
                {movies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onCardClick={handleMovieSelect}
                    isSelected={selectedMovie && selectedMovie.id === movie.id}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="details-container">
            <div className="details-wrapper">
               <MovieDetails movie={selectedMovie} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HomePage;