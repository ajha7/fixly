import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Avatar, 
  Divider, 
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { authService } from '../../services/authService';

interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profile_picture?: string;
  email_verified?: boolean;
  created_at: string;
  requests?: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
  [key: string]: any;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  profilePicture: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);
  const [editing, setEditing] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePicture: ''
  });

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // const response = await authService.getCurrentUser();
        
        // Mock user data for now
        const mockUser: User = {
          id: '123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '(415) 555-1234',
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          profile_picture: 'https://example.com/profile.jpg',
          email_verified: true,
          created_at: '2025-01-15T10:30:00Z',
          requests: [
            {
              id: '1',
              title: 'Leaking Kitchen Sink',
              status: 'open',
              created_at: '2025-04-01T10:30:00Z'
            },
            {
              id: '2',
              title: 'Electrical Outlet Not Working',
              status: 'in_progress',
              created_at: '2025-04-03T14:15:00Z'
            },
            {
              id: '3',
              title: 'AC Not Cooling',
              status: 'completed',
              created_at: '2025-03-28T09:45:00Z'
            }
          ]
        };
        
        setUser(mockUser);
        
        // Initialize form data with user data
        setFormData({
          name: mockUser.name || '',
          email: mockUser.email || '',
          phone: mockUser.phone || '',
          address: mockUser.address || '',
          city: mockUser.city || '',
          state: mockUser.state || '',
          zipCode: mockUser.zipCode || '',
          profilePicture: mockUser.profile_picture || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load your profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Start editing profile
  const handleEditProfile = (): void => {
    setEditing(true);
  };
  
  // Cancel editing profile
  const handleCancelEdit = (): void => {
    // Reset form data to user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        profilePicture: user.profile_picture || ''
      });
    }
    
    setEditing(false);
  };
  
  // Save profile changes
  const handleSaveProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // await authService.updateProfile(formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data with form data
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          profile_picture: formData.profilePicture
        });
      }
      
      setEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open':
        return '#2196f3'; // Blue
      case 'in_progress':
        return '#ff9800'; // Orange
      case 'completed':
        return '#4caf50'; // Green
      default:
        return '#757575'; // Grey
    }
  };

  if (loading && !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Profile Information" />
          <Tab label="Request History" />
          <Tab label="Account Settings" />
        </Tabs>
      </Box>
      
      {/* Profile Information Tab */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Profile Information
            </Typography>
            {!editing ? (
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            ) : (
              <Box>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Box>
            )}
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  src={user?.profile_picture} 
                  alt={user?.name || 'User'}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                {editing && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    component="label"
                  >
                    Change Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                    />
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    disabled={true} // Email should not be editable
                    helperText={user?.email_verified ? "Verified" : "Not verified"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Address
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Member since {user?.created_at ? formatDate(user.created_at) : ''}
            </Typography>
          </Box>
        </Paper>
      )}
      
      {/* Request History Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Request History
          </Typography>
          
          {user?.requests && user.requests.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
              You haven't made any service requests yet.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {user?.requests?.map((request) => (
                <Paper 
                  key={request.id} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderLeft: `4px solid ${getStatusColor(request.status)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {request.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created on {formatDate(request.created_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textTransform: 'uppercase', 
                        fontWeight: 'bold',
                        color: getStatusColor(request.status)
                      }}
                    >
                      {request.status.replace('_', ' ')}
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small" 
                      href={`/requests/${request.id}`}
                      sx={{ mt: 1 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}
      
      {/* Account Settings Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Account Settings
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Email Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage your email notification preferences
            </Typography>
            
            {/* Notification settings would go here */}
            <Alert severity="info" sx={{ mb: 3 }}>
              Email notification settings are coming soon.
            </Alert>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Password
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Change your account password
            </Typography>
            
            <Button 
              variant="outlined" 
              color="primary"
            >
              Change Password
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="error">
              Delete Account
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Permanently delete your account and all associated data
            </Typography>
            
            <Button 
              variant="outlined" 
              color="error"
            >
              Delete Account
            </Button>
          </Box>
        </Paper>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
