import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // If the user is not logged in, redirect them to the /login page
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the child component (the protected page)
  return children;
};

export default ProtectedRoute;