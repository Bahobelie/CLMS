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
  Paper,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import PatientHistoryDetails from './PatientHistoryDetails';
import EmergencyLabReport from './EmergencyLabReport';
import PatientLabTest from './PatientLabTest';
import PatientInjection from './PatientInjection';
import UltrasoundResult from './UltrasoundResult';

const PatientHistoryDialog = ({ open, onClose, patient, record }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      fullScreen
      PaperProps={{
        sx: {
          margin: 0,
          borderRadius: 0,
          boxShadow: 'none',
          background: theme.palette.grey[50]
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: `linear-gradient(135deg, ${theme.palette.primary[100]} 60%, ${theme.palette.primary.main} 10%)`,
        color: theme.palette.common.white,
        zIndex: theme.zIndex.appBar,
        py: 2,
        px: 3,
        boxShadow: theme.shadows[2]
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center'
        }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.secondary.main,
              mr: 2,
              width: 40,
              height: 40
            }}
          >
            {patient?.name?.charAt(0) || 'P'}
          </Avatar>
          <Box textAlign="center">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {patient?.name || 'Patient'} History
            </Typography>
            {record?.id && (
              <Chip
                label={`Record #${record.id}`}
                size="small"
                sx={{
                  mt: 0.5,
                  color: theme.palette.common.white,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.common.white,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            },
            position: 'absolute',
            right: 16
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Main Content - Scrollable Area */}
      <Box sx={{
        overflow: 'auto',
        height: 'calc(100% - 64px)',
        p: 3
      }}>
        <Container maxWidth="xl" disableGutters>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={5} lg={4}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                width: '100%'
              }}>
                <Paper elevation={3} sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: `4px solid ${theme.palette.primary.main}`
                }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: theme.palette.primary.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <span>📋</span> Patient Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <PatientHistoryDetails patient={patient} historyId={record.id} />
                </Paper>

                <Paper elevation={3} sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: `4px solid ${theme.palette.secondary.main}`
                }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: theme.palette.secondary.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <span>🧪</span> Lab Reports
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <EmergencyLabReport patient={patient} />
                </Paper>


              </Box>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={7} lg={8}>
              <Box sx={{
                height: '59%',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                width:'72rem'
              }}>
                <Paper elevation={3} sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: `4px solid ${theme.palette.warning.main}`
                }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: theme.palette.warning.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <span>🔬</span> Lab Tests
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <PatientLabTest patient={patient} record={record} />
                </Paper>

                <Paper elevation={3} sx={{
                  p: 3,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: `4px solid ${theme.palette.error.main}`
                }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: theme.palette.error.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <span>💉</span> Injections
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <PatientInjection patient={patient} record={record} />
                </Paper>

                <Paper elevation={3} sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: `4px solid ${theme.palette.info.main}`
                }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: theme.palette.info.dark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <span>📷</span> Ultrasound Results
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <UltrasoundResult patient={patient} record={record} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        position: 'sticky',
        bottom: 0,
        background: `linear-gradient(to bottom, transparent 0%, ${theme.palette.background.paper} 30%)`,
        borderTop: `1px solid ${theme.palette.divider}`,
        p: 2,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
        backdropFilter: 'blur(8px)'
      }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default PatientHistoryDialog;