import axios from 'axios';

// Create an axios instance with the base URL of your backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// We can create an interceptor to automatically add the token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Function to handle user registration
export const registerUser = async (username, email, fullName, password) => {
  try {
    const response = await api.post('/users/', {
      username,
      email,
      full_name: fullName, // Use snake_case to match Pydantic model
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginUser = async (username, password) => {
  // The backend's OAuth2PasswordRequestForm expects 'x-www-form-urlencoded' data
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  try {
    const response = await api.post('/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // Store the token in localStorage
    localStorage.setItem('userToken', response.data.access_token);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getPopularMovies = async () => {
  try {
    const response = await api.get('/movies/popular');
    // The TMDB API wraps the movie list in a 'results' key
    return response.data.results;
  } catch (error) {
    console.error("Failed to fetch popular movies:", error);
    // Return an empty array or re-throw the error as needed
    return []; 
  }
};

// Function to add a movie to the watchlist
export const addMovieToWatchlist = async (movieId, movieTitle) => {
  try {
    const response = await api.post('/watchlist/', {
      movie_id: movieId,
      movie_title: movieTitle,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add movie to watchlist:", error.response.data);
    throw error.response.data;
  }
};

// Function to get the user's watchlist
export const getWatchlist = async () => {
  try {
    const response = await api.get('/watchlist/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch watchlist:", error.response.data);
    throw error.response.data;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    // This assumes you have an endpoint like this on your backend
    // Let's create it in the next step.
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch details for movie ${movieId}:`, error);
    return null;
  }
};

export const deleteWatchlistItem = async (itemId) => {
  try {
    const response = await api.delete(`/watchlist/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete watchlist item ${itemId}:`, error.response.data);
    throw error.response.data;
  }
};

// Function to get movie recommendations
export const getRecommendations = async () => {
  try {
    const response = await api.get(`/recommendations/`); // Changed endpoint
    return response.data; // The backend will return the full structure
  } catch (error) {
    console.error(`Failed to fetch recommendations:`, error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error.response.data);
    throw error.response.data;
  }
};

export const searchMovies = async (query, year = null, genreId = null) => {
  try {
    let url = `/movies/search?query=${encodeURIComponent(query)}`;
    if (year) {
      url += `&year=${year}`;
    }
    if (genreId) {
      url += `&genre_id=${genreId}`;
    }
    
    const response = await api.get(url);
    return response.data.results;
  } catch (error) {
    console.error("Failed to search movies:", error);
    return [];
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post(`/password-recovery/${email}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/reset-password/', {
      token,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};