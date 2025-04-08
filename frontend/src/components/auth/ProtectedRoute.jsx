import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

/**
 * A wrapper around routes that require authentication.
 * If the user is not authenticated, they are redirected to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to the login page with the current location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
