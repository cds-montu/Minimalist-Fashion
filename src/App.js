import React from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import appRoutes from './routes';
import { AuthProvider } from './state/AuthContext';

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const element = useRoutes(appRoutes);

  // Keyed on the path so navigating away from a crashed route recovers.
  const content = (
    <ErrorBoundary key={location.pathname}>
      <React.Suspense fallback={<Box sx={{ py: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
        {element}
      </React.Suspense>
    </ErrorBoundary>
  );

  return isAdminPath ? content : (
    <Layout>
      <Box component="main" sx={{ py: 2 }}>
        <Container maxWidth="lg">
          {content}
        </Container>
      </Box>
    </Layout>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
