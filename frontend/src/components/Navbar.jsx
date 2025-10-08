import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/useAuth';
import { getCurrentUser } from '../services/api';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (isLoggedIn) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          logout();
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [isLoggedIn, logout]);

  useEffect(() => {
    // This syncs the search bar with the URL, useful for browser back/forward
    setSearchQuery(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>WATCHWORTHY</h1>
          <p>All your favourite movies in one place</p>
        </Link>
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search for movies"
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="navbar-user">
        {isLoggedIn ? (
          <>
            <Link to="/watchlist" className="watchlist-link">My Watchlist</Link>
            <div className="user-info">
              <span className="full-name">{user ? user.full_name : 'Loading...'}</span>
              <button onClick={handleLogout} className="logout-link">Logout</button>
            </div>
          </>
        ) : (
          <Link to="/login" className="auth-button" style={{ width: 'auto', padding: '10px 15px', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;