import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';
import { authService } from '../../services/authService';

const SocialAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const provider = queryParams.get('provider') || 'google'; // Default to Google if not specified
        const error = queryParams.get('error');
        
        // Check for errors in the callback
        if (error) {
          setError(`Authentication error: ${error}`);
          return;
        }
        
        if (!code) {
          setError('No authentication code received');
          return;
        }
        
        // Get the redirect URI (current URL without query params)
        const redirectUri = window.location.origin + '/auth/callback';
        
        // Complete the social login process
        const response = await authService.completeSocialLogin(provider, code, redirectUri);
        
        // Store the token and user data
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        // Redirect to the home page or the page the user was trying to access
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error processing social login callback:', error);
        setError('Failed to complete authentication. Please try again.');
      }
    };
    
    handleCallback();
  }, [location, navigate]);
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        {error ? (
          <>
            <Typography variant="h5" color="error" gutterBottom>
              Authentication Failed
            </Typography>
            <Typography color="text.secondary">{error}</Typography>
            <Box sx={{ mt: 3 }}>
              <Typography>
                <a href="/auth" style={{ textDecoration: 'none' }}>
                  Return to sign in
                </a>
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Completing Sign In
            </Typography>
            <Typography color="text.secondary">
              Please wait while we complete the authentication process...
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default SocialAuthCallback;
