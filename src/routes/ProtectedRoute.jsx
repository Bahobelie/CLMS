import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user'); // Check if user is logged in (you can use Redux state as well)

  // Get user from Redux state if userRole is null
  let user = useSelector((state) => state.auth.user);

  if (!isAuthenticated && !user) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" />;
  }

  return children; // If authenticated, render the children (protected routes)
};

export default ProtectedRoute;
