import { Field, Form, Formik } from 'formik';
import { Button, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import React from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import { useTheme } from '@mui/material/styles';


const PatientHealthInfo=({patient,handelUpdate})=>{
  const theme=useTheme();
  return (
    <Formik
      initialValues={{
        code: patient.code,
        firstName: patient.first_name,
        middleName: patient.middle_name,
        lastName: patient.last_name,
        phoneNumber: patient.phone_number,
        dateOfBirth: patient.date_of_birth,
        Remark: patient.remark,
        gender:patient.gender,
        bmi:patient.bmi,
        bp:patient.bp,
        blood_group:patient.blood_group,
        Application_fee:patient.application_fee
      }}
      onSubmit={(values) => {
        console.log('values',values);
        handelUpdate(values)
      }}
    >
      {({ values, setFieldValue, handleReset }) => (
        <Form>
          <Typography variant='h2' sx={{ textAlign: 'center', marginTop: '-34' }}>{patient.first_name}
            <span style={{color:theme.palette.primary[100],marginLeft:'14px'}}>healthInfo</span>
          </Typography>

          <CardContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>BMI Test </InputLabel>
                  <Select
                    name="bmiTest"
                    label="BMI Test"
                  >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Weight">Weight</MenuItem>
                    <MenuItem value="Height">Height</MenuItem>
                    <MenuItem value="Both Height and Weight">Both Height and Weight</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Blood Pressure</InputLabel>
                  <Select
                    name="bloodPressure"
                    label="Blood Pressure"
                  >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Blood Group *</InputLabel>
                  <Select
                    name="bloodGroup"
                    label="Blood Group *"
                  >
                    <MenuItem value="Unknown">Unknown</MenuItem>
                    <MenuItem value="To Test">To Test</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="hight"
                  name="hight"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  select
                  fullWidth
                  label="Application Fee"
                  name="applicationFee"
                >
                  <MenuItem value="Active" sx={{ color: 'green' }}>Active</MenuItem>
                  <MenuItem value="Expired" sx={{ color: 'red' }}>Expired</MenuItem>
                </Field>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" color="secondary" onClick={handleReset}>
                  Reset
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  Update
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Form>
      )}
    </Formik>
  )
}
export default PatientHealthInfo;