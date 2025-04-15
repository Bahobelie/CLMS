import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, CircularProgress, Avatar, Tabs, Tab, Grid, Paper, Button
} from '@mui/material';
import { IoMdArrowRoundBack, IoMdImage, IoMdDocument, IoMdCash } from "react-icons/io";
import { motion } from 'framer-motion';

import defaultAvater from '../../assets/images/users/patient.jpg';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { Field, Form, Formik } from 'formik';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Swal from 'sweetalert2';
import PatientHealtInfo from '../patient/PatientHealtInfo';
import Icons from '../../assets/index';
import MedicalRecords from '../patient/MedicalRecords';

const PatientDetail = () => {
  const theme = useTheme();

  const { code } = useParams();

  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`${apiUrl}/patients/by-condition?code=${code}`);
        setPatient(response.data[0]);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [code, apiUrl]);

  const handelUpdate=async (values)=>{
    try {
      const Data = {
        id:patient.id,
        code: values.code,
        first_name: values.firstName,
        middle_name: values.middleName,
        last_name: values.lastName,
        gender: values.gender,
        date_of_birth:values.dateOfBirth,
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
          title: 'Patient Updated!',
          text: 'You have successfully Update.',
          icon: 'success',
          timer: 3000, // Auto-close after 3 seconds
          showConfirmButton: false
        });
      }
    }
    catch (e){
      console.log(e)
      await Swal.fire({
        title: 'Patient Not Updated!',
        text: `You have error on dit.${e.message}`,
        icon: 'error',
        timer: 3000, // Auto-close after 3 seconds
        showConfirmButton: false
      });
    }
  }
  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;

  const getTabContent = () => {
    if (!patient) return null;

    switch (tabIndex) {
      case 3: // Image
        return (
          <CardContent>
            <Typography variant="h6">Patient Image</Typography>
            <Typography>Image content will be displayed here.</Typography>
          </CardContent>
        );
      case 0: // Medical Record
        return (
          <CardContent>
              <MedicalRecords patient={patient}/>
          </CardContent>
        );
      case 2: // Invoice
        return (
          <CardContent>
            <Typography variant="h6">Invoice</Typography>
            <Typography>Invoice details will be displayed here.</Typography>
          </CardContent>
        );
      case 4:
        return (
          <Formik
            initialValues={{
              code: patient.code,
              firstName: patient.first_name,
              middleName: patient.middle_name,
              lastName: patient.last_name,
              phoneNumber: patient.phone_number,
              dateOfBirth: patient.date_of_birth,
              Remark: patient.remark,
              gender:patient.gender
            }}
            onSubmit={(values) => {
              handelUpdate(values)
            }}
          >
            {({ values, setFieldValue, handleReset }) => (
              <Form>
                <Typography variant='h2' sx={{ textAlign: 'center', marginTop: '-34' }}>{patient.first_name}
                  <span style={{color:theme.palette.primary[100],marginLeft:'14px'}}>Information</span>
                </Typography>
                <CardContent>

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        label="Code"
                        name="code"
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        required
                        label="First Name"
                        name="firstName"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        label="Middle Name"
                        name="middleName"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        required
                        label="Last Name"
                        name="lastName"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label="Date of Birth *"
                          value={patient.dateOfBirth}
                          onChange={(val) => setFieldValue('dateOfBirth', val)}
                          slotProps={{
                            textField: {
                              fullWidth: true
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Gender *</InputLabel>
                        <Select
                          name="gender"
                          value={values.gender}
                          onChange={(e) => setFieldValue('gender', e.target.value)}
                          label="Gender *"
                           variant='outlined'>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        label="Remark"
                        name="Remark"
                      />
                    </Grid>

                    {/* Buttons */}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 ,mt:'120px'}}>
                      <Button variant="outlined" color="secondary" onClick={handleReset}>
                        Reset
                      </Button>
                      <Button variant="contained" color="primary" type="submit">
                        Update
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Form>
            )}
          </Formik>
        );
      case 6:
       return (
         <PatientHealtInfo patient={patient} handelUpdate={handelUpdate} />
       )
      default:
        return null;
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '14px', alignItems: "center" }}>
        <Button
          variant='outlined'
          onClick={() => Navigate('/patients')}
          sx={{
            p: '10px', borderRadius: '8px', borderStyle: 'dotted',
            ':hover': {
              borderRadius: '8px', borderStyle: 'dotted'
            }
          }}
          startIcon={<IoMdArrowRoundBack />}
        />
        <Typography variant='h3'>{patient.first_name + ' ' + (patient.middle_name ? patient.middle_name + ' ' : '') + patient.last_name}</Typography>
      </div>

      <Grid container spacing={3} sx={{ margin: '20px 12px' }}>
        {/* Left Side: Avatar + Vertical Tabs */}
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ p: 2, width: '400px', borderRadius: '8px', height: '50rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={defaultAvater}
                sx={{ width: 100, height: 100,
                  mb: 2,borderRadius:'50%',
                  overflow:'hidden',
                  border: `2px solid #fff`, // optional white border
                  backgroundColor:theme.palette.primary[100] }}
              />
              <h3>{patient.first_name}  {patient.middle_name}</h3>
              <span style={{color:'gray'}}>{patient?.phone_number}</span>
              <Divider sx={{ mb: 2, borderBottomWidth: '2px', borderColor: theme.palette.primary[100] }} />
              <Tabs
                orientation="vertical"
                value={tabIndex}
                onChange={(_, newIndex) => setTabIndex(newIndex)}
                textColor="primary"
                indicatorColor="transparent" // Make indicator color transparent to customize
                sx={{ width: '100%' }}
              >
                <Tab
                  label={
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      justifyContent: 'flex-start',
                      backgroundColor: 'rgb(248 250 250)',
                      border:'1px',
                      borderRadius: '12px',
                      p: 1.75,
                      width: '90%',
                      '&:hover': { color: '#07b8db' }, // Remove hover effect here
                      '&.Mui-selected': { color: '#07b8db' } // Custom selected tab color
                    }}>
                      <img
                        src={Icons.MedicalRecord}
                        alt="Medical Record Icon"
                        style={{ width: '24px', height: '24px' }} // Adjust size as needed
                      />
                      Medical Record
                    </Box>
                  }
                  sx={{
                    justifyContent: 'center', textAlign: 'center', marginLeft: '10px',
                    '&:hover': {
                      backgroundColor: 'transparent', // Ensure no background color on hover for the Tab component itself
                    },
                    '&.Mui-selected': {
                      color: '#07b8db' // Set color for selected tab
                    }
                  }}
                />

                <Tab
                  label={
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2, justifyContent: 'flex-start',
                      backgroundColor: 'rgb(248 250 250)',
                      borderRadius: '8px',
                      border: 'none', // Explicitly remove border from the Box
                      p: 1.75, width: '90%',
                      '&:hover': { color: '#07b8db' }, // Remove hover effect here
                      '&.Mui-selected': { color: '#07b8db' } // Custom selected tab color
                    }}>
                      <img
                        src={Icons.Appointment}
                        alt="Medical Record Icon"
                        style={{ width: '24px', height: '24px' }} // Adjust size as needed
                      />
                      Appointments
                    </Box>
                  }
                  sx={{
                    justifyContent: 'center', textAlign: 'center', marginLeft: '10px',
                    border: 'none', // Ensure no border is applied to Tab i
                    '&:hover': {
                      backgroundColor: 'transparent', // Ensure no background color on hover for the Tab component itself
                      border: 'none', // Remove any border during hover on the Tab component
                    },
                    '&.Mui-selected': {
                      color: '#07b8db' // Set color for selected tab
                    }
                  }}
                />

                <Tab
                  label={
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2, justifyContent: 'flex-start',
                      backgroundColor: 'rgb(248 250 250)',
                      borderRadius: '8px',
                      border: 'none', // Explicitly remove border from the Box
                      p: 1.75, width: '90%',
                      '&:hover': { color: '#07b8db' }, // Remove hover effect here
                      '&.Mui-selected': { color: '#07b8db' } // Custom selected tab color
                    }}>
                      <img
                        src={Icons.Payment}
                        alt="Medical Record Icon"
                        style={{ width: '24px', height: '24px' }} // Adjust size as needed
                      />
                      Payments
                    </Box>
                  }
                  sx={{
                    justifyContent: 'center', textAlign: 'center', marginLeft: '10px',
                    border: 'none', // Ensure no border is applied to Tab i
                    '&:hover': {
                      backgroundColor: 'transparent', // Ensure no background color on hover for the Tab component itself
                      border: 'none', // Remove any border during hover on the Tab component
                    },
                    '&.Mui-selected': {
                      color: '#07b8db' // Set color for selected tab
                    }
                  }}
                />
                <Tab
                  label={
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      justifyContent: 'flex-start',
                      backgroundColor: 'rgb(248 250 250)',
                      borderRadius: '8px',
                      p: 1.75,
                      width: '90%',
                      '&:hover': { color: '#07b8db' }, // Remove hover effect here
                      '&.Mui-selected': { color: '#07b8db' } // Custom selected tab color
                    }}>
                      <img
                        src={Icons.Image}
                        alt="Medical Record Icon"
                        style={{ width: '24px', height: '24px' }} // Adjust size as needed
                      />
                      Image
                    </Box>
                  }
                  sx={{
                    justifyContent: 'center',
                    textAlign: 'center',
                    marginLeft: '10px',
                    '&:hover': {
                      backgroundColor: 'transparent', // Ensure no background color on hover for the Tab component itself
                    },
                    '&.Mui-selected': {
                      color: '#07b8db' // Set color for selected tab
                    }
                  }}
                />
                <Tab
                  label={
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      justifyContent: 'flex-start',
                      backgroundColor: 'rgb(248 250 250)',
                      borderRadius: '8px',
                      p: 1.75,
                      width: '90%',
                      '&:hover': { color: '#07b8db' }, // Remove hover effect here
                      '&.Mui-selected': { color: '#07b8db' } // Custom selected tab color
                    }}>
                      <img
                        src={Icons.PatientInfo}
                        alt="Medical Record Icon"
                        style={{ width: '24px', height: '24px' }} // Adjust size as needed
                      />
                      Patient Information
                    </Box>
                  }
                  sx={{
                    justifyContent: 'center',
                    textAlign: 'center',
                    marginLeft: '10px',
                    '&:hover': {
                      backgroundColor: 'transparent', // Ensure no background color on hover for the Tab component itself
                    },
                    '&.Mui-selected': {
                      color: '#07b8db' // Set color for selected tab
                    }
                  }}
                />
                <Tab
                  label={
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      justifyContent: 'flex-start',
                      backgroundColor: 'rgb(248 250 250)',
                      borderRadius: '8px',
                      p: 1.75,
                      width: '90%',
                      '&:hover': { color: '#07b8db' }, // Remove hover effect here
                      '&.Mui-selected': { color: '#07b8db' } // Custom selected tab color
                    }}>
                      <img
                        src={Icons.Prescription}
                        alt="Medical Record Icon"
                        style={{ width: '24px', height: '24px' }} // Adjust size as needed
                      />
                      Prescription
                    </Box>
                  }
                  sx={{
                    justifyContent: 'center',
                    textAlign: 'center',
                    marginLeft: '10px',
                    '&:hover': {
                      backgroundColor: 'transparent', // Ensure no background color on hover for the Tab component itself
                    },
                    '&.Mui-selected': {
                      color: '#07b8db' // Set color for selected tab
                    }
                  }}
                />
                <Tab
                  label={
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      justifyContent: 'flex-start',
                      backgroundColor: 'rgb(248 250 250)',
                      borderRadius: '8px',
                      p: 1.75,
                      width: '90%',
                      '&:hover': { color: '#07b8db' }, // Remove hover effect here
                      '&.Mui-selected': { color: '#07b8db' } // Custom selected tab color
                    }}>
                      <img
                        src={Icons.HealthInfo}
                        alt="Medical Record Icon"
                        style={{ width: '24px', height: '24px' }} // Adjust size as needed
                      />
                      Health Information
                    </Box>
                  }
                  sx={{
                    justifyContent: 'center',
                    textAlign: 'center',
                    marginLeft: '10px',
                    '&:hover': {
                      backgroundColor: 'transparent', // Ensure no background color on hover for the Tab component itself
                    },
                    '&.Mui-selected': {
                      color: '#07b8db' // Set color for selected tab
                    }
                  }}
                />
              </Tabs>

            </Paper>
          </motion.div>
        </Grid>

        {/* Right Side: Patient Details and Tab Content */}
        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ p: 3, width: '97%',borderRadius: '12px', height: '100%', marginLeft: '20px' }}>
              {getTabContent()}
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

export default PatientDetail;
