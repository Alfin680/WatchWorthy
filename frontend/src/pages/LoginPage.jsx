import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/useAuth'; // Correctly import the custom hook

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the global login function from our context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(username, password);
      login(data.access_token); // Update the global state with the new token
      navigate('/'); // Redirect to the homepage on successful login
    } catch (err) {
      setError(err.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>WATCHWORTHY</h1>
        <p>Your personal Movie Companion</p>
        <h2>Login</h2>

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--color-grey-text)', fontSize: '0.9rem' }}>Forgot Password?</Link>
          </div>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>

        <p className="auth-switch-text">
          Don't have an Account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;