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

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  description: string;
  price?: string;
  availability?: string;
  image?: string;
  verified: boolean;
}

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  location: string;
  address?: string;
  preferred_time?: string;
  images?: string[];
  user_id?: string;
}

interface RouteParams {
  requestId: string;
}

const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<RouteParams>();
  const [request, setRequest] = useState<Request | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // This would be replaced with actual API call to fetch request details
    const fetchRequestDetails = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockRequest: Request = {
          id: requestId || '1',
          title: 'Leaking Kitchen Sink',
          description: 'The pipe under my kitchen sink is leaking and causing water damage to the cabinet. I noticed the leak yesterday and have placed a bucket underneath to catch the water. The cabinet floor is already showing signs of water damage. I need someone to fix the pipe and possibly replace the damaged cabinet floor.',
          category: 'plumbing',
          status: 'open',
          created_at: '2025-04-01T10:30:00Z',
          location: 'San Francisco, CA',
          address: '123 Main St, San Francisco, CA 94110',
          preferred_time: 'Weekdays after 5pm or weekends',
          images: [
            'https://example.com/leak1.jpg',
            'https://example.com/leak2.jpg'
          ]
        };
        
        // Mock providers data
        const mockProviders: Provider[] = [
          {
            id: '101',
            name: 'Quick Fix Plumbing',
            rating: 4.8,
            reviews: 124,
            description: 'Professional plumbing services with 15+ years of experience.',
            price: '$75-100/hr',
            availability: 'Available tomorrow',
            image: 'https://example.com/provider1.jpg',
            verified: true
          },
          {
            id: '102',
            name: 'Bay Area Plumbers',
            rating: 4.6,
            reviews: 98,
            description: 'Licensed and insured plumbers serving the entire Bay Area.',
            price: '$85-110/hr',
            availability: 'Available in 2 days',
            image: 'https://example.com/provider2.jpg',
            verified: true
          },
          {
            id: '103',
            name: 'HomeFixers',
            rating: 4.5,
            reviews: 76,
            description: 'General contractors specializing in home repairs and renovations.',
            price: '$90-120/hr',
            availability: 'Available next week',
            image: 'https://example.com/provider3.jpg',
            verified: false
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
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: string): JSX.Element => {
    switch (category) {
      case 'plumbing':
        return <PlumbingIcon fontSize="large" color="primary" />;
      case 'electrical':
        return <ElectricalServicesIcon fontSize="large" color="primary" />;
      case 'hvac':
        return <HvacIcon fontSize="large" color="primary" />;
      case 'handyman':
        return <HandymanIcon fontSize="large" color="primary" />;
      case 'cleaning':
        return <CleaningServicesIcon fontSize="large" color="primary" />;
      case 'landscaping':
        return <LandscapeIcon fontSize="large" color="primary" />;
      default:
        return <HandymanIcon fontSize="large" color="primary" />;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string): 'primary' | 'warning' | 'success' | 'default' => {
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
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
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

  if (error || !request) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          component={RouterLink}
          to="/requests"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Requests
        </Button>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography color="error" variant="h6">
            {error || 'Request not found'}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        component={RouterLink}
        to="/requests"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Requests
      </Button>
      
      {/* Request Header */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {request.title}
              </Typography>
              <Chip 
                label={getStatusLabel(request.status)} 
                color={getStatusColor(request.status)} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Created on {formatDate(request.created_at)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {request.location}
                </Typography>
              </Box>
              
              {request.preferred_time && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {request.preferred_time}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              {request.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 2 }}>
                {getCategoryIcon(request.category)}
              </Box>
              <Typography variant="h6" align="center">
                {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Request Images */}
        {request.images && request.images.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attached Images
            </Typography>
            <Grid container spacing={2}>
              {request.images.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box
                    component="img"
                    src={image}
                    alt={`Request image ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/static/images/placeholder.jpg';
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Providers Section */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Recommended Service Providers
        </Typography>
        
        {providers.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="body1" paragraph>
              We're currently finding the best service providers for your request.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back soon for provider recommendations.
            </Typography>
          </Box>
        ) : (
          <List sx={{ mt: 2 }}>
            {providers.map((provider, index) => (
              <React.Fragment key={provider.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={provider.image} 
                      alt={provider.name}
                      sx={{ width: 60, height: 60, mr: 1 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="div">
                          {provider.name}
                        </Typography>
                        <Box>
                          {provider.verified && (
                            <Chip 
                              label="Verified" 
                              color="primary" 
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          )}
                          <Chip 
                            label={provider.availability} 
                            color="success" 
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={provider.rating} precision={0.1} size="small" readOnly />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({provider.reviews} reviews)
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          {provider.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" color="primary">
                            {provider.price}
                          </Typography>
                          
                          <Box>
                            <Button 
                              variant="outlined" 
                              size="small"
                              component={RouterLink}
                              to={`/providers/${provider.id}`}
                              sx={{ mr: 1 }}
                            >
                              View Profile
                            </Button>
                            <Button 
                              variant="contained" 
                              size="small"
                              color="primary"
                            >
                              Contact
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    }
                    sx={{ ml: 2 }}
                  />
                </ListItem>
                {index < providers.length - 1 && <Divider component="li" sx={{ my: 2 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            component={RouterLink}
            to="/providers"
            sx={{ px: 4 }}
          >
            Browse All Providers
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RequestDetailPage;
