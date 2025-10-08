import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
// Import the new delete function
import { getWatchlist, getMovieDetails, deleteWatchlistItem } from '../services/api';
import { Link } from 'react-router-dom';
import WatchlistCard from '../components/WatchlistCard';

const WatchlistPage = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (useEffect hook remains the same) ...
  useEffect(() => {
    const fetchWatchlistData = async () => {
      if (!localStorage.getItem('userToken')) {
        setLoading(false);
        return;
      }
      try {
        const items = await getWatchlist();
        const detailedItems = await Promise.all(
          items.map(async (item) => {
            const movieDetails = await getMovieDetails(item.movie_id);
            return {
              ...item,
              poster_path: movieDetails?.poster_path,
            };
          })
        );
        setWatchlistItems(detailedItems);
      } catch (error) {
        console.error("Could not fetch watchlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlistData();
  }, []);


  // Update this function
  const handleRemoveItem = async (itemId) => {
    try {
      await deleteWatchlistItem(itemId);
      // If the API call is successful, remove the item from the local state
      setWatchlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      alert("Failed to remove item. Please try again.",error);
    }
  };

  // ... (return statement remains the same) ...
  if (loading) {
    return (
      <div className="main-container">
        <Navbar /> <main><h1>My Watchlist</h1><p>Loading...</p></main>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Navbar />
      <main>
        <h1>My Watchlist</h1>
        {watchlistItems.length > 0 ? (
          <div className="movies-grid">
            {watchlistItems.map(item => (
              <WatchlistCard
                key={item.id}
                item={item}
                posterPath={item.poster_path}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        ) : (
          <p>Your watchlist is empty. Go back to the <Link to="/">homepage</Link> to add some movies!</p>
        )}
      </main>
    </div>
  );
};

export default WatchlistPage;