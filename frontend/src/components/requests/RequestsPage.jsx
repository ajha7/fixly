import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, Chip, Divider, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { authService } from '../../services/authService';

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This would be replaced with actual API call to fetch user requests
    const fetchRequests = async () => {
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
        const mockRequests = [
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Service Requests
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={RouterLink} 
          to="/requests/new"
        >
          Create New Request
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 4 }}>
          {error}
        </Typography>
      ) : requests.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            You don't have any service requests yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first request to get started with Fixly
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
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created on {formatDate(request.created_at)}
                  </Typography>
                  
                  <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                    {request.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip 
                      label={request.category.charAt(0).toUpperCase() + request.category.slice(1)} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={request.location} 
                      size="small" 
                      variant="outlined"
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
