import React from 'react';
import {
  Dialog,
  Box,
  DialogTitle,
  Button,
  Grid,
  Typography,
  IconButton,
  Container,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import PatientHistoryDetails from './PatientHistoryDetails';
import EmergencyLabReport from './EmergencyLabReport';
import PatientLabTest from './PatientLabTest';

const PatientHistoryDialog = ({ open, onClose, patient,record }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? '100%' : '90vh',
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.background.paper,
        zIndex: theme.zIndex.appBar,
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 2
      }}>
        <Typography
          variant="h3"
          sx={{
            color: theme.palette.primary[100],
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center'
          }}
        >
          Patient History
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: theme.spacing(2),
            color: theme.palette.grey[500],
            '&:hover': {
              color: theme.palette.error.main
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{
        overflow: 'auto',
        height: 'calc(100% - 64px)',
        p: isMobile ? 1 : 3
      }}>
        <Container maxWidth="xl" disableGutters={isMobile}>
          <Grid container spacing={3}>

            {/* Left Column */}
            <Grid item xs={12} md={5} lg={4}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                height: '100%'
              }}>
                <PatientHistoryDetails patient={patient} />
                <EmergencyLabReport patient={patient} />
              </Box>
            </Grid>

            {/* Right Column - Lab Tests */}
            <Grid item xs={12} md={7} lg={8}>
              <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <PatientLabTest
                  patient={patient}
                  record={record}
                  sx={{
                    flex: 1,
                    minHeight: 0, // Allows the component to shrink
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Dialog>
  );
};

export default PatientHistoryDialog;