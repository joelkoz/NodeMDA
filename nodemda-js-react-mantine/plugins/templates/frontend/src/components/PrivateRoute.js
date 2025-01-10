import React from 'react';
import { Navigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const PrivateRoute = ({ children }) => {
  return apiClient.isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
