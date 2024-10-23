import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, ownerRole, children }) => {
  return window.globalStore.user.hasRole(allowedRoles, ownerRole) ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
