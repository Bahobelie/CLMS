import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import generateNextId from '../../../server/services/generateNextId';

const EditLabTestModal = ({ open, onClose, test, onSave, apiUrl,patient}) => {
  const theme=useTheme();

  const code= generateNextId('LabTest', 'LT-');

  const [formData, setFormData] = useState({
    patientid:patient.id,
    code: '',
    name: '',
    description: '',
    price: 0,
    status: 'pending',
    result: '',
    referencerange: '',
    remark: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testOptions, setTestOptions] = useState([]);

  useEffect(() => {
    if (test) {
      setFormData({
        patientid:patient.id,
        code: code.data.code || '',
        name: test.name || '',
        description: test.description || '',
        price: test.price || 0,
        status: 'pending',
        result: test.result || '',
        referencerange: test.referencerange || '',
        remark: test.remark || ''
      });
    }

    // Fetch available test templates
    const fetchTestTemplates = async () => {
      try {
        const response = await axios.get(`${apiUrl}/systemconstants/by-condition`,{
          params:{
            type:'LabTest'
          }
        });
        setTestOptions(response.data);
      } catch (err) {
        console.error('Error fetching test templates:', err);
      }
    };
    fetchTestTemplates();
  }, [test, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestTemplateChange = (e) => {
    const selectedTemplate = testOptions.find(t => t.id === e.target.value);
    if (selectedTemplate) {
      setFormData({
        ...formData,
        code: code.data.code,
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        price: selectedTemplate.price,
        referencerange: selectedTemplate.referencerange
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('formData',formData);

      if (test && test.id) {
        // Update existing test
        await axios.put(`${apiUrl}/labTests/${test.id}`, formData);
      } else {
        // Create new test
        await axios.post(`${apiUrl}/labTests`, formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving lab test:', err);
      setError(err.response?.data?.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{color:theme.palette.primary[100],textAlign: 'center'}}>
        {test ? 'Edit Lab Test' : 'Add New Lab Test'}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Test Template Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Test Template</InputLabel>
              <Select
                label="Test Template"
                onChange={handleTestTemplateChange}
                disabled={!!test}
              >
                {testOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name} ({option.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Basic Info */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Test Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Test Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          {/* Pricing */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              required
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="complete">Complete</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reference Range */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Reference Range"
              name="referencerange"
              value={formData.referencerange}
              onChange={handleChange}
            />
          </Grid>

          {/* Results */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Test Result"
              name="result"
              value={formData.result}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          {/* Remarks */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLabTestModal;