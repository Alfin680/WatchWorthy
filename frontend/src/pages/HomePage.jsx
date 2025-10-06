import React from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';

const HomePage = () => {
  return (
    <div className="main-container"> {/* Use the main container */}
      <Navbar />
      <main>
        {/* ... rest of your homepage content ... */}
        <h1>Home Page</h1>
      </main>
    </div>
  );
};

export default HomePage;