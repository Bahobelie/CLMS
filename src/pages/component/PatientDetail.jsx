import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, CircularProgress, Avatar, Tabs, Tab, Grid, Paper, Button,
  Chip, IconButton, Tooltip, Badge
} from '@mui/material';
import { IoMdArrowRoundBack } from "react-icons/io";
import { motion } from 'framer-motion';
import {
  MedicalServices as MedicalServicesIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  LocalHospital as PrescriptionIcon,
  Favorite as HealthIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import defaultAvatar from '../../assets/images/users/patient.jpg';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { Field, Form, Formik } from 'formik';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Swal from 'sweetalert2';
import PatientHealtInfo from '../patient/PatientHealtInfo';
import MedicalRecords from '../patient/MedicalRecords';
import AppointmentCalendar from '../appointement/Appointemnet';
import LabTestsTable from '../patient/PaymentReson';
import LabTestsView from '../patient/LabTestsView';
import PatientImages from '../patient/PatientImages';

const PatientDetail = () => {
  const theme = useTheme();
  const { code } = useParams();
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  let userRole = localStorage.getItem('userRole'); // Assuming the role is stored as 'userRole'

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/patients/by-condition?code=${code}`);
      setPatient(response.data[0]);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch patient data',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [code, apiUrl]);

  const handleUpdate = async (values) => {
    try {
      const Data = {
        id: patient.id,
        code: values.code,
        first_name: values.firstName,
        middle_name: values.middleName,
        last_name: values.lastName,
        gender: values.gender,
        date_of_birth: values.dateOfBirth,
        blood_group: values.bloodGroup || "Unknown",
        bmi: values.bmiTest || "No",
        bp: values.bloodPressure || "No",
        district_state: values.selectDistrict || "Addis Ababa",
        phone_number: values.phoneNumber,
        country: "Ethiopia",
        application_fee: values.applicationFee || 'Expired',
        remark: values.Remark
      };

      const response = await axios.put(`${apiUrl}/patients/${patient.id}`, Data);
      if (response.status === 200) {
        await Swal.fire({
          title: 'Success!',
          text: 'Patient updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchPatient();
        setEditMode(false);
      }
    } catch (e) {
      console.log(e);
      await Swal.fire({
        title: 'Error!',
        text: `Failed to update patient: ${e.message}`,
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
    setEditMode(false); // Exit edit mode when switching tabs
  };

  const getStatusChip = () => {
    let color = 'default';
    let label = 'Unknown';

    // Example logic - adjust based on your actual status indicators
    if (patient?.application_fee === 'Expired') {
      color = 'error';
      label = 'Inactive';
    } else if (patient?.bp === 'High' || patient?.bmi === 'High') {
      color = 'warning';
      label = 'Needs Attention';
    } else {
      color = 'success';
      label = 'Active';
    }

    return <Chip label={label} color={color} size="small" sx={{ ml: 1 }} />;
  };

  const getTabContent = () => {
    if (!patient) return null;

    switch (tabIndex) {
      case 0: // Medical Record
        return <MedicalRecords patient={patient} />;
      case 1: // Appointments
        return <AppointmentCalendar patient={patient} />;
      case 2: // Invoice
        return (
          <CardContent>
            <LabTestsTable patient={patient}/>
          </CardContent>
        );
      case 3: // Image
        return (
          <CardContent>
            <PatientImages
            patient={patient}
            apiUrl={apiUrl}
            refreshPatient={fetchPatient}
            />;
          </CardContent>
        );
      case 4: // Patient Information
        return editMode ? (
          <Formik
            initialValues={{
              code: patient.code,
              firstName: patient.first_name,
              middleName: patient.middle_name,
              lastName: patient.last_name,
              phoneNumber: patient.phone_number,
              dateOfBirth: patient.date_of_birth,
              Remark: patient.remark,
              gender: patient.gender
            }}
            onSubmit={handleUpdate}
          >
            {({ values, setFieldValue, handleReset }) => (
              <Form>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4">
                    Edit Patient Information
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        handleReset();
                        setEditMode(false);
                      }}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" color="primary" type="submit">
                      Save Changes
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Patient Code"
                      name="code"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      label="First Name"
                      name="firstName"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Middle Name"
                      name="middleName"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      label="Last Name"
                      name="lastName"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label="Date of Birth *"
                        value={values.dateOfBirth}
                        onChange={(val) => setFieldValue('dateOfBirth', val)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Gender *</InputLabel>
                      <Select
                        name="gender"
                        value={values.gender}
                        onChange={(e) => setFieldValue('gender', e.target.value)}
                        label="Gender *"
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      multiline
                      rows={3}
                      label="Remarks"
                      name="Remark"
                    />
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">
                Patient Information
                {getStatusChip()}
              </Typography>
              <Box>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={fetchPatient} sx={{ mr: 1 }}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="textSecondary">Patient Code</Typography>
                <Typography variant="body1">{patient.code}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="textSecondary">First Name</Typography>
                <Typography variant="body1">{patient.first_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="textSecondary">Middle Name</Typography>
                <Typography variant="body1">{patient.middle_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="textSecondary">Last Name</Typography>
                <Typography variant="body1">{patient.last_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="textSecondary">Phone Number</Typography>
                <Typography variant="body1">{patient.phone_number}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="textSecondary">Date of Birth</Typography>
                <Typography variant="body1">
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="textSecondary">Gender</Typography>
                <Typography variant="body1">{patient.gender}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textSecondary">Remarks</Typography>
                <Typography variant="body1">{patient.remark || 'No remarks'}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      case 5: // Prescription
        return (
          <CardContent>
            <Typography variant="h5" gutterBottom>Prescriptions</Typography>
            <Typography color="textSecondary">Prescription details will be displayed here.</Typography>
          </CardContent>
        );
      case 6: // Health Info
        return <PatientHealtInfo patient={patient} handelUpdate={handleUpdate} />;
      case 7: // Lab Tests
        return (
          <CardContent>
            <LabTestsView patient={patient} />
          </CardContent>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" color="error">Patient not found</Typography>
        <Button
          variant="outlined"
          startIcon={<IoMdArrowRoundBack />}
          onClick={() => navigate('/patients')}
          sx={{ mt: 2 }}
        >
          Back to Patients List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Back to patients list">
          <IconButton
            onClick={() => navigate('/patients')}
            size="large"
            sx={{ mr: 2, backgroundColor: theme.palette.action.hover }}
          >
            <IoMdArrowRoundBack />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h3" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            {patient.first_name} {patient.middle_name} {patient.last_name}
            {getStatusChip()}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Patient ID: {patient.code} • Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Profile Card */}
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        border: `2px solid ${theme.palette.background.paper}`
                      }}
                    >
                      {patient.first_name.charAt(0)}
                    </Avatar>
                  }
                >
                  <Avatar
                    src={defaultAvatar}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      border: `3px solid ${theme.palette.primary.light}`
                    }}
                  />
                </Badge>

                <Typography variant="h5" align="center">
                  {patient.first_name} {patient.last_name}
                </Typography>
                <Typography color="textSecondary" align="center">
                  {patient.gender}, {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years
                </Typography>

                <Box sx={{ display: 'flex', mt: 2, mb: 2 }}>
                  <Chip
                    label={patient.blood_group || 'Unknown'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`BMI: ${patient.bmi || 'N/A'}`}
                    size="small"
                    color={patient.bmi > 25 ? 'warning' : 'default'}
                  />
                </Box>

                <Divider sx={{ width: '100%', my: 2 }} />

                <Typography variant="body2" color="textSecondary" align="center">
                  <strong>Phone:</strong> {patient.phone_number || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  <strong>Location:</strong> {patient.district_state || 'N/A'}
                </Typography>
              </Box>

              <Divider sx={{ width: '100%', my: 3 }} />

              {/* Vertical Tabs */}
              <Tabs
                orientation="vertical"
                value={tabIndex}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{
                  '& .MuiTabs-indicator': {
                    left: 0,
                    width: 4,
                    borderRadius: 2
                  }
                }}
              >
                {[
                  { label: 'Medical Records', icon: <MedicalServicesIcon /> },
                  { label: 'Appointments', icon: <CalendarIcon /> },
                  { label: 'Payment Reason', icon: <ReceiptIcon /> },
                  { label: 'Images', icon: <ImageIcon /> },
                  { label: 'Information', icon: <PersonIcon /> },
                  { label: 'Prescriptions', icon: <PrescriptionIcon /> },
                  { label: 'Health Info', icon: <HealthIcon /> },
                  { label: 'Lab Tests', icon: <MedicalServicesIcon /> },

                ].map((tab, index) => (
                  <Tab
                    key={index}
                    label={
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%',
                        px: 2,
                        py: 1
                      }}>
                        {tab.icon}
                        <Typography sx={{ ml: 2 }}>{tab.label}</Typography>
                      </Box>
                    }
                    sx={{
                      alignItems: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 1,
                      my: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                        color: theme.palette.primary.main
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Paper>
          </motion.div>
        </Grid>

        {/* Right Side: Content Area */}
        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: '70vh' }}>
              {getTabContent()}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDetail;