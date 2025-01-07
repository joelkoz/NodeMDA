import apiClient from '../api/apiClient';
import { setUser, setIsAuthenticated } from '../auth/UserContext';

export const loginUser = async (username, password) => {
  try {
    // This API call does not require authorization
    apiClient.clearAuthHeader();

    const response = await apiClient.post('/login', { username, password });
    
    // Save the authorization token future requests
    apiClient.setAuthToken(response.data.token);

    let user = await fetchCurrentUser();

    // If we get here, we are all good
    setUser(user);
    setIsAuthenticated(true);
    
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerUser = async (username, password) => {
  try {
    // This API call does not require authorization
    apiClient.clearAuthHeader();

    const response = await apiClient.post('/register', { username, password });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};
