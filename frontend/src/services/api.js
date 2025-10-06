import axios from 'axios';

// Create an axios instance with the base URL of your backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
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