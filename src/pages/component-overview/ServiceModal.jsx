import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { Save } from '@mui/icons-material';

const ServiceModal = ({
                        serviceModalOpen,
                        handleServiceModalClose,
                        availableServices,
                        handleChangeChekBox,
                        handleServiceChange,
                        handleServiceAdde,
                      }) => {
  const theme = useTheme();

  return (
    <Modal open={serviceModalOpen} onClose={handleServiceModalClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
          maxWidth: '95vw',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Add Services</Typography>
          <Button sx={{border:`1px solid ${theme.palette.primary[100]}` }} variant='outlined' onClick={handleServiceModalClose} aria-label="close">
            <CloseIcon style={{color:'red'}} />
          </Button>
        </Box>

        <Divider sx={{ mb: 2,borderBottomWidth: '2px',borderColor:theme.palette.primary[100] }} />

        <Grid container spacing={2}>
          {availableServices.map((service, index) => (
            <Grid item xs={12} key={service.name}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={service.status}
                    onChange={() => handleChangeChekBox(index)}
                    sx={{
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                    }}
                  />
                }
                label={
                  <Typography variant="body1" sx={{ fontWeight: '500' }}>
                    {service.name}
                  </Typography>
                }
              />

              {service.status && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2, mt: 1 }}>
                  <FormControl sx={{ minWidth: 120, flex: 1 }}>
                    <InputLabel>Payment</InputLabel>
                    <Select
                      value={service.paymentStatus}
                      onChange={(e) =>
                        handleServiceChange(service.name, true, e.target.value, service.amount)
                      }
                      sx={{ height: 40 }}
                    >
                      <MenuItem value="Unpaid">Unpaid</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                    </Select>
                  </FormControl>

                  {service.paymentStatus === 'Paid' && (
                    <TextField
                      type="number"
                      label="Price"
                      value={service.amount}
                      onChange={(e) =>
                        handleServiceChange(service.name, true, 'Paid', e.target.value)
                      }
                      sx={{ flex: 1, height: 40 }}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                    />
                  )}
                </Box>
              )}
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Save/>}
            sx={{
              backgroundColor: theme.palette.primary[100],
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: '8px',
              ':hover': { backgroundColor: theme.palette.primary[100]}
            }}
            onClick={handleServiceAdde}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ServiceModal;