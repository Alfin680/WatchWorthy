import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Import the context

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};