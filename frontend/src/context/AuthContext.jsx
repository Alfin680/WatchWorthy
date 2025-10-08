import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null); // Export the context

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('userToken'));

  const login = (userToken) => {
    localStorage.setItem('userToken', userToken);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};