import React from 'react';
import './Navbar.css'; // Import the CSS file
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  // We'll replace this with real user data later
  const isLoggedIn = localStorage.getItem('userToken'); 
  const username = 'TestUser'; // Placeholder username

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h1>WATCHWORTHY</h1>
        <p>All your favourite movies in one place</p>
      </div>

      <div className="navbar-search">
        <input type="text" placeholder="Search for movies" className="search-bar" />
      </div>

      <div className="navbar-user">
        {isLoggedIn ? (
          <>
            <span>{username}</span>
            {/* We can add a user icon here later */}
            <button onClick={handleLogout} className="auth-button" style={{width: 'auto', padding: '10px 15px'}}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="auth-button" style={{width: 'auto', padding: '10px 15px', textDecoration: 'none'}}>Login</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;