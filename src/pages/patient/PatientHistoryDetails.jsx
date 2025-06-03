import {
  Box,
  CardContent,
  Divider,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useEffect, useState } from 'react';
import StyledCard from '../component-overview/StyledCard';
import axios from 'axios';

const apiUrl=import.meta.env.VITE_APP_API_URL

const PatientHistoryDetails = ({ patient,historyId }) => {
  const [history,setHistory]=useState([]);

  // Assuming patient.history contains the API response data
  useEffect(() => {
    const featchHistory=async ()=>{
      try {
        const patientHistory = await axios.get(`${apiUrl}/patientHistorys/by-condition`, {
          params: {
            patientId: patient.id,
            id:historyId
          }
        });

        if (patientHistory.data) {
          // Sort the array by createdAt in descending order (newest first)
          const sortedData = Array.isArray(patientHistory.data)
            ? patientHistory.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [patientHistory.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // Take the first (most recent) record
          setHistory(sortedData[0]);
        }
      }
      catch (error)
      {
        console.log(error)
      }
    }
    featchHistory()
  }, [patient]);

  // Helper function to display value or "Not specified"
  const displayValue = (value) => value !== null ? value : 'Not specified';

  // Helper function for boolean values
  const displayBoolean = (value) => {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return 'Not specified';
  };

  return (
    <StyledCard>
      <CardContent>
        {/* Basic Patient Info */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            textAlign: 'center',
            fontFamily: 'Roboto, sans-serif',
            color: '#2c3e50',
          }}
        >
          Patient Details
        </Typography>

        <Box mt={1}>
          <Grid container spacing={1}>
            {[
              { label: 'Name', value: `${patient.first_name} ${patient.last_name}` },
              { label: 'Phone', value: patient.phone_number },
              { label: 'Age', value: patient.age },
              { label: 'Blood Type', value: patient.blood_group },
              { label: 'Created At', value: new Date(patient.createdAt).toLocaleDateString() }
            ].map((item, index) => (
              <Grid key={index} item xs={12} sm={6} md={4}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.75rem',
                    color: '#34495e',
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  <strong>{item.label}:</strong> {item.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Medical History Sections */}
        <Box sx={{ mt: 2 }}>
          {/* Chief Complaint */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Chief Complaint</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                <DetailItem label="Symptoms" value={history.chief_complaint_symptoms} />
                <DetailItem label="Duration" value={history.chief_complaint_duration ? `${history.chief_complaint_duration} days` : null} />
                <DetailItem label="Severity" value={history.chief_complaint_severity} />
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Medical History */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Medical History</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                <DetailItem label="Conditions" value={history.medical_history_conditions} />
                <DetailItem label="Medications" value={history.medical_history_medications} />
                <DetailItem label="Surgeries" value={history.medical_history_surgeries} />
                <DetailItem label="Hospitalizations" value={history.medical_history_hospitalizations} />
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Lifestyle */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Lifestyle</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                <DetailItem label="Smoking" value={displayBoolean(history.lifestyle_smoking)} />
                <DetailItem label="Alcohol" value={displayBoolean(history.lifestyle_alcohol)} />
                <DetailItem label="Drugs" value={displayBoolean(history.lifestyle_drugs)} />
                <DetailItem label="Diet" value={history.lifestyle_diet} />
                <DetailItem label="Exercise" value={history.lifestyle_exercise} />
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Vital Signs */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Vital Signs</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                <DetailItem label="Blood Pressure" value={history.patient_current_info_bp} />
                <DetailItem label="Pulse Rate" value={history.patient_current_info_pr} />
                <DetailItem label="Respiratory Rate" value={history.patient_current_info_rr} />
                <DetailItem label="Oxygen Saturation" value={history.patient_current_info_oxygen_saturation} />
                <DetailItem label="Temperature" value={history.patient_current_info_temp} />
                <DetailItem label="Weight" value={history.patient_current_info_weight} />
                <DetailItem label="Height" value={history.patient_current_info_height} />
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Application Fee */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8rem',
              fontFamily: 'Roboto, sans-serif',
              color: '#555',
            }}
          >
            Application Fee:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'Roboto, sans-serif',
              color: '#e74c3c',
            }}
          >
            ${patient.application_fee}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

// Helper component for consistent detail item rendering
const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
      <strong>{label}:</strong> {value || 'Not specified'}
    </Typography>
  </Grid>
);

export default PatientHistoryDetails;