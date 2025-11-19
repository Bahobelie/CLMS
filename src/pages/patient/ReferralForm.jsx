import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  Paper,
  FormControl,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Print as PrintIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const ReferralForm = ({ patient }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    hospital: '',
    chiefComplaint: '',
    ga: '',
    vs: '',
    hx: '',
    findings: '',
    investigation: '',
    asset: '',
    management: '',
    feedback: '',
    referralDate: new Date()
  });

  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch referrals on component mount or when patient changes
  useEffect(() => {
    if (patient?.id) {
      fetchReferrals();
    }
  }, [patient]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/referral/by-condition`, {
        params: {
          patientId: patient.id
        }
      });
      setReferrals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      setSnackbarMessage('Failed to fetch referrals');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hospital) newErrors.hospital = 'Hospital is required';
    // if (!formData.chiefComplaint) newErrors.chiefComplaint = 'Chief complaint is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      let payload = {
        ...formData,
        patientId: patient.id
      };

      if (isEditing) {
        await axios.put(`${apiUrl}/referral/${formData.id}`, payload);
        setSnackbarMessage('Referral updated successfully!');
      } else {
        const code = await axios.get(`${apiUrl}/model/next-code`, {
          params: {
            model: `referral`,
            prefix: 'REF-'
          }
        });
        payload.code = code.data.code;
        await axios.post(`${apiUrl}/referral`, payload);
        setSnackbarMessage('Referral saved successfully!');
      }

      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      fetchReferrals();
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Failed to save referral');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handlePrint = () => {
    const printStyles = `
    @page {
      size: A4;
      margin: 10mm;
    }

    @media print {
      body * {
        visibility: hidden;
      }
      #printable-referral, #printable-referral * {
        visibility: visible;
      }
      #printable-referral {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 270mm; /* Fixed height to fit A4 */
        font-size: 12pt;
        line-height: 1.3;
        color: black;
        padding: 0;
        margin: 0;
        background-color: white;
      }
      
      /* Ensure only one page prints */
      body, html, #printable-referral {
        height: 270mm !important;
        overflow: hidden !important;
      }
      
      /* Hide all pages after the first */
      .page ~ .page {
        display: none !important;
      }
      
      /* Print-specific optimizations */
      .no-print {
        display: none !important;
      }
      .MuiDialog-paper {
        box-shadow: none !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
      }
      .MuiDialogContent-root {
        padding: 0 !important;
        overflow: visible !important;
      }
      .MuiTypography-root {
        margin-bottom: 4px !important;
        font-size: 12pt !important;
      }
      .MuiDivider-root {
        margin: 8px 0 !important;
      }
      .MuiGrid-container {
        page-break-inside: avoid;
        margin-bottom: 4px !important;
      }
      .MuiTextField-root {
        margin-bottom: 4px !important;
      }
      .MuiInputBase-root {
        font-size: 11pt !important;
        padding: 4px 6px !important;
      }
      .MuiInputLabel-root {
        font-size: 10pt !important;
        transform: translate(14px, 8px) scale(1);
      }
      .MuiInputLabel-shrink {
        transform: translate(14px, -9px) scale(0.75);
      }
      textarea {
        min-height: 30px !important;
      }
      .compact-section {
        margin-bottom: 4px !important;
      }
      .compact-field {
        margin-bottom: 4px !important;
      }
      .compact-field .MuiInputBase-root {
        padding: 2px 6px !important;
      }
    }
  `;

    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);

    // Clone the printable content to avoid affecting the original dialog
    const printContent = document.getElementById('printable-referral').cloneNode(true);
    printContent.id = 'printable-referral-clone';
    document.body.appendChild(printContent);

    // Focus on the cloned content before printing
    setTimeout(() => {
      window.print();

      // Clean up after printing
      setTimeout(() => {
        document.head.removeChild(styleElement);
        document.body.removeChild(printContent);
      }, 1000);
    }, 500);
  };


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setFormData({
      code: '',
      hospital: '',
      chiefComplaint: '',
      ga: '',
      vs: '',
      hx: '',
      findings: '',
      investigation: '',
      asset: '',
      management: '',
      feedback: '',
      referralDate: new Date()
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErrors({});
  };

  const handleEditReferral = (referral) => {
    setIsEditing(true);
    setFormData({
      id: referral.id,
      code: referral.code,
      hospital: referral.hospital,
      chiefComplaint: referral.chiefComplaint,
      ga: referral.ga,
      vs: referral.vs,
      hx: referral.hx,
      findings: referral.findings,
      investigation: referral.investigation,
      asset: referral.asset,
      management: referral.management,
      feedback: referral.feedback,
      referralDate: new Date(referral.referralDate)
    });
    setOpenDialog(true);
  };

  const handleDeleteReferral = async (id) => {
    try {
      await axios.delete(`${apiUrl}/referral/${id}`);
      setSnackbarMessage('Referral deleted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      fetchReferrals();
    } catch (error) {
      console.error('Error deleting referral:', error);
      setSnackbarMessage('Failed to delete referral');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleViewReferral = (referral) => {
    setIsEditing(false);
    setFormData({
      id: referral.id,
      code: referral.code,
      hospital: referral.hospital,
      chiefComplaint: referral.chiefComplaint,
      ga: referral.ga,
      vs: referral.vs,
      hx: referral.hx,
      findings: referral.findings,
      investigation: referral.investigation,
      asset: referral.asset,
      management: referral.management,
      feedback: referral.feedback,
      referralDate: new Date(referral.referralDate)
    });
    setOpenDialog(true);
  };

  // Columns for DataGrid
  const columns = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'hospital', headerName: 'Hospital', width: 200 },
    {
      field: 'chiefComplaint',
      headerName: 'Chief Complaint',
      width: 200,
      flex: 3
    },
    {
      field: 'referralDate',
      headerName: 'Date',
      width: 180,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton onClick={() => handleViewReferral(params.row)}>
              <VisibilityIcon color="info" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditReferral(params.row)}>
              <EditIcon color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteReferral(params.row.id)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* DataGrid Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ color: theme.palette.primary[100] }}>Patient Referrals</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: theme.palette.primary[100],
              '&:hover': { backgroundColor: theme.palette.primary[100] }
            }}
            onClick={handleOpenDialog}
          >
            New Referral
          </Button>
        </Box>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={referrals}
            columns={columns}
            loading={loading}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
          />
        </Box>
      </Box>

      {/* Dialog for Add/Edit/View Referral */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} id="printable-referral" sx={{ p: 1 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }} className="compact-section">
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '12pt' ,color:theme.palette.primary[100]}}>
                Medical Referral Form
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Referral Date"
                  value={formData.referralDate}
                  onChange={(newValue) => setFormData({ ...formData, referralDate: newValue })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{ width: '180px' }}
                      className="compact-field"
                    />
                  )}
                  sx={{
                    mb:4
                  }}
                />
              </LocalizationProvider>
            </Box>

            {/* Patient and Hospital Info */}
            <Grid container spacing={1} sx={{ mb: 1 }} className="compact-section">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hospital"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  size="small"
                  className="compact-field"
                  error={!formData.hospital}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Patient"
                  value={`${patient.first_name} ${patient.last_name}`}
                  InputProps={{ readOnly: true }}
                  size="small"
                  className="compact-field"
                />
              </Grid>
              <Grid item xs={3} sm={1.5}>
                <TextField
                  fullWidth
                  label="Age"
                  value={patient.age || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                  className="compact-field"
                />
              </Grid>
              <Grid item xs={3} sm={1.5}>
                <TextField
                  fullWidth
                  label="Sex"
                  value={patient.gender || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                  className="compact-field"
                />
              </Grid>
            </Grid>

            {/* Medical History */}
            <TextField
              fullWidth
              label="hx"
              name="hx"
              value={formData.hx}
              onChange={handleChange}
              multiline
              rows={3}
              size="small"
              sx={{ mb: 1 }}
              className="compact-field"
            />

            {/* Chief Complaint */}
            <TextField
              fullWidth
              label="Chief Complaint"
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              multiline
              rows={3}
              size="small"
              sx={{ mb: 1 }}
              className="compact-field"

            />

            <Divider sx={{ my: 1 }} />

            {/* Physical Examination */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold',mb:2 }}>Physical Examination:</Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="General Appearance"
                  name="ga"
                  multiline
                  rows={2}
                  value={formData.ga}
                  onChange={handleChange}
                  size="small"
                  className="compact-field"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vital Signs"
                  name="vs"
                  multiline
                  rows={2}
                  value={formData.vs}
                  onChange={handleChange}
                  size="small"
                  className="compact-field"
                />
              </Grid>
            </Grid>

            {/* Clinical Findings */}
            <TextField
              fullWidth
              label="Findings"
              name="findings"
              value={formData.findings}
              onChange={handleChange}
              multiline
              rows={2}
              size="small"
              sx={{ mb: 1 }}
              className="compact-field"
            />

            <Divider sx={{ my: 1 }} />

            {/* Investigations */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Investigations:</Typography>
            <TextField
              fullWidth
              name="investigation"
              value={formData.investigation}
              onChange={handleChange}
              multiline
              rows={2}
              size="small"
              sx={{ mb: 1 }}
              className="compact-field"
            />

            {/* Management Section */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Assets"
                  name="asset"
                  value={formData.asset}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  size="small"
                  className="compact-field"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Management"
                  name="management"
                  value={formData.management}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  size="small"
                  className="compact-field"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  size="small"
                  className="compact-field"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions className="no-print">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {(!formData.id || isEditing) && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
            >
              {isEditing ? 'Update' : 'Save'}
            </Button>
          )}
          {formData.id && !isEditing && (
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReferralForm;