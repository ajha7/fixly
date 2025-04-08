import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, Chip, Divider, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { authService } from '../../services/authService';

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'completed';
  created_at: string;
  location: string;
}

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // This would be replaced with actual API call to fetch user requests
    const fetchRequests = async (): Promise<void> => {
      try {
        setLoading(true);
        // Placeholder for API call
        // const response = await fetch('/api/requests', {
        //   headers: {
        //     Authorization: `Bearer ${authService.getToken()}`
        //   }
        // });
        // const data = await response.json();
        
        // Mock data for now
        const mockRequests: Request[] = [
          {
            id: '1',
            title: 'Leaking Kitchen Sink',
            description: 'The pipe under my kitchen sink is leaking and causing water damage to the cabinet.',
            category: 'plumbing',
            status: 'open',
            created_at: '2025-04-01T10:30:00Z',
            location: 'San Francisco, CA'
          },
          {
            id: '2',
            title: 'Electrical Outlet Not Working',
            description: 'The outlet in my living room stopped working. None of my devices will charge when plugged in.',
            category: 'electrical',
            status: 'in_progress',
            created_at: '2025-04-03T14:15:00Z',
            location: 'San Francisco, CA'
          },
          {
            id: '3',
            title: 'AC Not Cooling',
            description: 'My air conditioner is running but not cooling the house. It might need refrigerant.',
            category: 'hvac',
            status: 'completed',
            created_at: '2025-03-28T09:45:00Z',
            location: 'San Francisco, CA'
          }
        ];
        
        setRequests(mockRequests);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load your requests. Please try again later.');
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error" variant="h6" sx={{ my: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Service Requests
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={RouterLink} 
          to="/requests/new"
        >
          New Request
        </Button>
      </Box>
      
      {requests.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 8, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            You don't have any service requests yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create a new request to find local service providers for your home needs
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/requests/new"
            sx={{ mt: 2 }}
          >
            Create Your First Request
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} key={request.id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" component="div">
                      {request.title}
                    </Typography>
                    <Chip 
                      label={getStatusLabel(request.status)} 
                      color={getStatusColor(request.status)} 
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Created on {formatDate(request.created_at)}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {request.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={request.category.charAt(0).toUpperCase() + request.category.slice(1)} 
                      variant="outlined" 
                      size="small"
                    />
                    <Chip 
                      label={request.location} 
                      variant="outlined" 
                      size="small"
                    />
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/requests/${request.id}`}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RequestsPage;
