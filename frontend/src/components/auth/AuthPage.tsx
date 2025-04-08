import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SocialLoginButtons from './SocialLoginButtons';
import MagicLinkForm from './MagicLinkForm';
import { Box, Container, Typography, Paper, Divider, useTheme } from '@mui/material';

interface AuthToken {
  access_token: string;
  user: {
    id: string;
    name?: string;
    email: string;
    [key: string]: any;
  };
}

interface LocationState {
  from?: {
    pathname: string;
  };
}

const AuthPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Get the redirect URL from query params or default to home
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';
  
  // Handle successful authentication
  const handleAuthSuccess = (token: AuthToken): void => {
    // Store the token in localStorage
    localStorage.setItem('auth_token', token.access_token);
    localStorage.setItem('user_data', JSON.stringify(token.user));
    
    // Redirect to the page the user was trying to access
    navigate(from, { replace: true });
  };
  
  // Handle authentication error
  const handleAuthError = (errorMessage: string): void => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Sign in to Fixly
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Connect with local home service providers for all your needs
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box sx={{ width: '100%', mb: 3 }}>
          <SocialLoginButtons 
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        </Box>
        
        <Divider sx={{ width: '100%', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
        
        <Box sx={{ width: '100%' }}>
          <MagicLinkForm 
            onSuccess={() => {
              setError('');
              setIsLoading(false);
            }}
            onError={handleAuthError}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthPage;
