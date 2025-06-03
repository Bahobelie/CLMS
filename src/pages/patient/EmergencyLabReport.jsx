import StyledCard from '../component-overview/StyledCard';
import { Box, CardContent, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const EmergencyLabReport=({patient})=>{
  const apiUrl=import.meta.env.VITE_APP_API_URL;

  const [emergenyInfo,setEmergencyInf]=useState('');

  useEffect(() => {
    const featch=async ()=>{
      try {
        const responce = await axios.get(`${apiUrl}/patientHistorys/by-condition`, {
          params: {
            patientId: patient.id
          }
        });

        if (responce.data) {
          // Sort the array by createdAt in descending order (newest first)
          const sortedData = Array.isArray(responce.data)
            ? responce.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [responce.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // Take the first (most recent) record
          setEmergencyInf(sortedData[0]);
        }
      }
      catch (error)
      {
        console.log(error)
      }
    }
    featch()
  }, [patient]);
  return(
    <StyledCard>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Emergency Lab Report
        </Typography>
        {/* Info Grid */}
        <Box mt={1}>
          <Grid container spacing={1}>
            {[
              { label: 'Name', value: `${patient.first_name} ${patient.last_name}` },
              { label: 'bloodPressure', value: emergenyInfo.patient_current_info_bp || 'Null' },
              { label: 'pulseRate', value: emergenyInfo.patient_current_info_pr || 'Null' },
              { label: 'respiratoryRate', value: emergenyInfo.patient_current_info_rr || 'Null'},
              { label: 'oxygenSaturation', value: emergenyInfo.patient_current_info_oxygen_saturation|| 'Null' },
              { label: 'temperature', value: emergenyInfo.patient_current_info_temp || 'Null' },
              { label: 'weight', value: emergenyInfo.patient_current_info_weight || 'Null' },
              { label: 'height', value: emergenyInfo.patient_current_info_height || 'Null'},

              { label: 'Created At', value: new Date(emergenyInfo.updatedAt).toLocaleDateString() }
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
      </CardContent>
    </StyledCard>
  )
}
export default EmergencyLabReport;