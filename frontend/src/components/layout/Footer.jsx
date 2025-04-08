import React from 'react';
import { Box, Container, Typography, Link, Grid, useTheme } from '@mui/material';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

const Footer = () => {
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
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Email: support@fixly.com
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Phone: (555) 123-4567
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Address: 123 Fix Street, Repair City, RC 12345
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Fixly. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
