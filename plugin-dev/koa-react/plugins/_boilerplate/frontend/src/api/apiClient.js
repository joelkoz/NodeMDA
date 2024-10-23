import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // or localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear the token from sessionStorage
      apiClient.clearAuthToken();
      // Optionally, redirect to the login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Method to set the JWT token in sessionStorage and attach it to future requests
apiClient.setAuthToken = (token) => {
  sessionStorage.setItem('token', token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Method to clear the JWT token from sessionStorage and remove it from future requests
apiClient.clearAuthToken = () => {
  sessionStorage.removeItem('token');
  delete apiClient.defaults.headers.common['Authorization'];
};

// Method to clear the Authorization header for specific requests
apiClient.clearAuthHeader = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

// Method to check if the user is authenticated
apiClient.isAuthenticated = () => {
    const token = sessionStorage.getItem('token'); // or localStorage.getItem('token')
    return !!token; // Returns true if token exists, otherwise false
};

// Method to check if the user is authenticated
apiClient.hasRole = (allowedRoles, ownerRole) => {

  if (apiClient.isAuthenticated() && window.globalStore.user) {
    return window.globalStore.user.hasRole(allowedRoles, ownerRole);
  }
  return false;

};

export default apiClient;
