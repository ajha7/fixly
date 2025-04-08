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

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
}

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number | Review[];
  description: string;
  longDescription?: string;
  location: string;
  address?: string;
  phone: string;
  email: string;
  website: string;
  image?: string;
  verified: boolean;
  yearsInBusiness?: number;
  employees?: string;
  licenses?: string[];
  insurance?: string[];
  services?: string[];
  serviceAreas?: string[];
}

interface RouteParams {
  providerId: string;
}

const ProviderDetailPage: React.FC = () => {
  const { providerId } = useParams<RouteParams>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    // This would be replaced with actual API call to fetch provider details
    const fetchProviderDetails = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockProvider: Provider = {
          id: providerId || '101',
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
              date: '2025-03-10',
              content: 'Good work on my bathroom renovation. They were a bit late on the first day but otherwise everything went smoothly.'
            },
            {
              id: '3',
              author: 'Robert J.',
              rating: 5,
              date: '2025-03-05',
              content: 'Responded quickly to my emergency call when a pipe burst. Saved me from major water damage. Highly recommend!'
            },
            {
              id: '4',
              author: 'Emily L.',
              rating: 5,
              date: '2025-02-28',
              content: 'Very professional and knowledgeable. Fixed an issue that two other plumbers couldn\'t figure out.'
            },
            {
              id: '5',
              author: 'Michael T.',
              rating: 4,
              date: '2025-02-20',
              content: 'Fair pricing and quality work. Would use them again for future plumbing needs.'
            }
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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
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

  if (error || !provider) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          component={RouterLink}
          to="/providers"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Providers
        </Button>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography color="error" variant="h6">
            {error || 'Provider not found'}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        component={RouterLink}
        to="/providers"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
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
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = '/static/images/placeholder.jpg';
              }}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
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
              <Chip 
                label={provider.category.charAt(0).toUpperCase() + provider.category.slice(1)} 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={provider.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {provider.rating} ({typeof provider.reviews === 'number' ? provider.reviews : provider.reviews.length} reviews)
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              {provider.description}
            </Typography>
            
            <Grid container spacing={2}>
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
                    {provider.phone}
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
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="About" />
          <Tab label="Services" />
          <Tab label="Reviews" />
          <Tab label="Contact" />
        </Tabs>
        
        {/* About Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              About {provider.name}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {provider.longDescription}
            </Typography>
            
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Business Information
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Years in Business" 
                          secondary={provider.yearsInBusiness} 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Number of Employees" 
                          secondary={provider.employees} 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Service Areas" 
                          secondary={
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {provider.serviceAreas?.map((area) => (
                                <Chip 
                                  key={area} 
                                  label={area} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              ))}
                            </Box>
                          } 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Licenses & Insurance
                    </Typography>
                    <List>
                      {provider.licenses?.map((license, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={license} />
                          </ListItem>
                          {index < (provider.licenses?.length || 0) - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Insurance Coverage
                    </Typography>
                    <List>
                      {provider.insurance?.map((insurance, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={insurance} />
                          </ListItem>
                          {index < (provider.insurance?.length || 0) - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Services Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Services Offered
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {provider.services?.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      height: '100%'
                    }}
                  >
                    <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {service}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                component={RouterLink}
                to="/requests/new"
                sx={{ px: 4 }}
              >
                Request a Service
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Reviews Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
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
                  ({typeof provider.reviews === 'number' ? provider.reviews : provider.reviews.length} reviews)
                </Typography>
              </Box>
            </Box>
            
            {Array.isArray(provider.reviews) && provider.reviews.map((review) => (
              <Paper 
                key={review.id} 
                variant="outlined" 
                sx={{ p: 2, mb: 2 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {review.author.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {review.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(review.date)}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={review.rating} readOnly size="small" />
                </Box>
                <Typography variant="body1">
                  {review.content}
                </Typography>
              </Paper>
            ))}
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="outlined">
                Write a Review
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Contact Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {provider.address}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <iframe
                        width="100%"
                        height="300"
                        frameBorder="0"
                        title="Map"
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(provider.address || provider.location)}`}
                        allowFullScreen
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Contact Details
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Phone" 
                          secondary={provider.phone} 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={provider.email} 
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemIcon>
                          <LanguageIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Website" 
                          secondary={
                            <a href={provider.website} target="_blank" rel="noopener noreferrer">
                              {provider.website}
                            </a>
                          } 
                        />
                      </ListItem>
                    </List>
                    
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        fullWidth
                        component={RouterLink}
                        to="/requests/new"
                      >
                        Request a Service
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProviderDetailPage;
