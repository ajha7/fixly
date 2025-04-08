import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Grid,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    images: []
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    availability: '',
  });
  
  // Available service categories
  const serviceCategories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'painting', label: 'Painting' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'other', label: 'Other' }
  ];
  
  // Days of the week
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];
  
  // Time slots
  const timeSlots = [
    { value: 'morning', label: 'Morning (8am-12pm)' },
    { value: 'afternoon', label: 'Afternoon (12pm-5pm)' },
    { value: 'evening', label: 'Evening (5pm-9pm)' }
  ];
  
  // Steps for the stepper
  const steps = ['Service Details', 'Location', 'Availability', 'Photos'];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle availability checkbox changes
  const handleAvailabilityChange = (day, timeSlot) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [timeSlot]: !formData.availability[day][timeSlot]
        }
      }
    });
    
    // Clear availability error if any time slot is selected
    if (errors.availability) {
      setErrors({
        ...errors,
        availability: ''
      });
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to URLs for preview
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages]
    });
  };
  
  // Remove image
  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  };
  
  // Validate current step
  const validateStep = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (activeStep === 0) {
      // Validate service details
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
        valid = false;
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
        valid = false;
      } else if (formData.description.trim().length < 20) {
        newErrors.description = 'Description should be at least 20 characters';
        valid = false;
      }
      
      if (!formData.category) {
        newErrors.category = 'Please select a category';
        valid = false;
      }
    } else if (activeStep === 1) {
      // Validate location
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
        valid = false;
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
        valid = false;
      }
      
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
        valid = false;
      }
      
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
        valid = false;
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
        newErrors.zipCode = 'Please enter a valid ZIP code';
        valid = false;
      }
    } else if (activeStep === 2) {
      // Validate availability
      let hasAvailability = false;
      
      for (const day in formData.availability) {
        for (const timeSlot in formData.availability[day]) {
          if (formData.availability[day][timeSlot]) {
            hasAvailability = true;
            break;
          }
        }
        if (hasAvailability) break;
      }
      
      if (!hasAvailability) {
        newErrors.availability = 'Please select at least one availability time slot';
        valid = false;
      }
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep()) {
      try {
        setLoading(true);
        
        // Format the data for API submission
        const formattedAvailability = [];
        
        for (const day in formData.availability) {
          const timeSlots = [];
          
          for (const timeSlot in formData.availability[day]) {
            if (formData.availability[day][timeSlot]) {
              timeSlots.push(timeSlot);
            }
          }
          
          if (timeSlots.length > 0) {
            formattedAvailability.push({
              day: day.charAt(0).toUpperCase() + day.slice(1),
              timeSlots
            });
          }
        }
        
        const requestData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          availability: formattedAvailability,
          // Images would be handled with FormData in a real implementation
        };
        
        console.log('Submitting request:', requestData);
        
        // Mock API call
        // In a real implementation, you would use FormData to handle file uploads
        // const response = await fetch('/api/requests', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        //   },
        //   body: JSON.stringify(requestData)
        // });
        
        // if (!response.ok) {
        //   throw new Error('Failed to create request');
        // }
        
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to the request detail page
        navigate('/requests/1');
      } catch (error) {
        console.error('Error creating request:', error);
        // Handle error
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Service Details
            </Typography>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              error={!!errors.title}
              helperText={errors.title}
              placeholder="e.g., Leaking Kitchen Sink"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Please describe your issue in detail. The more information you provide, the better we can match you with the right service provider."
            />
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!errors.category}
            >
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                {serviceCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <TextField
              fullWidth
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              error={!!errors.address}
              helperText={errors.address}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  margin="normal"
                  error={!!errors.city}
                  helperText={errors.city}
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
                  error={!!errors.state}
                  helperText={errors.state}
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
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Availability
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please select all the times when you're available for a service provider to visit.
            </Typography>
            
            {errors.availability && (
              <FormHelperText error>{errors.availability}</FormHelperText>
            )}
            
            <Grid container spacing={3}>
              {daysOfWeek.map((day) => (
                <Grid item xs={12} sm={6} md={4} key={day.value}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {day.label}
                    </Typography>
                    <FormGroup>
                      {timeSlots.map((timeSlot) => (
                        <FormControlLabel
                          key={`${day.value}-${timeSlot.value}`}
                          control={
                            <Checkbox
                              checked={formData.availability[day.value][timeSlot.value]}
                              onChange={() => handleAvailabilityChange(day.value, timeSlot.value)}
                            />
                          }
                          label={timeSlot.label}
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Photos (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload photos of the issue to help service providers better understand your needs.
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddPhotoAlternateIcon />}
              sx={{ mb: 3 }}
            >
              Upload Photos
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </Button>
            
            {formData.images.length > 0 && (
              <Grid container spacing={2}>
                {formData.images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #eee'
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                          }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Create New Request
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default NewRequestPage;
