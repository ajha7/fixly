import React from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import HomeIcon from '@mui/icons-material/Home'; // Using HomeIcon for Nextdoor
import { useTheme } from '@mui/material/styles';
import { authService } from '../../services/authService';

interface SocialLoginButtonsProps {
  onSuccess: (token: any) => void;
  onError: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

type SocialProvider = 'google' | 'facebook' | 'nextdoor';

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onSuccess, onError, setIsLoading, isLoading }) => {
  const theme = useTheme();

  // Handle social login click
  const handleSocialLogin = async (provider: SocialProvider): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Get the redirect URI (current URL)
      const redirectUri = window.location.origin + '/auth/callback';
      
      // Generate a random state for security
      const state = Math.random().toString(36).substring(2, 15);
      
      // Get the authorization URL
      const response = await authService.getSocialAuthUrl(provider, redirectUri, state);
      
      // Redirect to the authorization URL
      window.location.href = response.auth_url;
    } catch (error) {
      console.error(`Error initiating ${provider} login:`, error);
      onError(`Failed to connect with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom align="center">
        Sign in with your social account
      </Typography>
      
      <Button
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={() => handleSocialLogin('google')}
        disabled={isLoading}
        fullWidth
        sx={{
          py: 1.2,
          borderColor: '#4285F4',
          color: '#4285F4',
          '&:hover': {
            borderColor: '#4285F4',
            backgroundColor: 'rgba(66, 133, 244, 0.04)',
          }
        }}
      >
        Continue with Google
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<HomeIcon />}
        onClick={() => handleSocialLogin('nextdoor')}
        disabled={isLoading}
        fullWidth
        sx={{
          py: 1.2,
          borderColor: '#00B551',
          color: '#00B551',
          '&:hover': {
            borderColor: '#00B551',
            backgroundColor: 'rgba(0, 181, 81, 0.04)',
          }
        }}
      >
        Continue with Nextdoor
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<FacebookIcon />}
        onClick={() => handleSocialLogin('facebook')}
        disabled={isLoading}
        fullWidth
        sx={{
          py: 1.2,
          borderColor: '#3b5998',
          color: '#3b5998',
          '&:hover': {
            borderColor: '#3b5998',
            backgroundColor: 'rgba(59, 89, 152, 0.04)',
          }
        }}
      >
        Continue with Facebook
      </Button>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default SocialLoginButtons;
