import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Divider, 
  CircularProgress,
  Paper,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tab,
  Tabs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

const ProviderDetailPage = () => {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // This would be replaced with actual API call to fetch provider details
    const fetchProviderDetails = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockProvider = {
          id: providerId,
          name: 'Quick Fix Plumbing',
          category: 'plumbing',
          rating: 4.8,
          reviews: 124,
          description: 'Professional plumbing services with 15+ years of experience. Specializing in leak repairs, pipe installations, and bathroom renovations.',
          longDescription: 'Quick Fix Plumbing has been serving the Bay Area since 2008. Our team of licensed and insured plumbers provides fast, reliable service for all your plumbing needs. We pride ourselves on our attention to detail, fair pricing, and exceptional customer service. Whether you need a simple repair or a complete bathroom renovation, we have the expertise to get the job done right the first time.',
          location: 'San Francisco, CA',
          address: '123 Plumber St, San Francisco, CA 94110',
          phone: '(415) 555-1234',
          email: 'info@quickfixplumbing.com',
          website: 'https://www.quickfixplumbing.com',
          image: 'https://example.com/provider1.jpg',
          verified: true,
          yearsInBusiness: 15,
          employees: '5-10',
          licenses: ['California Plumbing License #12345', 'San Francisco Business License #67890'],
          insurance: ['General Liability', 'Workers Compensation'],
          services: [
            'Leak Detection & Repair',
            'Pipe Installation & Replacement',
            'Drain Cleaning',
            'Water Heater Installation & Repair',
            'Bathroom Remodeling',
            'Kitchen Plumbing',
            'Sewer Line Repair',
            'Emergency Plumbing Services'
          ],
          serviceAreas: [
            'San Francisco',
            'Oakland',
            'Berkeley',
            'Daly City',
            'South San Francisco',
            'San Bruno'
          ],
          reviews: [
            {
              id: '1',
              author: 'John D.',
              rating: 5,
              date: '2025-03-15',
              content: 'Excellent service! They fixed my leaking sink quickly and professionally. Would definitely use them again.'
            },
            {
              id: '2',
              author: 'Sarah M.',
              rating: 4,
              date: '2025-02-28',
              content: 'Good work on my water heater installation. They were a bit late but called ahead to let me know. Fair pricing and clean work.'
            },
            {
              id: '3',
              author: 'Michael T.',
              rating: 5,
              date: '2025-02-10',
              content: 'Had an emergency pipe burst and they came out within an hour. Saved me from major water damage. Highly recommend!'
            },
            {
              id: '4',
              author: 'Jennifer L.',
              rating: 5,
              date: '2025-01-22',
              content: 'Very professional and knowledgeable. They replaced all the pipes in my old bathroom and everything works perfectly now.'
            },
            {
              id: '5',
              author: 'Robert K.',
              rating: 4,
              date: '2025-01-05',
              content: 'Good service at a reasonable price. They were thorough in explaining what needed to be done and why.'
            }
          ],
          gallery: [
            'https://example.com/gallery1.jpg',
            'https://example.com/gallery2.jpg',
            'https://example.com/gallery3.jpg',
            'https://example.com/gallery4.jpg'
          ]
        };
        
        setProvider(mockProvider);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching provider details:', err);
        setError('Failed to load provider details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [providerId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    return phone; // In a real app, you might format this differently
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error" sx={{ my: 4 }}>
          {error}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/providers"
        >
          Back to Providers
        </Button>
      </Container>
    );
  }

  if (!provider) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ my: 4 }}>
          Provider not found
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/providers"
        >
          Back to Providers
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        component={RouterLink} 
        to="/providers"
        sx={{ mb: 3 }}
      >
        Back to Providers
      </Button>
      
      {/* Provider Header */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Box
              component="img"
              src={provider.image || '/static/images/placeholder.jpg'}
              alt={provider.name}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 1
              }}
              onError={(e) => {
                e.target.src = '/static/images/placeholder.jpg';
              }}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4" component="h1">
                    {provider.name}
                  </Typography>
                  {provider.verified && (
                    <Chip 
                      icon={<VerifiedIcon />} 
                      label="Verified" 
                      color="primary" 
                      size="small" 
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={provider.rating} precision={0.1} readOnly />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {provider.rating} ({provider.reviews?.length || 0} reviews)
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={provider.category.charAt(0).toUpperCase() + provider.category.slice(1)} 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" paragraph>
                {provider.longDescription || provider.description}
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {provider.location}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formatPhone(provider.phone)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {provider.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LanguageIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    <a href={provider.website} target="_blank" rel="noopener noreferrer">
                      Website
                    </a>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ mr: 2 }}
              >
                Contact
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
              >
                Request Quote
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Services" />
          <Tab label="Reviews" />
          <Tab label="About" />
          <Tab label="Gallery" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      <Box sx={{ mb: 4 }}>
        {/* Services Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Services Offered
                </Typography>
                <List>
                  {provider.services.map((service, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={service} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Service Areas
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {provider.serviceAreas.map((area, index) => (
                    <Chip 
                      key={index} 
                      label={area} 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Reviews Tab */}
        {tabValue === 1 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Customer Reviews
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon color="primary" />
                <Typography variant="h6" sx={{ mx: 1 }}>
                  {provider.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({provider.reviews?.length || 0} reviews)
                </Typography>
              </Box>
            </Box>
            
            {provider.reviews?.length > 0 ? (
              <List>
                {provider.reviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>{review.author.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {review.author}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(review.date)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Rating value={review.rating} size="small" readOnly sx={{ my: 0.5 }} />
                            <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                              {review.content}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No reviews yet.
              </Typography>
            )}
          </Paper>
        )}
        
        {/* About Tab */}
        {tabValue === 2 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              About {provider.name}
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Business Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Years in Business" 
                      secondary={provider.yearsInBusiness} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Employees" 
                      secondary={provider.employees} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Address" 
                      secondary={provider.address} 
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Licenses & Insurance
                </Typography>
                <List dense>
                  {provider.licenses.map((license, index) => (
                    <ListItem key={`license-${index}`}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={license} />
                    </ListItem>
                  ))}
                  {provider.insurance.map((insurance, index) => (
                    <ListItem key={`insurance-${index}`}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={insurance} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {/* Gallery Tab */}
        {tabValue === 3 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Project Gallery
            </Typography>
            
            {provider.gallery?.length > 0 ? (
              <Grid container spacing={2}>
                {provider.gallery.map((image, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box
                      component="img"
                      src={image}
                      alt={`Project ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        }
                      }}
                      onError={(e) => {
                        e.target.src = '/static/images/placeholder.jpg';
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No gallery images available.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ProviderDetailPage;
