import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
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
        <SentimentVeryDissatisfiedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        
        <Typography component="h1" variant="h3" gutterBottom align="center">
          Page Not Found
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Oops! The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/"
            sx={{ px: 3 }}
          >
            Go to Homepage
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => window.history.back()}
            sx={{ px: 3 }}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;
