import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider,
  CircularProgress,
  Pagination,
  SelectChangeEvent
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  image?: string;
  verified: boolean;
}

interface ServiceCategory {
  value: string;
  label: string;
}

const ProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Available service categories
  const serviceCategories: ServiceCategory[] = [
    { value: '', label: 'All Categories' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'painting', label: 'Painting' },
    { value: 'roofing', label: 'Roofing' }
  ];

  useEffect(() => {
    // This would be replaced with actual API call to fetch providers
    const fetchProviders = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockProviders: Provider[] = [
          {
            id: '101',
            name: 'Quick Fix Plumbing',
            category: 'plumbing',
            rating: 4.8,
            reviews: 124,
            description: 'Professional plumbing services with 15+ years of experience. Specializing in leak repairs, pipe installations, and bathroom renovations.',
            location: 'San Francisco, CA',
            phone: '(415) 555-1234',
            email: 'info@quickfixplumbing.com',
            website: 'https://www.quickfixplumbing.com',
            image: 'https://example.com/provider1.jpg',
            verified: true
          },
          {
            id: '102',
            name: 'Bay Area Electricians',
            category: 'electrical',
            rating: 4.7,
            reviews: 98,
            description: 'Licensed electricians providing residential and commercial services. We handle everything from small repairs to full home rewiring.',
            location: 'Oakland, CA',
            phone: '(510) 555-5678',
            email: 'service@bayareaelectricians.com',
            website: 'https://www.bayareaelectricians.com',
            image: 'https://example.com/provider2.jpg',
            verified: true
          },
          {
            id: '103',
            name: 'Cool Comfort HVAC',
            category: 'hvac',
            rating: 4.9,
            reviews: 156,
            description: 'Heating and cooling specialists serving the Bay Area. We offer installation, repair, and maintenance for all HVAC systems.',
            location: 'San Jose, CA',
            phone: '(408) 555-9012',
            email: 'info@coolcomfort.com',
            website: 'https://www.coolcomfort.com',
            image: 'https://example.com/provider3.jpg',
            verified: true
          },
          {
            id: '104',
            name: 'Handy Heroes',
            category: 'handyman',
            rating: 4.6,
            reviews: 87,
            description: 'General handyman services for all your home repair needs. No job is too small!',
            location: 'San Francisco, CA',
            phone: '(415) 555-3456',
            email: 'help@handyheroes.com',
            website: 'https://www.handyheroes.com',
            image: 'https://example.com/provider4.jpg',
            verified: false
          },
          {
            id: '105',
            name: 'Spotless Cleaning Services',
            category: 'cleaning',
            rating: 4.7,
            reviews: 112,
            description: 'Professional home and office cleaning services. We use eco-friendly products and offer flexible scheduling.',
            location: 'Berkeley, CA',
            phone: '(510) 555-7890',
            email: 'clean@spotlessservices.com',
            website: 'https://www.spotlessservices.com',
            image: 'https://example.com/provider5.jpg',
            verified: true
          },
          {
            id: '106',
            name: 'Green Thumb Landscaping',
            category: 'landscaping',
            rating: 4.8,
            reviews: 93,
            description: 'Full-service landscaping company offering design, installation, and maintenance services for residential and commercial properties.',
            location: 'Marin, CA',
            phone: '(415) 555-2345',
            email: 'info@greenthumb.com',
            website: 'https://www.greenthumb.com',
            image: 'https://example.com/provider6.jpg',
            verified: true
          }
        ];
        
        // Filter providers based on search term and category
        let filteredProviders = mockProviders;
        
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredProviders = filteredProviders.filter(provider => 
            provider.name.toLowerCase().includes(search) || 
            provider.description.toLowerCase().includes(search) ||
            provider.location.toLowerCase().includes(search)
          );
        }
        
        if (category) {
          filteredProviders = filteredProviders.filter(provider => 
            provider.category === category
          );
        }
        
        // Pagination
        setTotalPages(Math.ceil(filteredProviders.length / 4));
        const startIndex = (page - 1) * 4;
        const paginatedProviders = filteredProviders.slice(startIndex, startIndex + 4);
        
        setProviders(paginatedProviders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load service providers. Please try again later.');
        setLoading(false);
      }
    };

    fetchProviders();
  }, [searchTerm, category, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleCategoryChange = (e: SelectChangeEvent): void => {
    setCategory(e.target.value);
    setPage(1); // Reset to first page when category changes
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number): void => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Service Providers
      </Typography>
      
      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, service, or location"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                {serviceCategories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Providers List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 4 }}>
          {error}
        </Typography>
      ) : providers.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 8, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            No service providers found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria or category filter
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {providers.map((provider) => (
              <Grid item xs={12} key={provider.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={3}>
                        <Box
                          component="img"
                          src={provider.image || '/static/images/placeholder.jpg'}
                          alt={provider.name}
                          sx={{
                            width: '100%',
                            height: 160,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 1
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = '/static/images/placeholder.jpg';
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h5" component="div">
                                {provider.name}
                              </Typography>
                              {provider.verified && (
                                <VerifiedIcon color="primary" sx={{ ml: 1 }} fontSize="small" />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Rating value={provider.rating} precision={0.1} size="small" readOnly />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({provider.reviews} reviews)
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={provider.category.charAt(0).toUpperCase() + provider.category.slice(1)} 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            {provider.location}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body1" paragraph>
                          {provider.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/providers/${provider.id}`}
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="small" 
                      color="primary"
                    >
                      Contact
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProvidersPage;
