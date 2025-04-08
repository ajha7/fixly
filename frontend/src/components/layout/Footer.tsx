import React from 'react';
import { Box, Container, Typography, Link, Grid, useTheme } from '@mui/material';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HomeRepairServiceIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" color="text.primary" fontWeight="bold">
                Fixly
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Connecting customers with local home service providers for all your needs.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link href="/requests" color="inherit" display="block" sx={{ mb: 1 }}>
              My Requests
            </Link>
            <Link href="/requests/new" color="inherit" display="block" sx={{ mb: 1 }}>
              New Request
            </Link>
            <Link href="/providers" color="inherit" display="block">
              Providers
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              123 Main Street<br />
              San Francisco, CA 94105<br />
              support@fixly.com<br />
              (415) 555-1234
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 5, borderTop: 1, borderColor: 'divider', pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Fixly. All rights reserved.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Link href="/privacy" color="inherit" sx={{ mx: 1 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" sx={{ mx: 1 }}>
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
