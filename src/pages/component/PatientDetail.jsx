import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, CircularProgress, Avatar, Tabs, Tab, Grid, Paper, Button
} from '@mui/material';
import { IoMdArrowRoundBack, IoMdImage, IoMdDocument, IoMdCash } from "react-icons/io";
import { motion } from 'framer-motion';

import defaultAvater from '../../assets/images/users/avatar-1.png';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

const PatientDetail = () => {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`${apiUrl}/patients/patient/${id}`);
        setPatient(response.data.data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, apiUrl]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;

  const getTabContent = () => {
    if (!patient) return null;

    switch (tabIndex) {
      case 0: // Image
        return (
          <CardContent>
            <Typography variant="h6">Patient Image</Typography>
            <Typography>Image content will be displayed here.</Typography>
          </CardContent>
        );
      case 1: // Medical Record
        return (
          <CardContent>
            <Typography variant="h6">Medical Record</Typography>
            <Typography>Medical record details will be displayed here.</Typography>
          </CardContent>
        );
      case 2: // Invoice
        return (
          <CardContent>
            <Typography variant="h6">Invoice</Typography>
            <Typography>Invoice details will be displayed here.</Typography>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '14px', alignItems: "center" }}>
        <Button variant='outlined'
                onClick={() => Navigate('/patients')}
                sx={{
                  p: '10px', borderRadius: '8px', borderStyle: 'dotted',
                  ':hover': {
                    borderRadius: '8px', borderStyle: 'dotted'
                  }
                }}
                startIcon={<IoMdArrowRoundBack />}
        />
        <Typography>{patient.firstName + ' ' + (patient.middleName ? patient.middleName + ' ' : '') + patient.lastName}</Typography>
      </div>
      <Grid container spacing={3} sx={{ margin: '20px 12px' }}>
        {/* Left Side: Avatar + Vertical Tabs */}
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ p: 2, width: '400px',borderRadius:'8px', height: '50rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={defaultAvater}
                sx={{ width: 80, height: 80, mb: 2 }}
              />
              <h4>{patient.firstName}</h4>
              <span>{patient?.email}</span>
              <h6>{patient?.contactInfo}</h6>
              <Divider/>
              <Tabs
                orientation="vertical"
                value={tabIndex}
                onChange={(_, newIndex) => setTabIndex(newIndex)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ width: '100%'}}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IoMdImage />
                      Image
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                />
                <Tab  label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                        <IoMdImage />
                        Medical Record
                      </Box>
                  }
                      sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                />
                <Tab  label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                    <IoMdCash />
                    Invoice
                  </Box>
                }
                      sx={{ justifyContent: 'flex-start' }}
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
            <Card sx={{ p: 3, width: '100%', height: '100%', marginLeft: '20px' }}>
              <CardContent>
                {tabIndex === 0 && (
                  <>
                    <Typography variant="h5" gutterBottom>Patient Details</Typography>
                    <Typography><strong>Full Name:</strong> {patient.fullName}</Typography>
                    <Typography><strong>Gender:</strong> {patient.gender}</Typography>
                    <Typography><strong>Age:</strong> {patient.age}</Typography>
                  </>
                )}
                {tabIndex === 1 && (
                  <>
                    <Typography><strong>Blood Group:</strong> {patient.bloodGroup}</Typography>
                    <Typography><strong>Contact Info:</strong> {patient.contactInfo}</Typography>
                  </>
                )}
                {tabIndex === 2 && (
                  <>
                    <Typography><strong>Admission Date:</strong> {patient.admissionDate}</Typography>
                  </>
                )}
              </CardContent>
              {getTabContent()}
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

export default PatientDetail;