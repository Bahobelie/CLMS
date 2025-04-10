import { motion } from 'framer-motion';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ActionMenu from '../component-overview/ActionMenu';
import { useState, useEffect } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MedicationLiquidIcon from '@mui/icons-material/MedicationLiquid';
import * as Yup from 'yup';
import {Form,ErrorMessage,Formik,Field} from 'formik';

import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ServiceModal from '../component-overview/ServiceModal';
import FormHelperText from '@mui/material/FormHelperText';
import { date } from 'yup';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// ========================================== Patient List ===================================//

const Patient = () => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false); // Service Modal State;

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    DateOfBirth: '',
    bloodGroup: '',
    BP: '',
    BMI: '',
    districtState: '',
    phoneNumber: '',
    applicationFee: '',
    services: []
  });
  const [selectedService, setSelectedService] = useState(null);

  const [availableServices, setAvailableServices] = useState([
    { name: "LabTest", status: false, paymentStatus: "Unpaid", amount: '' },
    { name: "Injection", status: false, paymentStatus: "Unpaid", amount: '' },
    { name: "Ultrasound", status: false, paymentStatus: "Unpaid", amount: '' },
  ]);

  //feach all Pataint list
  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${apiUrl}/patients`);
      setPatients(response.data || []);

      console.log(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleServiceModalOpen = () => setServiceModalOpen(true);
  const handleServiceModalClose = () =>{
    const resetServices = availableServices.map((service) => ({
      ...service,
      status: false,
      paymentStatus: 'Unpaid',
      amount: 0,
    }));
    setAvailableServices(resetServices);
    setServiceModalOpen(false);
  }
  const handleServiceAdede=()=>{
    setServiceModalOpen(false);
  }

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First Name is required"),
    middleName: Yup.string(),
    lastName: Yup.string().required("Last Name is required"),
    gender: Yup.string().required("Gender is required"),
    dateOfbirth: Yup.number().positive().integer().required("dateOfbirth is required"),
    bloodGroup: Yup.string().required("Blood Group is required"),
    bmiTest: Yup.string().required("BMI Test is required"),
    bloodPressureTest: Yup.string().required("Blood Pressure Test is required"),
    selectDistrict: Yup.string().required("District is required"),
    phoneNumber:Yup.string(),
    BloodPressure:Yup.string(),
    applicationFee: Yup.string().required("Application Fee is required"),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleChangeChekBox = (index) => {
    const updatedServices = [...availableServices];
    updatedServices[index].status = !updatedServices[index].status;
    setAvailableServices(updatedServices);
  };
  const handleSubmit = async () => {
    try {
      console.log(formData)
      await axios.post(`${apiUrl}/patients/register`, formData);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };


  const handleServiceChange = (serviceName, checked, paymentStatus, amount) => {
    setAvailableServices((prevServices) =>
      prevServices.map((service) =>
        service.name === serviceName
          ? {
            ...service,
            status: checked,
            paymentStatus,
            amount: paymentStatus === "Paid" ? Number(amount) || '' : '', // Reset amount if unpaid
          }
          : service
      )
    );
  };

  const data = {
    columns: [
      { field: 'id', headerName: 'ID', width: 90, flex: 1 },
      { field: 'code', headerName: 'Code', width: 90, flex: 1 },

      { field: 'fullName', headerName: 'Full Name', width: 200, flex: 1 },
      { field: 'gender', headerName: 'Gender', width: 120, flex: 1 },
      { field: 'age', headerName: 'Age', type: 'number', width: 110, flex: 1 },
      { field: 'bloodGroup', headerName: 'Blood Group', width: 120, flex: 1 },
      { field: 'country', headerName: 'Country', width: 150, flex: 1 },
      { field: 'district', headerName: 'District', width: 150, flex: 1 },
      { field: 'contactInfo', headerName: 'Contact Info', width: 150, flex: 1 },
      { field: 'admissionDate', headerName: 'Admission Date', width: 180, flex: 2 },
      {
        field: 'applicationFee',
        headerName: 'Application Fee',
        width: 150,
        renderCell: (params) => (
          <span style={{ color: 'green', fontWeight: 'bold' }}>
          {params.value !== 'N/A' ? `₦ ${params.value}` : 'N/A'}
        </span>
        ),
      },,
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params) => <ActionMenu rowId={params.row.id} />,
      },
    ],
    rows: patients.map((patient) => ({
      id: patient.id,
      code:patient.code,
      fullName: `${patient.first_name || 'N/A'} ${patient.middle_name || 'N/A'} ${patient.last_name || 'N/A'}`,
      gender: patient.gender || 'N/A',
      dateOfbirth: patient.date_of_birth || 'N/A',
      bloodGroup: patient.blood_group || 'N/A',
      country: patient.country || 'N/A',
      district: patient.district_state || 'N/A',
      contactInfo: patient.phone_number || 'N/A',
      admissionDate: patient.createdAt || 'N/A',
      applicationFee: patient.application_fee || 'N/A',
    })),
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          height: '85%',
          width: '100%',
          background: '#fff',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          marginTop: '9px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DataGrid
          rows={data.rows}
          columns={data.columns}
          pageSize={5}
          checkboxSelection
          disableRowSelectionOnClick
          initialState={{
          pagination:{
            paginationModel:{
              pageSize:12
            }}

          }}
          slots={{
            toolbar: () => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%',marginBottom:'15px' }}>
                {user?.role.toLowerCase()==="receptionist" &&
                <Button onClick={handleOpen} sx={{backgroundColor: theme.palette.primary[100],
                  marginBottom:'15px',
                  ':hover':{
                    backgroundColor: theme.palette.primary[100],transform: 'scale(1.02)'
                  }}} variant="contained" startIcon={<AddCircleOutlineIcon />}>
                  New Patient
                </Button>}
                <GridToolbar />
              </div>
            ),
          }}
          sx={{
            height: '100%',
            width: '100%',
            margin: '15px',
            '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
              fontWeight: '800',
            },
          }}
        />
      </motion.div>

      {/* Modal for adding a new patient */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          sx={{
            position: 'absolute',
            top: '20%',
            left: '30%',
            transform: 'translate(-50%, -50%)',
            width: 650,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 5,
            borderRadius: '8px',
          }}
        >

             <Typography id="modal-title" textAlign='center' variant="h4">
               Add New Patient
             </Typography>
          <Formik
            initialValues={{
              firstName: "",
              middleName: "",
              lastName: "",
              gender: "",
              age: "",
              bloodGroup: "",
              bmiTest: "",
              bloodPressureTest: "",
              selectDistrict: "",
              applicationFee: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleSubmit(values);
            }}
          >
            {({ handleChange, values,errors,touched }) => (
              <Form>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      label="First Name"
                      name="firstName"
                      onChange={handleChange}
                      value={values.firstName}
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={<ErrorMessage name='firstName' /> }
                        />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Middle Name"
                      name="middleName"
                      onChange={handleChange}
                      value={values.middleName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      label="Last Name"
                      value={values.lastName}
                      name="lastName"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={<ErrorMessage name='lastName' /> }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      name="gender"
                      select
                      SelectProps={{ native: true }}
                      error={touched.gender && Boolean(errors.gender)}
                      helperText={<ErrorMessage sx={{color:'red'}} name="gender" />}
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="PhoneNumber"
                      value={values.phoneNumber}
                      name="phoneNumber"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        fullwidth
                        label="Date of Birth"
                        value={values.date_of_birth}
                        onChange={(value) => setFieldValue('date_of_birth', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            name="date_of_birth"
                            error={Boolean(errors.date_of_birth && touched.date_of_birth)}
                            helperText={<ErrorMessage name="date_of_birth" />}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      name="bloodGroup"
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="" disabled>
                        Select Blood Group
                      </option>
                      <option defaultValue value="Unknown">Unknown</option>
                      <option value="To Test">To Test</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      required
                      fullWidth
                      name="bmiTest"
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="" disabled>
                        BMI Test
                      </option>
                      <option value="No">No</option>
                      <option value="Weight">Weight</option>
                      <option value="Height">Height</option>
                      <option value="Both Height and Weight">Both Height and Weight</option>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="BloodPressure"
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="" disabled>
                        BloodPressure
                      </option>
                      <option value="No">No</option>
                      <option value="Yest">Yes</option>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      required
                      fullWidth
                      name="selectDistrict"
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Afar">Afar</option>
                      <option value="Amhara">Amhara</option>
                      <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                      <option value="Dire Dawa">Dire Dawa</option>
                      <option value="Gambela">Gambela</option>
                      <option value="Harari">Harari</option>
                      <option value="Oromiya">Oromiya</option>
                      <option value="Somali">Somali</option>
                      <option value="SNNPR">SNNPR</option>
                      <option value="Tigray">Tigray</option>
                    </Field>
                  </Grid>
                </Grid>

                {/* Buttons */}
                <Button variant="contained"
                        sx={{ mt: 3,backgroundColor:theme.palette.primary[100],
                          ':hover':{backgroundColor:theme.palette.primary[100]}}}
                        startIcon={<MedicationLiquidIcon />}
                        onClick={handleServiceModalOpen}
                >
                  Add Services
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    backgroundColor: theme.palette.primary[100],
                    ":hover": { backgroundColor: theme.palette.primary[100], transform: "scale(1.02)" },
                  }}
                >
                  Save
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
      {/* Service Management Modal */}
      <ServiceModal
       availableServices={availableServices}
       handleChangeChekBox={handleChangeChekBox}
       handleServiceChange={handleServiceChange}
       handleServiceModalClose={handleServiceModalClose}
       serviceModalOpen={serviceModalOpen}
       handleServiceAdde={handleServiceAdede}
      />
    </>
  );
};

export default Patient;
