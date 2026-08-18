import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'state/AuthContext';

// Keeps account-scoped pages out of reach of anonymous visitors. The server
// still has to authorize every request that returns account data.
export default function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
