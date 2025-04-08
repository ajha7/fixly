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

interface ServiceCategory {
  name: string;
  icon: React.ReactNode;
}

interface Step {
  title: string;
  description: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image?: string;
}

const HomePage: React.FC = () => {
  const theme = useTheme();

  // Service categories with icons
  const serviceCategories: ServiceCategory[] = [
    { name: 'Plumbing', icon: <PlumbingIcon fontSize="large" color="primary" /> },
    { name: 'Electrical', icon: <ElectricalServicesIcon fontSize="large" color="primary" /> },
    { name: 'HVAC', icon: <HvacIcon fontSize="large" color="primary" /> },
    { name: 'Handyman', icon: <HandymanIcon fontSize="large" color="primary" /> },
    { name: 'Cleaning', icon: <CleaningServicesIcon fontSize="large" color="primary" /> },
    { name: 'Landscaping', icon: <LandscapeIcon fontSize="large" color="primary" /> },
  ];

  // How it works steps
  const steps: Step[] = [
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
              <Box 
                component="img"
                src="/images/home-hero.svg"
                alt="Home repair illustration"
                sx={{ 
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Service Categories Section */}
      <Box id="services" sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Our Services
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Whatever your home needs, we've got you covered with our wide range of services.
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {serviceCategories.map((category, index) => (
              <Grid item key={index} xs={6} sm={4} md={2}>
                <Paper
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
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

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            How It Works
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Fixly makes finding and hiring service providers simple and hassle-free.
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {steps.map((step, index) => (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h2" component="div" align="center">
                      {index + 1}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
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
        </Container>
      </Box>

      {/* CTA Section */}
      <Box id="get-access" sx={{ py: 8, bgcolor: theme.palette.primary.main }}>
        <Container maxWidth="md">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="primary.contrastText"
            gutterBottom
          >
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" align="center" color="primary.contrastText" paragraph>
            Join Fixly today and experience the easiest way to get your home services done.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/auth"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Sign Up Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
