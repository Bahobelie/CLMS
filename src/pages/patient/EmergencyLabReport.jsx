import StyledCard from '../component-overview/StyledCard';
import { Box, CardContent, Typography } from '@mui/material';
import React from 'react';


const EmergencyLabReport=({patient})=>{
  return(
    <StyledCard>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Emergency Lab Report
        </Typography>
        <Box marginTop={2}>
          <Typography variant="body2" color="textSecondary">
           empty
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  )
}
export default EmergencyLabReport;