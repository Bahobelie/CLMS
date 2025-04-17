import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import React from 'react';
import StyledCard from '../component-overview/StyledCard';


const PatientHistoryDetails=({patient})=>{
  return (
    <>
      <StyledCard>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Patient Details
          </Typography>

          {/* Patient Info Section */}
          <Box marginTop={2}>
            <Typography variant="body2" color="textSecondary">
              Patient ID:{patient.code}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Contact Info: {patient.phone_number}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Full Name: {patient.first_name} {patient.last_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Age: {patient.age}
            </Typography>

            <Typography variant="body2" color="textSecondary">
              Gender: {patient.gender}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Blood Type: {patient.blood_group}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Created At: {patient.createdAt}
            </Typography>
          </Box>

          <Divider sx={{mt:2}} />

          {/* Application Fee Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
            <Typography variant="body1" color="textSecondary">
              Application Fee:
            </Typography>
            <Typography variant="body1" color="error">
              {patient.application_fee}
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    </>
  )
}
export default PatientHistoryDetails;