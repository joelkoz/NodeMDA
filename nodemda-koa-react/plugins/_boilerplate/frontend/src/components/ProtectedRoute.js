import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../auth/UserContext';

const ProtectedRoute = ({ allowedRoles, ownerRole, children }) => {
  const { user } = React.useContext(UserContext);
  return user.hasRole(allowedRoles, ownerRole) ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
