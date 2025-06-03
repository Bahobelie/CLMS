import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Divider, TextField, Button,
  Grid, Paper, IconButton, Tooltip, useMediaQuery, useTheme,
  Avatar, CardMedia, CircularProgress, Skeleton, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Info as InfoIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ClinicInfo = () => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_IMAGE_PATH;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = React.useRef(null);
  const [isNewClinic, setIsNewClinic] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Better naming than refetch

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Clinic name is required'),
    address: Yup.string(),
    phone: Yup.string(),
    email: Yup.string().email('Invalid email format'),
    website: Yup.string().url('Invalid URL format'),
    isactive: Yup.boolean()
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      id: '1',
      code: '',
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo_url: '',
      isactive: true
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    }
  });

  // Fetch clinic data - wrapped in useCallback for memoization
  const fetchClinicData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/api/clinicinfo/by-condition`, {
        params: {
          isactive: true
        }
      });

      if (response.data && response.data.length > 0) {
        const latestData = response.data.reduce((latest, current) => {
          const latestDate = new Date(latest.updatedAt || latest.createdAt);
          const currentDate = new Date(current.updatedAt || current.createdAt);
          return currentDate > latestDate ? current : latest;
          setIsNewClinic(false);

        });

        formik.setValues(latestData);
        setLogoPreview(latestData.logo_url || '');
      } else {
        // Reset form if no data found
        formik.resetForm();
        setLogoPreview('');
        setIsNewClinic(true);
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);

    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Fetch clinic data on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchClinicData();
  }, [fetchClinicData, refreshTrigger]);

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      Swal.fire({
        title: 'Invalid File',
        text: 'Please select an image file (JPEG, PNG, etc.)',
        icon: 'error',
        confirmButtonColor: theme.palette.primary.main
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        title: 'File Too Large',
        text: 'Maximum file size is 2MB',
        icon: 'error',
        confirmButtonColor: theme.palette.primary.main
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload logo to server
  const uploadLogo = async () => {
    if (!logoFile) return null;

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await axios.post(`${apiUrl}/api/clinicinfo/uploadLogo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.url;
    } catch (error) {
      console.error('Logo upload failed:', error);
      throw error;
    }
  };

  // Remove logo from server
  const removeLogo = async () => {
    try {
      await axios.delete(`${apiUrl}/api/clinicinfo/logo/${formik.values.id}`);
      return true;
    } catch (error) {
      console.error('Logo removal failed:', error);
      throw error;
    }
  };

  // Save clinic information
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    let logoUrl = values.logo_url;

    try {
      // Handle logo changes
      if (logoFile) {
        logoUrl = await uploadLogo();
      } else if (!logoPreview && values.logo_url) {
        await removeLogo();
        logoUrl = '';
      }

      if (isNewClinic) {
        // Generate code for new clinic
        const codeResponse = await axios.get(`${apiUrl}/api/model/next-code`, {
          params: {
            model: "clinicInfo",
            prefix: "CLI-"
          }
        });

        // Create new clinic
        const newClinic = {
          ...values,
          logo_url: logoUrl ? `${apiUrl}/${logoUrl}` : '',
          code: codeResponse.data.code
        };
      console.log('newClinic',newClinic)
        const response = await axios.post(`${apiUrl}/api/clinicinfo`, newClinic);
        formik.setValues(response.data);
        setIsNewClinic(false);
      } else {
        // Update existing clinic
        values.logo_url = '';
        const updatedClinic = {
          ...values,
          logo_url: logoUrl ? `${apiUrl}/${logoUrl}` : ''
        };

        await axios.put(`${apiUrl}/api/clinicinfo/${values.id}`, updatedClinic);
      }

      // Update local state
      setLogoPreview(logoUrl ? `${apiUrl}/${logoUrl}` : '');
      setLogoFile(null);
      setEditMode(false);

      await Swal.fire({
        title: 'Success!',
        text: 'Clinic information saved successfully',
        icon: 'success',
        confirmButtonColor: theme.palette.primary.main
      });

      // Trigger refresh with a new value
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Save failed:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to save clinic information',
        icon: 'error',
        confirmButtonColor: theme.palette.primary.main
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel edit mode
  const handleCancel = useCallback(() => {
    formik.resetForm();
    setLogoFile(null);
    setLogoPreview(formik.values.logo_url || '');
    setEditMode(false);
    if (isNewClinic) {
      setIsNewClinic(false);
      // If canceling a new clinic, refetch existing data
      setRefreshTrigger(prev => prev + 1);
    }
  }, [formik, isNewClinic]);

  // Start adding new clinic
  const handleAddNew = useCallback(() => {
    formik.resetForm({
      values: {
        id: '',
        code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo_url: '',
        isactive: true
      }
    });
    setLogoPreview('');
    setLogoFile(null);
    setIsNewClinic(true);
    setEditMode(true);
  }, [formik]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Skeleton variant="rectangular" width="60%" height={40} sx={{ mb: 2 }} />
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} lg={3}>
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Grid>
            <Grid item xs={12} md={8} lg={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rectangular" width="100%" height={150} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rectangular" width="100%" height={150} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" width="100%" height={150} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
      <CardContent>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Clinic Information
          </Typography>

          {!editMode ? (
            <Box>
              {formik.values.id ? (
                <Tooltip title="Edit Clinic Information">
                  <IconButton onClick={() => setEditMode(true)} color="primary" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNew}
                  color="primary"
                >
                  Add Clinic
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              <Tooltip title="Cancel">
                <IconButton onClick={handleCancel} sx={{ mr: 1 }} color="error">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save Changes">
                <IconButton
                  onClick={formik.handleSubmit}
                  color="primary"
                  disabled={isSubmitting || !formik.isValid}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {editMode ? (
          // Edit Mode View
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Logo Upload Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Clinic Logo
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar
                      src={logoPreview || formik.values.logo_url}
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        bgcolor: theme.palette.grey[200]
                      }}
                      variant="rounded"
                    >
                      {!logoPreview && !formik.values.logo_url && <UploadIcon fontSize="large" />}
                    </Avatar>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        disabled={isSubmitting}
                      >
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          ref={fileInputRef}
                          onChange={handleLogoChange}
                        />
                      </Button>

                      {(logoPreview || formik.values.logo_url) && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setLogoPreview('');
                            setLogoFile(null);
                            formik.setFieldValue('logo_url', '');
                          }}
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Recommended size: 300x300px (Max 2MB)
                    </Typography>
                  </Paper>
                </Box>

                {/* Basic Information Fields */}
                <TextField
                  label="Clinic Code"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  fullWidth
                  margin="normal"
                  disabled
                />
                <TextField
                  label="Clinic Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  margin="normal"
                  required
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Contact Information Fields */}
                <TextField
                  label="Address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  margin="normal"
                  type="email"
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                  label="Website"
                  name="website"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  margin="normal"
                  type="url"
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={formik.touched.website && formik.errors.website}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.isactive}
                      onChange={formik.handleChange}
                      name="isactive"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          // View Mode
          formik.values.id ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} lg={3}>
                {/* Logo Display */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {formik.values.logo_url ? (
                      <CardMedia
                        component="img"
                        image={formik.values.logo_url}
                        alt="Clinic Logo"
                        sx={{
                          width: '100%',
                          maxWidth: 200,
                          height: 'auto',
                          borderRadius: 1,
                          mb: 2
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: theme.palette.grey[300],
                          mb: 2
                        }}
                      >
                        <Typography variant="h6">No Logo</Typography>
                      </Avatar>
                    )}
                    <Typography variant="subtitle2" color="text.secondary">
                      Clinic Logo
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8} lg={9}>
                {/* Clinic Information Display */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InfoIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Basic Information
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Clinic Code
                        </Typography>
                        <Typography variant="body1">{formik.values.code}</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Clinic Name
                        </Typography>
                        <Typography variant="body1">{formik.values.name}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {formik.values.isactive ? (
                          <>
                            <ActiveIcon color="success" sx={{ mr: 1 }} />
                            <Typography color="success.main">Active</Typography>
                          </>
                        ) : (
                          <>
                            <InactiveIcon color="error" sx={{ mr: 1 }} />
                            <Typography color="error.main">Inactive</Typography>
                          </>
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Address
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {formik.values.address || 'Not specified'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PhoneIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Contact Information
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {formik.values.phone || 'Not specified'}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {formik.values.email || 'Not specified'}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Website
                            </Typography>
                            <Typography variant="body1">
                              {formik.values.website ? (
                                <Button
                                  href={formik.values.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  startIcon={<WebsiteIcon />}
                                  size="small"
                                >
                                  Visit Website
                                </Button>
                              ) : (
                                'Not specified'
                              )}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              textAlign: 'center'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No clinic information found
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                color="primary"
                sx={{ mt: 2 }}
              >
                Add New Clinic
              </Button>
            </Box>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default ClinicInfo;