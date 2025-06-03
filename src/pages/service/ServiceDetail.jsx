import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Work as WorkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const ServiceDetail = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const navigate = useNavigate();
  const { code } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading,setIsLoading]=useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchService = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/systemConstants/by-condition`, {
        params: { code }
      });
      const found = data?.[0];
      setService(found);
      setIsLoading(false);
      if (found) {
        setFormData({
          code: found.code || '',
          name: found.name || '',
          type: found.type || '',
          description: found.description || '',
          amount: found.amount || 0,
          remark: found.remark || '',
          status: found.status !== undefined ? String(found.status).toLowerCase() === 'true' : false
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [code]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    console.log("Sending status:", formData.status, typeof formData.status);
    const payload = {
      ...formData,
      status: Boolean(formData.status)
    };
    try {
      await axios.put(`${apiUrl}/systemConstants/${service.id}`, payload);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Service updated successfully',
        severity: 'success'
      });
      fetchService();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update service',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/systemConstants/${service.id}`);
      setSnackbar({
        open: true,
        message: 'Service deleted successfully',
        severity: 'success'
      });
      navigate('/services');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete service',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !service) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="error" gutterBottom>
          {error?.response || 'Service not found'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{ borderRadius: '12px' }}
          >
            Back
          </Button>

          {!editMode ? (
            <Box>
              <IconButton
                onClick={() => setEditMode(true)}
                color="primary"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => setDeleteConfirmOpen(true)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
              >
                Save
              </Button>
              <Button
                startIcon={<CloseIcon />}
                onClick={() => setEditMode(false)}
                variant="outlined"
                color="secondary"
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <WorkIcon color="primary" fontSize="large" />
            {editMode ? (
              <TextField
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                label="Service Name"
              />
            ) : (
              <Typography variant="h4" fontWeight="bold">
                {service.name}
                <Typography component="span" variant="h5" color="text.secondary" ml={2}>
                  (Code: {service.code})
                </Typography>
              </Typography>
            )}
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {editMode ? (
                <TextField
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  label="Code"
                  fullWidth
                  disabled
                />
              ) : (
                <DetailField label="Code" value={service.code} />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {editMode ? (
                <TextField
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                  fullWidth
                />
              ) : (
                <DetailField label="Type" value={service.type} />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {editMode ? (
                <TextField
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  label="Amount"
                  type="number"
                  fullWidth
                />
              ) : (
                <DetailField
                  label="Amount"
                  value={service.amount ? `$${service.amount.toLocaleString()}` : 'N/A'}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {editMode ? (
                <FormControlLabel
                  control={
                    <Switch
                      name="status"
                      checked={!!formData.status}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              ) : (
                <DetailField
                  label="Status"
                  value={
                    <Chip
                      label={service.status===true ? 'Active' : 'Inactive'}
                      color={service.status===true ? 'success' : 'error'}
                      variant="outlined"
                    />
                  }
                />
              )}
            </Grid>
            <Grid item xs={12}>
              {editMode ? (
                <TextField
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              ) : (
                <DetailField
                  label="Description"
                  value={service.description || '—'}
                  multiline
                />
              )}
            </Grid>
            <Grid item xs={12}>
              {editMode ? (
                <TextField
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  label="Remark"
                  fullWidth
                  multiline
                  rows={2}
                />
              ) : (
                <DetailField
                  label="Remark"
                  value={service.remark || '—'}
                  multiline
                />
              )}
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{service.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const DetailField = ({ label, value, multiline = false }) => (
  <Box mb={3}>
    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    {typeof value === 'string' || typeof value === 'number' ? (
      <Typography
        variant="body1"
        sx={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-line'
        }}
      >
        {value}
      </Typography>
    ) : (
      value
    )}
  </Box>
);

export default ServiceDetail;