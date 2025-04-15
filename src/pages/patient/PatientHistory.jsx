import React, { useState } from 'react';
import {
  Grid, TextField, Button, Typography, MenuItem, Tabs, Tab,
  Select, InputLabel, FormControl, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik, Form, Field } from 'formik';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const PatientHistory = ({ open, onClose, patient, handelSubmite }) => {
  const theme=useTheme();

  //state management
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const categorizedFields = {
    // patientInfo: [
    //   { label: 'Code', name: 'code', readOnly: true },
    //   { label: 'First Name', name: 'first_name' },
    //   { label: 'Middle Name', name: 'middle_name' },
    //   { label: 'Last Name', name: 'last_name' },
    //   { label: 'Phone Number', name: 'phone_number' },
    //   { label: 'Gender', name: 'gender', type: 'select' },
    //   { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
    //   { label: 'Remark', name: 'remark' }
    //
    // ],
    healthInfo: [
      { label: 'Symptoms', name: 'chief_complaint_symptoms' },
      { label: 'Duration', name: 'chief_complaint_duration' },
      { label: 'Severity', name: 'chief_complaint_severity' },
      { label: 'Medical Conditions', name: 'medical_history_conditions' },
      { label: 'Medications', name: 'medical_history_medications' },
      { label: 'Surgeries', name: 'medical_history_surgeries' },
      { label: 'Hospitalizations', name: 'medical_history_hospitalizations' },
      { label: 'Pain Location', name: 'current_symptoms_pain_location' },
      { label: 'Pain Severity', name: 'current_symptoms_pain_severity' },
      { label: 'Other Symptoms', name: 'current_symptoms_other_symptoms' },
    ],
    lifestyle: [
      { label: 'Allergies', name: 'allergies' },
      { label: 'Chronic Diseases', name: 'family_history_chronic_diseases' },
      { label: 'Genetic Conditions', name: 'family_history_genetic_conditions' },
      { label: 'Smoking', name: 'lifestyle_smoking' },
      { label: 'Alcohol', name: 'lifestyle_alcohol' },
      { label: 'Drugs', name: 'lifestyle_drugs' },
      { label: 'Diet', name: 'lifestyle_diet' },
      { label: 'Exercise', name: 'lifestyle_exercise' },
    ],
    vitalsAndExam: [
      { label: 'BP', name: 'patient_current_info_bp' },
      { label: 'PR', name: 'patient_current_info_pr' },
      { label: 'RR', name: 'patient_current_info_rr' },
      { label: 'Oxygen Saturation', name: 'patient_current_info_oxygen_saturation' },
      { label: 'Temperature', name: 'patient_current_info_temp' },
      { label: 'Weight', name: 'patient_current_info_weight' },
      { label: 'Height', name: 'patient_current_info_height' },
      { label: 'HEENT', name: 'patient_current_info_heent' },
      { label: 'LGS', name: 'patient_current_info_lgs' },
      { label: 'RS', name: 'patient_current_info_rs' },
      { label: 'CVS', name: 'patient_current_info_cvs' },
      { label: 'GIS', name: 'patient_current_info_gis' },
      { label: 'GUS', name: 'patient_current_info_gus' },
      { label: 'IS', name: 'patient_current_info_is' },
      { label: 'MSS', name: 'patient_current_info_mss' },
      { label: 'CNS', name: 'patient_current_info_cns' },
    ],
    other: [
      { label: 'Previous Doctors', name: 'previous_treatments_previous_doctors' },
      { label: 'Medications Taken', name: 'previous_treatments_medications_taken' },
      { label: 'Current Doctor', name: 'current_treatments_current_doctor' },
      { label: 'Current Medications', name: 'current_treatments_current_medications' },
      { label: 'Immunizations Up to Date', name: 'immunizations_up_to_date' },
      { label: 'Recent Vaccines', name: 'immunizations_recent_vaccines' },
      { label: 'Description', name: 'description' },
    ]
  };

  const renderFields = (fields, values, setFieldValue) => (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid item xs={12} sm={6} key={field.name}>
          {field.type === 'select' ? (
            <FormControl fullWidth>
              <InputLabel>{field.label}</InputLabel>
              <Select
                name={field.name}
                value={values[field.name] || ''}
                onChange={(e) => setFieldValue(field.name, e.target.value)}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          ) : field.type === 'date' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label={field.label}
                value={values[field.name]}
                onChange={(val) => setFieldValue(field.name, val)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          ) : (
            <Field
              as={TextField}
              fullWidth
              label={field.label}
              name={field.name}
              InputProps={{ readOnly: field.readOnly || false }}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );

  const initialValues = {
    patientId: patient?.id || '',
    ...Object.values(categorizedFields)
      .flat()
      .reduce((acc, field) => {
        acc[field.name] = '';
        return acc;
      }, {})
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
            PaperProps={{
              sx: {
                height: '45rem'
              },
            }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',textAlign:'center' }}>
        <Typography
          variant="h4"
          sx={{
            color:theme.palette.primary[100],
            width: '100%',
            textAlign: 'center',
            mt:'3px'
          }}
        >
          Patient History Form
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon sx={{color:'red'}} />
        </IconButton>
      </DialogTitle>
      <Divider/>
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          handelSubmite(values);
          onClose(); // Close modal on submit
        }}
      >
        {({ values, setFieldValue, handleReset }) => (
          <Form>
            <DialogContent dividers>
              <Tabs value={tabIndex}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTabs-indicator': {
                        backgroundColor: theme.palette.primary[100],
                      },
                    }}
              >
                <Tab
                  label="Health Info"
                  sx={{
                    color: tabIndex === 0 ? 'blue' : 'text.secondary', // Change the active tab text color
                    '&.Mui-selected': {
                      color: theme.palette.primary[100],
                    },
                  }}
                />
                <Tab
                  label="Lifestyle"
                  sx={{
                    color: tabIndex === 1 ? 'blue' : 'text.secondary', // Change the active tab text color
                    '&.Mui-selected': {
                      color: theme.palette.primary[100],
                    },
                  }}
                />
                <Tab
                  label="Vitals & Exam"
                  sx={{
                    color: tabIndex === 2 ? 'blue' : 'text.secondary', // Change the active tab text color
                    '&.Mui-selected': {
                      color: theme.palette.primary[100],
                    },
                  }}
                />
                <Tab
                  label="Other"
                  sx={{
                    color: tabIndex === 3 ? 'blue' : 'text.secondary', // Change the active tab text color
                    '&.Mui-selected': {
                      color: theme.palette.primary[100],
                    },
                  }}
                />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                {[categorizedFields.healthInfo, categorizedFields.lifestyle, categorizedFields.vitalsAndExam, categorizedFields.other].map(
                  (fields, index) =>
                    tabIndex === index && (
                      <Box key={index}>
                        {renderFields(fields, values, setFieldValue)}

                      </Box>
                    )
                )}
              </Box>

            </DialogContent>

            <DialogActions>
              <Button onClick={handleReset} color="secondary" variant="outlined">
                Reset
              </Button>
              <Button type="submit" sx={{backgroundColor:theme.palette.primary[100],'&:hover': {backgroundColor:theme.palette.primary[100]}
                }} variant="contained">
                Save
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default PatientHistory;
