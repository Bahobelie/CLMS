import { Box, CardContent, Divider, Typography, Grid } from '@mui/material';
import React from 'react';
import StyledCard from '../component-overview/StyledCard';

const PatientHistoryDetails = ({ patient }) => {
  return (
    <StyledCard>
      <CardContent>
        {/* Title */}
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

        {/* Info Grid */}
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

export default PatientHistoryDetails;
