import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { authService } from '../../services/authService';

interface MagicLinkFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ onSuccess, onError, setIsLoading, isLoading }) => {
  const [email, setEmail] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the redirect URI (current URL)
      const redirectUrl = window.location.origin + '/auth/verify';
      
      // Send magic link request
      await authService.sendMagicLink(email, redirectUrl);
      
      // Show success message
      setEmailSent(true);
      onSuccess();
    } catch (error) {
      console.error('Error sending magic link:', error);
      onError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom align="center">
        Sign in with email (no password)
      </Typography>
      
      {emailSent ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Magic link sent! Check your email for a sign-in link.
        </Alert>
      ) : (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<EmailIcon />}
            disabled={isLoading}
            sx={{ mt: 2, mb: 2, py: 1.2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Send Magic Link'
            )}
          </Button>
        </>
      )}
      
      {emailSent && (
        <Typography variant="body2" color="text.secondary" align="center">
          Didn't receive the email? Check your spam folder or{' '}
          <Button 
            variant="text" 
            onClick={() => setEmailSent(false)}
            sx={{ p: 0, minWidth: 'auto', verticalAlign: 'baseline', textTransform: 'none' }}
          >
            try again
          </Button>
        </Typography>
      )}
    </Box>
  );
};

export default MagicLinkForm;
