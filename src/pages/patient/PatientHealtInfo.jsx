import React, { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import {
  Button,
  CardContent,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ExpandMore, ExpandLess, Add } from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';

const PatientHealthInfo = ({ patient }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const [initialValues, setInitialValues] = useState({
    code: '',
    bp: '',
    pr: '',
    rr: '',
    oxygen_saturation: 0,
    temperature: 0,
    weight: 0,
    height: 0
  });

  // Fetch all health records
  useEffect(() => {
    const fetchHealthInfo = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/patientHistorys/by-condition?patientId=${patient.id}`);

        if (res.data) {
          const sortedData = Array.isArray(res.data)
            ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setRecords(sortedData);
          if (sortedData.length > 0) {
            setSelectedRecord(sortedData[0].id);
            setInitialValues({
              ...sortedData[0],
              oxygen_saturation: sortedData[0].patient_current_info_oxygen_saturation || 0,
              temperature: sortedData[0].patient_current_info_temp || 0,
              weight: sortedData[0].patient_current_info_weight || 0,
              height: sortedData[0].patient_current_info_height || 0
            });
          }
        }
      } catch (err) {
        console.log("Error fetching health info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthInfo();
  }, [patient.id]);

  const handleRecordSelect = (record) => {
    setSelectedRecord(record.id);
    setInitialValues({
      ...record,
      patient_current_info_oxygen_saturation: record.patient_current_info_oxygen_saturation || 0,
      patient_current_info_temp: record.patient_current_info_temp || 0,
      patient_current_info_weight: record.patient_current_info_weight || 0,
      patient_current_info_height: record.patient_current_info_height || 0
    });
    setIsFormDirty(false);
  };

  const handleCreateNew = () => {
    setSelectedRecord(null);
    setInitialValues({
      code: '',
      patient_current_info_bp: '',
      patient_current_info_pr: '',
      patient_current_info_rr: '',
      patient_current_info_oxygen_saturation: 0,
      patient_current_info_temp: 0,
      patient_current_info_weight: 0,
      patient_current_info_height: 0
    });
    setIsFormDirty(true);
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setSubmitting(true);


      // Get next code for new records
      let code = values.code;
      if (!selectedRecord) {
        const codeRes = await axios.get(`${apiUrl}/model/next-code`, {
          params: {
            model: "patientHistory",
            prefix: 'PH-'
          }
        });
        code = codeRes.data.code;
      }

      const payload = {
        ...values,
         code,
        patientId: patient.id
      };

      // Confirm action
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: selectedRecord
          ? 'You are about to update this health record'
          : 'You are about to create a new health record',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: theme.palette.primary.main,
        cancelButtonColor: theme.palette.error.main,
        confirmButtonText: selectedRecord ? 'Update' : 'Create',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      let response;
      if (selectedRecord) {

        // Update existing record
        response = await axios.put(`${apiUrl}/patientHistorys/${selectedRecord}`, payload);
      } else {
        // Create new record
        response = await axios.post(`${apiUrl}/patientHistorys`, payload);
      }

      // Refresh records
      const refreshRes = await axios.get(`${apiUrl}/patientHistorys/by-condition?patientId=${patient.id}`);
      const sortedData = refreshRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecords(sortedData);

      // Set the newly created/updated record as selected
      const newRecord = selectedRecord
        ? sortedData.find(r => r.id === selectedRecord)
        : sortedData[0];

      setSelectedRecord(newRecord.id);
      setInitialValues(newRecord);
      setIsFormDirty(false);

      await Swal.fire({
        title: 'Success!',
        text: selectedRecord
          ? 'Health record updated successfully'
          : 'New health record created successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving data:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to save health information',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Records List Section */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}>
          <Typography variant="h6">Health Records</Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={() => setShowAllRecords(!showAllRecords)}
              endIcon={showAllRecords ? <ExpandLess /> : <ExpandMore />}
              size="small"
            >
              {showAllRecords ? 'Hide' : 'Show All'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{ ml: 2 }}
              size="small"
            >
              New Record
            </Button>
          </Box>
        </Box>

        <Collapse in={showAllRecords || records.length <= 1}>
          <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
            {records.map((record) => (
              <ListItem
                key={record.id}
                button
                selected={selectedRecord === record.id}
                onClick={() => handleRecordSelect(record)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
              >
                <ListItemText
                  primary={`Record #${record.code}`}
                  secondary={`${new Date(record.createdAt).toLocaleString()} • BP: ${record.patient_current_info_bp}`}
                />
              </ListItem>
            ))}
            {records.length === 0 && (
              <ListItem>
                <ListItemText primary="No health records found" />
              </ListItem>
            )}
          </List>
        </Collapse>
      </Paper>

      {/* Form Section */}
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ handleReset, isSubmitting, values, handleChange }) => (
          <Form onChange={() => setIsFormDirty(true)}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  color: theme.palette.primary[100],
                  fontWeight: 600
                }}
              >
                {selectedRecord ? `Edit Health Record #${initialValues.code}` : 'Create New Health Record'}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <CardContent>
                <Grid container spacing={3}>
                  {[
                    { field: 'patient_current_info_bp', label: 'Blood Pressure (mmHg)', required: false },
                    { field: 'patient_current_info_pr', label: 'Pulse Rate (bpm)', required: false },
                    { field: 'patient_current_info_rr', label: 'Respiratory Rate (breaths/min)', required: false },
                    { field: 'patient_current_info_oxygen_saturation', label: 'Oxygen Saturation (%)', required: false },
                    { field: 'patient_current_info_temp', label: 'Temperature (°C)', required: false },
                    { field: 'patient_current_info_weight', label: 'Weight (kg)', required: false },
                    { field: 'patient_current_info_height', label: 'Height (cm)', required: false }
                  ].map(({ field, label, required }) => (
                    <Grid item xs={12} sm={6} md={4} key={field}>
                      <Field
                        as={TextField}
                        fullWidth
                        label={label}
                        name={field}
                        variant="outlined"
                        size="small"
                        required={required}
                        value={values[field] || ''}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12} sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 2
                  }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        handleReset();
                        setIsFormDirty(false);
                      }}
                      disabled={submitting || !isFormDirty}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={submitting || (!isFormDirty && selectedRecord)}
                      startIcon={submitting ? <CircularProgress size={20} /> : null}
                    >
                      {selectedRecord ? 'Update' : 'Save'} Record
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PatientHealthInfo;