import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';
import { authService } from '../../services/authService';

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name?: string;
    email: string;
    [key: string]: any;
  };
}

const MagicLinkVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const verifyMagicLink = async (): Promise<void> => {
      try {
        // Parse the URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        
        if (!token) {
          setError('Invalid or missing authentication token');
          return;
        }
        
        // Verify the magic link token
        const response: AuthResponse = await authService.verifyMagicLink(token);
        
        // Store the token and user data
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        // Redirect to the home page or the page the user was trying to access
        const redirect = queryParams.get('redirect') || '/';
        navigate(redirect, { replace: true });
      } catch (error) {
        console.error('Error verifying magic link:', error);
        setError('Invalid or expired link. Please request a new magic link.');
      }
    };
    
    verifyMagicLink();
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
              Verifying Your Sign In
            </Typography>
            <Typography color="text.secondary">
              Please wait while we verify your authentication...
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default MagicLinkVerify;
