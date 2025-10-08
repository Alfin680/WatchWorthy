import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State for validation and API errors
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to validate inputs
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain one number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) {
      return; // Stop submission if validation fails
    }
    setLoading(true);
    try {
      await registerUser(username, email, fullName, password);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setApiError(err.detail || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>WATCHWORTHY</h1>
        <p>Your personal Movie Companion</p>
        <h2>Sign Up</h2>

        <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Joseph Clay"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate} // Validate when user leaves the field
            placeholder="joseph@example.com"
            required
          />
          {errors.email && <p style={{ color: '#ff7b7b', fontSize: '0.8rem', marginTop: '5px' }}>{errors.email}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="josephclay"
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
            onBlur={validate} // Validate when user leaves the field
            required
          />
          {errors.password && <p style={{ color: '#ff7b7b', fontSize: '0.8rem', marginTop: '5px' }}>{errors.password}</p>}
        </div>
        
        {apiError && <p style={{ color: '#ff7b7b' }}>{apiError}</p>}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="auth-switch-text">
          Already have an Account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;