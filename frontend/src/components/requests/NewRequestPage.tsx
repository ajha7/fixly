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
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

interface DayAvailability {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

interface Availability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  availability: Availability;
  images: File[];
  imagePreviewUrls: string[];
  urgency: string;
  budget: string;
  additionalInfo: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  availability?: string;
  urgency?: string;
  budget?: string;
}

const NewRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
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
    images: [],
    imagePreviewUrls: [],
    urgency: 'normal',
    budget: '',
    additionalInfo: ''
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Service categories
  const serviceCategories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'painting', label: 'Painting' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'appliance_repair', label: 'Appliance Repair' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'other', label: 'Other' }
  ];
  
  // Urgency options
  const urgencyOptions = [
    { value: 'emergency', label: 'Emergency (ASAP)' },
    { value: 'urgent', label: 'Urgent (Within 24 hours)' },
    { value: 'normal', label: 'Normal (Within a few days)' },
    { value: 'flexible', label: 'Flexible (Anytime in the next 2 weeks)' }
  ];
  
  // Budget options
  const budgetOptions = [
    { value: 'under_100', label: 'Under $100' },
    { value: '100_300', label: '$100 - $300' },
    { value: '300_500', label: '$300 - $500' },
    { value: '500_1000', label: '$500 - $1,000' },
    { value: 'over_1000', label: 'Over $1,000' },
    { value: 'not_sure', label: 'Not sure (Request quotes)' }
  ];
  
  // Steps for the stepper
  const steps = [
    'Service Details',
    'Location & Availability',
    'Additional Information',
    'Review & Submit'
  ];
  
  // Handle text field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  // Handle select field changes
  const handleSelectChange = (e: SelectChangeEvent<string>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  // Handle availability checkbox changes
  const handleAvailabilityChange = (day: keyof Availability, timeSlot: keyof DayAvailability): void => {
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
        availability: undefined
      });
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 5 images total
      const totalImages = formData.images.length + newFiles.length;
      if (totalImages > 5) {
        alert('You can upload a maximum of 5 images');
        return;
      }
      
      // Create preview URLs for the new images
      const newImagePreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setFormData({
        ...formData,
        images: [...formData.images, ...newFiles],
        imagePreviewUrls: [...formData.imagePreviewUrls, ...newImagePreviewUrls]
      });
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number): void => {
    // Create a copy of the arrays
    const updatedImages = [...formData.images];
    const updatedPreviewUrls = [...formData.imagePreviewUrls];
    
    // Remove the image at the specified index
    updatedImages.splice(index, 1);
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviewUrls[index]);
    updatedPreviewUrls.splice(index, 1);
    
    setFormData({
      ...formData,
      images: updatedImages,
      imagePreviewUrls: updatedPreviewUrls
    });
  };
  
  // Validate form for the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (activeStep === 0) {
      // Validate service details
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.trim().length < 20) {
        newErrors.description = 'Description should be at least 20 characters';
      }
      
      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }
    } else if (activeStep === 1) {
      // Validate location and availability
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
      
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      }
      
      // Check if at least one availability slot is selected
      const hasAvailability = Object.values(formData.availability).some(day => 
        Object.values(day).some(timeSlot => timeSlot)
      );
      
      if (!hasAvailability) {
        newErrors.availability = 'Please select at least one availability slot';
      }
    } else if (activeStep === 2) {
      // Validate additional information
      if (!formData.urgency) {
        newErrors.urgency = 'Please select urgency level';
      }
      
      if (!formData.budget) {
        newErrors.budget = 'Please select a budget range';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = (): void => {
    if (validateCurrentStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = (): void => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (): void => {
    try {
      setLoading(true);
      
      // This would be replaced with actual API call to submit the request
      // const formDataToSend = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   if (key === 'images') {
      //     formData.images.forEach(image => {
      //       formDataToSend.append('images', image);
      //     });
      //   } else if (key === 'imagePreviewUrls') {
      //     // Skip this field as it's only for UI
      //   } else if (key === 'availability') {
      //     formDataToSend.append(key, JSON.stringify(value));
      //   } else {
      //     formDataToSend.append(key, value);
      //   }
      // });
      
      // const response = await fetch('/api/requests', {
      //   method: 'POST',
      //   body: formDataToSend,
      //   headers: {
      //     Authorization: `Bearer ${authService.getToken()}`
      //   }
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to requests page after successful submission
      navigate('/requests');
    } catch (err) {
      console.error('Error submitting request:', err);
      setLoading(false);
    }
  };
  
  // Get day name for display
  const getDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Format availability for display
  const formatAvailability = (): string => {
    const availableTimes: string[] = [];
    
    Object.entries(formData.availability).forEach(([day, slots]) => {
      const dayName = getDayName(day);
      const availableSlots: string[] = [];
      
      if (slots.morning) availableSlots.push('Morning');
      if (slots.afternoon) availableSlots.push('Afternoon');
      if (slots.evening) availableSlots.push('Evening');
      
      if (availableSlots.length > 0) {
        availableTimes.push(`${dayName}: ${availableSlots.join(', ')}`);
      }
    });
    
    return availableTimes.join(' | ');
  };
  
  // Get category label
  const getCategoryLabel = (value: string): string => {
    const category = serviceCategories.find(cat => cat.value === value);
    return category ? category.label : '';
  };
  
  // Get urgency label
  const getUrgencyLabel = (value: string): string => {
    const urgency = urgencyOptions.find(opt => opt.value === value);
    return urgency ? urgency.label : '';
  };
  
  // Get budget label
  const getBudgetLabel = (value: string): string => {
    const budget = budgetOptions.find(opt => opt.value === value);
    return budget ? budget.label : '';
  };
  
  // Render step content based on active step
  const getStepContent = (step: number): JSX.Element => {
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
              required
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
              required
            />
            
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!errors.category}
              required
            >
              <InputLabel>Service Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleSelectChange}
                label="Service Category"
              >
                {serviceCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add Photos (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload photos of the issue to help service providers better understand your needs (max 5 images)
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {formData.imagePreviewUrls.map((url, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                    }}
                  >
                    <Box
                      component="img"
                      src={url}
                      alt={`Preview ${index}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'background.paper',
                        }
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                
                {formData.imagePreviewUrls.length < 5 && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{
                      width: 100,
                      height: 100,
                      borderStyle: 'dashed'
                    }}
                  >
                    Add
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Location & Availability
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                  error={!!errors.address}
                  helperText={errors.address}
                  required
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
                  error={!!errors.city}
                  helperText={errors.city}
                  required
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
                  required
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
                  required
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Availability
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select all time slots when you're available for service
              </Typography>
              
              {errors.availability && (
                <FormHelperText error sx={{ mb: 2 }}>
                  {errors.availability}
                </FormHelperText>
              )}
              
              <Grid container spacing={2}>
                {Object.entries(formData.availability).map(([day, slots]) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={day}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {getDayName(day)}
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={slots.morning}
                              onChange={() => handleAvailabilityChange(day as keyof Availability, 'morning')}
                            />
                          }
                          label="Morning (8am-12pm)"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={slots.afternoon}
                              onChange={() => handleAvailabilityChange(day as keyof Availability, 'afternoon')}
                            />
                          }
                          label="Afternoon (12pm-5pm)"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={slots.evening}
                              onChange={() => handleAvailabilityChange(day as keyof Availability, 'evening')}
                            />
                          }
                          label="Evening (5pm-9pm)"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!errors.urgency}
              required
            >
              <InputLabel>Urgency</InputLabel>
              <Select
                name="urgency"
                value={formData.urgency}
                onChange={handleSelectChange}
                label="Urgency"
              >
                {urgencyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.urgency && <FormHelperText>{errors.urgency}</FormHelperText>}
            </FormControl>
            
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!errors.budget}
              required
            >
              <InputLabel>Budget Range</InputLabel>
              <Select
                name="budget"
                value={formData.budget}
                onChange={handleSelectChange}
                label="Budget Range"
              >
                {budgetOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.budget && <FormHelperText>{errors.budget}</FormHelperText>}
            </FormControl>
            
            <TextField
              fullWidth
              label="Additional Information (Optional)"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              placeholder="Any other details that might help service providers understand your request better"
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Request
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Service Category
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="body1">
                    {getCategoryLabel(formData.category)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Title
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="body1">
                    {formData.title}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="body1">
                    {formData.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="body1">
                    {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Availability
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="body1">
                    {formatAvailability()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Urgency
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="body1">
                    {getUrgencyLabel(formData.urgency)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Budget
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="body1">
                    {getBudgetLabel(formData.budget)}
                  </Typography>
                </Grid>
                
                {formData.additionalInfo && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Additional Info
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Typography variant="body1">
                        {formData.additionalInfo}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {formData.imagePreviewUrls.length > 0 && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Images
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {formData.imagePreviewUrls.map((url, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={url}
                            alt={`Image ${index + 1}`}
                            sx={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              By submitting this request, you agree to our Terms of Service and Privacy Policy. Service providers will be able to see the details of your request and may contact you directly.
            </Typography>
          </Box>
        );
      default:
        return <Box>Unknown step</Box>;
    }
  };

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
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          New Service Request
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4, pt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Request'}
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
      </Paper>
    </Container>
  );
};

export default NewRequestPage;
