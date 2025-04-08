import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Card, CardContent, CardMedia, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import HvacIcon from '@mui/icons-material/Hvac';
import HandymanIcon from '@mui/icons-material/Handyman';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LandscapeIcon from '@mui/icons-material/Landscape';

const HomePage = () => {
  const theme = useTheme();

  // Service categories with icons
  const serviceCategories = [
    { name: 'Plumbing', icon: <PlumbingIcon fontSize="large" color="primary" /> },
    { name: 'Electrical', icon: <ElectricalServicesIcon fontSize="large" color="primary" /> },
    { name: 'HVAC', icon: <HvacIcon fontSize="large" color="primary" /> },
    { name: 'Handyman', icon: <HandymanIcon fontSize="large" color="primary" /> },
    { name: 'Cleaning', icon: <CleaningServicesIcon fontSize="large" color="primary" /> },
    { name: 'Landscaping', icon: <LandscapeIcon fontSize="large" color="primary" /> },
  ];

  // How it works steps
  const steps = [
    {
      title: 'Describe Your Issue',
      description: 'Tell us about your home-related issue with text and optional images.',
    },
    {
      title: 'Get Matched with Providers',
      description: 'We automatically find and contact local service providers for you.',
    },
    {
      title: 'Compare Quotes',
      description: 'Review quotes and provider details to make the best choice.',
    },
    {
      title: 'Book Your Service',
      description: 'Schedule your service with your chosen provider.',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("/images/home-repair.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Home Services Made Simple
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Fixly connects you with trusted local service providers for all your home repair and maintenance needs.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  component={RouterLink} 
                  to="/requests/new"
                  sx={{ mr: 2, px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Create a Request
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large" 
                  component={RouterLink} 
                  to="/providers"
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Browse Providers
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <HomeRepairServiceIcon sx={{ fontSize: 250, color: theme.palette.primary.main, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Service Categories */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" color="text.primary" gutterBottom>
            Our Services
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Whatever your home needs, we've got you covered
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {serviceCategories.map((category) => (
              <Grid item key={category.name} xs={6} sm={4} md={2}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  {category.icon}
                  <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                    {category.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" color="text.primary" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Finding the right service provider has never been easier
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.primary.main, 
                      color: 'white', 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>
                      {index + 1}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {step.title}
                    </Typography>
                    <Typography>
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={RouterLink} 
              to="/requests/new"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" color="text.primary" gutterBottom>
            What Our Customers Say
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[1, 2, 3].map((item) => (
              <Grid item key={item} xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                      "Fixly made finding a reliable plumber so easy. I described my issue, and within hours I had quotes from three local professionals. Highly recommend!"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                        {['J', 'S', 'M'][item - 1]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          {['John D.', 'Sarah M.', 'Michael T.'][item - 1]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {['Homeowner', 'Apartment Resident', 'Property Manager'][item - 1]}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography variant="h3" gutterBottom>
                Ready to solve your home service needs?
              </Typography>
              <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
                Join thousands of satisfied homeowners who trust Fixly
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                component={RouterLink} 
                to="/requests/new"
                sx={{ 
                  mt: 2, 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'white', 
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                Create Your First Request
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
