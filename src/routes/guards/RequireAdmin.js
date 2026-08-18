import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminSessionValid } from 'services/adminSession';

// Client-side admin gate. This only hides the admin UI; it is NOT an
// authorization boundary. Every admin API call must be authorized server-side.
export default function RequireAdmin({ children }) {
  const location = useLocation();

  if (!isAdminSessionValid()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
}
