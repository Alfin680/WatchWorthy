import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api'; // We'll create this next

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.msg);
    } catch (error) {
      setMessage('An error occurred. Please try again.',error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p>Enter your email and we'll send you a link to reset your password.</p>
        
        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {message && <p style={{ color: '#4CAF50' }}>{message}</p>}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        
        <p className="auth-switch-text">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;