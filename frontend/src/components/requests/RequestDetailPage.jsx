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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import HvacIcon from '@mui/icons-material/Hvac';
import HandymanIcon from '@mui/icons-material/Handyman';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LandscapeIcon from '@mui/icons-material/Landscape';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const RequestDetailPage = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This would be replaced with actual API call to fetch request details
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockRequest = {
          id: requestId,
          title: 'Leaking Kitchen Sink',
          description: 'The pipe under my kitchen sink is leaking and causing water damage to the cabinet. I noticed the leak yesterday and have placed a bucket underneath to catch the water. The cabinet floor is already showing signs of water damage. I need someone to fix the pipe and possibly replace the damaged cabinet floor.',
          category: 'plumbing',
          status: 'open',
          created_at: '2025-04-01T10:30:00Z',
          updated_at: '2025-04-01T14:45:00Z',
          location: 'San Francisco, CA',
          address: '123 Main St, San Francisco, CA 94105',
          availability: [
            { day: 'Monday', timeSlots: ['Morning', 'Evening'] },
            { day: 'Tuesday', timeSlots: ['Afternoon'] },
            { day: 'Saturday', timeSlots: ['Morning', 'Afternoon', 'Evening'] }
          ],
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg'
          ]
        };
        
        const mockProviders = [
          {
            id: '101',
            name: 'Quick Fix Plumbing',
            rating: 4.8,
            reviews: 124,
            description: 'Professional plumbing services with 15+ years of experience. Specializing in leak repairs, pipe installations, and bathroom renovations.',
            phone: '(415) 555-1234',
            email: 'info@quickfixplumbing.com',
            website: 'https://www.quickfixplumbing.com',
            image: 'https://example.com/provider1.jpg',
            quote: {
              price: '$150',
              estimatedTime: '1-2 hours',
              availability: 'Tomorrow, 9am-12pm'
            }
          },
          {
            id: '102',
            name: 'Bay Area Plumbers',
            rating: 4.6,
            reviews: 89,
            description: 'Family-owned plumbing business serving the Bay Area for over 20 years. Fair pricing and quality workmanship guaranteed.',
            phone: '(415) 555-5678',
            email: 'service@bayareaplumbers.com',
            website: 'https://www.bayareaplumbers.com',
            image: 'https://example.com/provider2.jpg',
            quote: {
              price: '$175',
              estimatedTime: '2 hours',
              availability: 'Thursday, 1pm-5pm'
            }
          },
          {
            id: '103',
            name: 'Master Plumbing Solutions',
            rating: 4.9,
            reviews: 156,
            description: 'Licensed and insured plumbers providing 24/7 emergency services. We handle everything from small leaks to major plumbing renovations.',
            phone: '(415) 555-9012',
            email: 'help@masterplumbing.com',
            website: 'https://www.masterplumbing.com',
            image: 'https://example.com/provider3.jpg',
            quote: {
              price: '$125',
              estimatedTime: '1 hour',
              availability: 'Today, 4pm-6pm'
            }
          }
        ];
        
        setRequest(mockRequest);
        setProviders(mockProviders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details. Please try again later.');
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'plumbing':
        return <PlumbingIcon />;
      case 'electrical':
        return <ElectricalServicesIcon />;
      case 'hvac':
        return <HvacIcon />;
      case 'handyman':
        return <HandymanIcon />;
      case 'cleaning':
        return <CleaningServicesIcon />;
      case 'landscaping':
        return <LandscapeIcon />;
      default:
        return <HandymanIcon />;
    }
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
          to="/requests"
        >
          Back to Requests
        </Button>
      </Container>
    );
  }

  if (!request) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ my: 4 }}>
          Request not found
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/requests"
        >
          Back to Requests
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        component={RouterLink} 
        to="/requests"
        sx={{ mb: 3 }}
      >
        Back to Requests
      </Button>
      
      <Grid container spacing={4}>
        {/* Request Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {request.title}
              </Typography>
              <Chip 
                label={getStatusLabel(request.status)} 
                color={getStatusColor(request.status)}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip 
                icon={getCategoryIcon(request.category)} 
                label={request.category.charAt(0).toUpperCase() + request.category.slice(1)} 
                variant="outlined"
              />
              <Chip 
                icon={<LocationOnIcon />} 
                label={request.location} 
                variant="outlined"
              />
              <Chip 
                icon={<CalendarTodayIcon />} 
                label={`Created on ${formatDate(request.created_at)}`} 
                variant="outlined"
              />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {request.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Typography variant="body1" paragraph>
              {request.address}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Availability
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {request.availability.map((slot, index) => (
                <Chip 
                  key={index}
                  icon={<AccessTimeIcon />}
                  label={`${slot.day}: ${slot.timeSlots.join(', ')}`}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
            
            {request.images && request.images.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Images
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {request.images.map((image, index) => (
                    <Box 
                      key={index}
                      component="img"
                      src={image}
                      alt={`Request image ${index + 1}`}
                      sx={{ 
                        width: 150, 
                        height: 150, 
                        objectFit: 'cover', 
                        borderRadius: 1,
                        border: '1px solid #eee'
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Providers */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Service Providers
            </Typography>
            
            {providers.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No providers have responded yet. Check back soon!
              </Typography>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                {providers.map((provider) => (
                  <React.Fragment key={provider.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar alt={provider.name} src={provider.image} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="div">
                            {provider.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Rating value={provider.rating} precision={0.1} size="small" readOnly />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({provider.reviews} reviews)
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                              Quote: {provider.quote.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Est. Time: {provider.quote.estimatedTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Available: {provider.quote.availability}
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              component={RouterLink}
                              to={`/providers/${provider.id}`}
                              sx={{ mt: 1 }}
                            >
                              View Profile
                            </Button>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 3 }}
            >
              Contact Providers
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RequestDetailPage;
