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

const EditLabTestModal = ({ open, onClose, test, onSave, apiUrl, patient,record }) => {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [formData, setFormData] = useState({
    patientid: patient.id,
    patienthistoryid:record.id,
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

  // Reset form when opening/closing or when test changes
  useEffect(() => {
    if (!open) return; // Don't reset if dialog is closed

    const resetForm = async () => {
      try {
        const [templatesResponse, codeResponse] = await Promise.all([
          axios.get(`${apiUrl}/systemconstants/by-condition`, {
            params: { type: 'LabTest' }
          }),
          axios.get(`${apiUrl}/model/next-code`, {
            params: { model: `LabTest`, prefix: 'LT-' }
          })
        ]);

        setTestOptions(templatesResponse.data);
        setCode(codeResponse.data.code);

        if (test) {
          // Edit mode - use existing test data
          setFormData({
            patientid: patient.id,
            code: test.code || codeResponse.data.code,
            isactive:true,
            patienthistoryid:record.id,
            name: test.name || '',
            description: test.description || '',
            price: test.price || 0,
            status: test.status || 'pending',
            result: test.result || '',
            referencerange: test.referencerange || '',
            remark: test.remark || ''
          });
        } else {
          // Add mode - reset to default values with new code
          setFormData({
            patientid: patient.id,
            code: codeResponse.data.code,
            patienthistoryid:record.id,
            isactive:true,
            name: '',
            description: '',
            price: 0,
            status: 'pending',
            result: '',
            referencerange: '',
            remark: ''
          });
        }
      } catch (err) {
        console.error('Error initializing form:', err);
        setError('Failed to initialize form data');
      }
    };

    resetForm();
  }, [open, test, apiUrl, patient.id]);

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
      setFormData(prev => ({
        ...prev,
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        price: selectedTemplate.amount,
        referencerange: selectedTemplate.referencerange
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    console.log('formdata',test);

    try {
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
      <DialogTitle sx={{ color: theme.palette.primary[100], textAlign: 'center' }}>
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
                value=""
              >
                <MenuItem value="">
                  <em>Select a template</em>
                </MenuItem>
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
              disabled={!!test} // Disable code editing in edit mode
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