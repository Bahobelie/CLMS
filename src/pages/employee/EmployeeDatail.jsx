import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CardContent, Typography, CircularProgress, Avatar, Tabs, Tab, Grid, Paper, Button,
  TextField, FormControl, InputLabel, Select, MenuItem, Chip, Box, IconButton, Tooltip
} from '@mui/material';
import {
  IoMdArrowRoundBack,
  IoMdCalendar,
  IoMdCash,
  IoMdCreate,
  IoMdInformationCircle,
  IoMdCheckmarkCircleOutline,
  IoMdCloseCircleOutline
} from "react-icons/io";
import { motion } from 'framer-motion';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import defaultAvatar from '../../assets/images/users/avatar-1.png';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Updated validation schema
const validationSchema = Yup.object().shape({
  firstname: Yup.string().required('First name is required'),
  lastname: Yup.string().required('Last name is required'),
  specialization: Yup.string(),
  phonenumber: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, 'Must be at least 10 digits'),
  email: Yup.string().email('Invalid email'),
  gender: Yup.string(),
  dateofbirth: Yup.date().nullable(),
  yearsofexperience: Yup.number().min(0, 'Cannot be negative'),
  status: Yup.string().required('Status is required'),
  availabilitydays: Yup.array()
});

const EmployeeDetail = ({navigationPath}) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeType, setEmployeeType] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/employees/by-condition`, {
          params: { code }
        });

        const employeeType = await axios.get(`${apiUrl}/systemConstants/by-condition`, {
          params: {
            id: response.data[0].type
          }
        });

        if (response.data.length === 0) {
          throw new Error('Employee not found');
        }

        setEmployee(response.data[0]);
        setEmployeeType(employeeType.data[0].name);

      } catch (err) {
        console.error('Failed to fetch employee:', err);
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || 'Failed to fetch employee data',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then(() => navigate('/employees'));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [code]);

  const handleUpdate = async (values) => {
    setIsSubmitting(true);
    console.log('Form submission started with values:', values);

    try {
      // Format date properly before sending
      const formattedValues = {
        ...values,
        dateofbirth: values.dateofbirth ? new Date(values.dateofbirth).toISOString() : null,
        yearsofexperience: values.yearsofexperience || null
      };

      console.log('Sending payload:', formattedValues);

      const response = await axios.put(`${apiUrl}/employees/${employee.id}`, formattedValues);

      if (response.status === 200) {
        console.log('Update successful:', response.data);
        setEmployee(response.data);
        setEditMode(false);
        await Swal.fire({
          title: 'Success!',
          text: 'Employee information updated successfully.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Update error:', err);
      await Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to update employee.',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const renderAvailabilityChip = (availability) => {
    const isAvailable = availability?.toLowerCase() === 'available';
    return (
      <Chip
        label={availability || 'Unknown'}
        icon={isAvailable ?
          <IoMdCheckmarkCircleOutline /> :
          <IoMdCloseCircleOutline />}
        color={isAvailable ? 'success' : 'error'}
        variant="outlined"
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6">Employee not found</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/employees')}
          sx={{ mt: 2 }}
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  const getTabContent = () => {
    switch (tabIndex) {
      case 0:
        return (
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IoMdCalendar size={24} style={{ marginRight: 8 }} />
              <Typography variant="h6">Work Schedule</Typography>
            </Box>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1">
                {employee.firstname}'s upcoming shifts will be displayed here.
              </Typography>
            </Paper>
          </CardContent>
        );
      case 1:
        return (
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IoMdCash size={24} style={{ marginRight: 8 }} />
              <Typography variant="h6">Salary Information</Typography>
            </Box>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Base Salary</Typography>
                  <Typography variant="body2">$X,XXX.XX per month</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Last Pay Date</Typography>
                  <Typography variant="body2">MM/DD/YYYY</Typography>
                </Grid>
              </Grid>
            </Paper>
          </CardContent>
        );
      case 2:
        return editMode ? (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Formik
              initialValues={{
                firstname: employee.firstname || '',
                lastname: employee.lastname || '',
                specialization: employee.specialization || '',
                phonenumber: employee.phonenumber || '',
                email: employee.email || '',
                gender: employee.gender || '',
                dateofbirth: employee.dateofbirth ? new Date(employee.dateofbirth) : null,
                yearsofexperience: employee.yearsofexperience || '',
                availabilitydays: employee.availabilitydays || [],
                status: employee.status || 'Unavailable',
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdate}
              enableReinitialize
            >
              {({ values, errors, touched, setFieldValue, handleReset }) => (
                <Form>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          label="First Name"
                          name="firstname"
                          error={touched.firstname && Boolean(errors.firstname)}
                          helperText={touched.firstname && errors.firstname}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          label="Last Name"
                          name="lastname"
                          error={touched.lastname && Boolean(errors.lastname)}
                          helperText={touched.lastname && errors.lastname}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          label="Specialization"
                          name="specialization"
                          error={touched.specialization && Boolean(errors.specialization)}
                          helperText={touched.specialization && errors.specialization}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          label="Phone Number"
                          name="phonenumber"
                          error={touched.phonenumber && Boolean(errors.phonenumber)}
                          helperText={touched.phonenumber && errors.phonenumber}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={touched.gender && Boolean(errors.gender)}>
                          <InputLabel>Gender</InputLabel>
                          <Select
                            value={values.gender}
                            onChange={(e) => setFieldValue('gender', e.target.value)}
                            label="Gender"
                            name="gender"
                          >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                          {touched.gender && errors.gender && (
                            <Typography variant="caption" color="error">
                              {errors.gender}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="Date of Birth"
                          value={values.dateofbirth}
                          onChange={(date) => setFieldValue('dateofbirth', date)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={touched.dateofbirth && Boolean(errors.dateofbirth)}
                              helperText={touched.dateofbirth && errors.dateofbirth}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          label="Years of Experience"
                          name="yearsofexperience"
                          type="number"
                          error={touched.yearsofexperience && Boolean(errors.yearsofexperience)}
                          helperText={touched.yearsofexperience && errors.yearsofexperience}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={touched.status && Boolean(errors.status)}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={values.status}
                            onChange={(e) => setFieldValue('status', e.target.value)}
                            label="Status"
                            name="status"
                          >
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Unavailable">Unavailable</MenuItem>
                          </Select>
                          {touched.status && errors.status && (
                            <Typography variant="caption" color="error">
                              {errors.status}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={touched.availabilitydays && Boolean(errors.availabilitydays)}>
                          <InputLabel>Available Days</InputLabel>
                          <Select
                            multiple
                            value={values.availabilitydays}
                            onChange={(e) => setFieldValue('availabilitydays', e.target.value)}
                            label="Available Days"
                            name="availabilitydays"
                          >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                              .map(day => (
                                <MenuItem key={day} value={day}>{day}</MenuItem>
                              ))}
                          </Select>
                          {touched.availabilitydays && errors.availabilitydays && (
                            <Typography variant="caption" color="error">
                              {errors.availabilitydays}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            handleReset();
                            setEditMode(false);
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                        >
                          {isSubmitting ? 'Updating...' : 'Update'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Form>
              )}
            </Formik>
          </LocalizationProvider>
        ) : (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IoMdInformationCircle size={24} style={{ marginRight: 8 }} />
                <Typography variant="h6">Employee Information</Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<IoMdCreate />}
                onClick={toggleEditMode}
              >
                Edit
              </Button>
            </Box>

            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Full Name</Typography>
                  <Typography variant="body1">{employee.firstname} {employee.lastname}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Employee Code</Typography>
                  <Typography variant="body1">{employee.code}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body1">{employee.email || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Phone Number</Typography>
                  <Typography variant="body1">{employee.phonenumber || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Gender</Typography>
                  <Typography variant="body1">{employee.gender || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date of Birth</Typography>
                  <Typography variant="body1">
                    {employee.dateofbirth ? new Date(employee.dateofbirth).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Specialization</Typography>
                  <Typography variant="body1">{employee.specialization || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Years of Experience</Typography>
                  <Typography variant="body1">{employee.yearsofexperience || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Employee Type</Typography>
                  <Typography variant="body1">{employeeType || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  {renderAvailabilityChip(employee.status)}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Available Days</Typography>
                  <Typography variant="body1">
                    {employee.availabilitydays?.join(', ') || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Tooltip title="Back to employees">
          <IconButton
            onClick={() => navigate(`/${navigationPath}`)}
            size="large"
            sx={{ backgroundColor: theme.palette.grey[200] }}
          >
            <IoMdArrowRoundBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {employee.firstname} {employee.lastname}
        </Typography>
        <Chip
          label={employeeType || 'Employee'}
          color="primary"
          size="small"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center', height: '100%' }}>
              <Avatar
                src={defaultAvatar}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  border: `3px solid ${theme.palette.primary.main}`
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {employee.firstname} {employee.lastname}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {employee.specialization || 'Employee'}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                {renderAvailabilityChip(employee.status)}
                <Chip
                  label={`ID: ${employee.code}`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Tabs
                orientation="vertical"
                value={tabIndex}
                onChange={(_, newIndex) => {
                  setTabIndex(newIndex);
                  setEditMode(false);
                }}
                sx={{
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }
                }}
              >
                <Tab
                  label="Work Schedule"
                  icon={<IoMdCalendar style={{ marginRight: 8 }} />}
                  iconPosition="start"
                />
                <Tab
                  label="Salary Info"
                  icon={<IoMdCash style={{ marginRight: 8 }} />}
                  iconPosition="start"
                />
                <Tab
                  label="Employee Info"
                  icon={<IoMdInformationCircle style={{ marginRight: 8 }} />}
                  iconPosition="start"
                />
              </Tabs>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {getTabContent()}
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

export default EmployeeDetail;