import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

const ViewLabTestModal = ({ open, onClose, test }) => {
  const statusColors = {
    pending: 'warning',
    complete: 'success',
    canceled: 'error'
  };

  if (!test) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Lab Test Details</Typography>
          <Chip
            label={test.status}
            color={statusColors[test.status] || 'default'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Test Information */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Test Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Code:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{test.code}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Name:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{test.name}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Price:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">${test.price}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Reference:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {test.referencerange || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Patient Information */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Patient ID:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{test.patientid}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Test Date:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Results */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Test Results
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" paragraph>
                {test.result || 'No results available'}
              </Typography>
            </Paper>
          </Grid>

          {/* Remarks */}
          {test.remark && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Remarks
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">{test.remark}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          variant="outlined"
        >
          Print
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewLabTestModal;