import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Auth components
import AuthPage from './components/auth/AuthPage';
import SocialAuthCallback from './components/auth/SocialAuthCallback';
import MagicLinkVerify from './components/auth/MagicLinkVerify';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Main app components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/home/HomePage';
import RequestsPage from './components/requests/RequestsPage';
import RequestDetailPage from './components/requests/RequestDetailPage';
import NewRequestPage from './components/requests/NewRequestPage';
import ProvidersPage from './components/providers/ProvidersPage';
import ProviderDetailPage from './components/providers/ProviderDetailPage';
import ProfilePage from './components/profile/ProfilePage';
import NotFoundPage from './components/common/NotFoundPage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green
    },
    secondary: {
      main: '#1976D2', // Blue
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="app">
              <Routes>
                {/* Auth routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/callback" element={<SocialAuthCallback />} />
                <Route path="/auth/verify" element={<MagicLinkVerify />} />
                
                {/* Protected routes with header and footer */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <div className="app-container">
                      <Header />
                      <main className="main-content">
                        <HomePage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/requests" element={
                  <ProtectedRoute>
                    <div className="app-container">
                      <Header />
                      <main className="main-content">
                        <RequestsPage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/requests/new" element={
                  <ProtectedRoute>
                    <div className="app-container">
                      <Header />
                      <main className="main-content">
                        <NewRequestPage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/requests/:requestId" element={
                  <ProtectedRoute>
                    <div className="app-container">
                      <Header />
                      <main className="main-content">
                        <RequestDetailPage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/providers" element={
                  <ProtectedRoute>
                    <div className="app-container">
                      <Header />
                      <main className="main-content">
                        <ProvidersPage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/providers/:providerId" element={
                  <ProtectedRoute>
                    <div className="app-container">
                      <Header />
                      <main className="main-content">
                        <ProviderDetailPage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <div className="app-container">
                      <Header />
                      <main className="main-content">
                        <ProfilePage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Redirect to home if authenticated and trying to access auth pages */}
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />
                
                {/* 404 page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
