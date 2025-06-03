import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, CircularProgress, Avatar, Tabs, Tab, Grid, Paper, Button,
  Chip, IconButton, Tooltip, Badge, Box, Divider, Checkbox, ListItemText
} from '@mui/material';
import { IoMdArrowRoundBack } from "react-icons/io";
import { motion } from 'framer-motion';
import {
  MedicalServices as MedicalServicesIcon,
  CalendarToday as CalendarIcon,
  LocalPharmacy as PharmacyIcon,
  Science as LabIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as GoodIcon,
  Error as ExpiredIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { Form, Formik } from 'formik';
import TextField from '@mui/material/TextField';
import * as Yup from 'yup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


const initialMedicineValues = {
  name: '',
  category: '',
  manufacturer: '',
  batchNumber: '', // changed
  expiry_date: new Date().toISOString().split('T')[0],
  start_date:new Date().toISOString().split('T')[0],
  quantity: 0,
  unitprice: 0, // changed
  remark: ''
};

const formFields = [
  { name: 'name', label: 'Medicine Name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'notes', label: 'Note', type: 'text' },
  { name: 'batchnumber', label: 'Batch Number', type: 'text' }, // changed
  { name: 'start_date', label: 'Start Date', type: 'date',required: false },
  { name: 'quantity', label: 'Quantity', type: 'number' },
  { name: 'unitprice', label: 'Unit Price', type: 'number' }, // changed
  { name: 'remark', label: 'Remark', type: 'text' },
  { name: 'expiry_date', label: 'Expiry Date', type: 'date',required: true },


];

const renderFormField = (field, values, handleChange, touched, errors, setFieldValue) => {
  const isSelect = field.type === 'select';
  const selectedItem = isSelect
    ? datapassed.find((type) => type.name === values[field.name])
    : null;

  const label = `${field.label}${field.required ? ' *' : ''}`;

  switch (field.type) {
    case 'text':
      return (
        <TextField
          fullWidth
          name={field.name}
          label={label}
          value={values[field.name] || ''}
          onChange={handleChange}
          error={touched[field.name] && Boolean(errors[field.name])}
          helperText={touched[field.name] && errors[field.name]}
        />
      );

    case 'select':
      return (
        <FormControl
          fullWidth={field.fullWidth ?? true}
          error={touched[field.name] && Boolean(errors[field.name])}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            name={field.name}
            label={label}
            multiple={field.multiple || false}
            value={field.multiple ? values[field.name] || [] : values[field.name] || ''}
            onChange={(e) => {
              setFieldValue(field.name, e.target.value);
            }}
            renderValue={(selected) => {
              if (field.multiple && Array.isArray(selected)) {
                return selected
                  .map((val) => {
                    const option = field.options.find((opt) => opt.value === val);
                    return option ? option.label : val;
                  })
                  .join(', ');
              } else {
                const option = field.options.find((opt) => opt.value === selected);
                return option ? option.label : selected;
              }
            }}
          >
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {field.multiple && (
                  <Checkbox checked={(values[field.name] || []).includes(option.value)} />
                )}
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
          {touched[field.name] && errors[field.name] && (
            <FormHelperText>{errors[field.name]}</FormHelperText>
          )}
        </FormControl>
      );

    case 'date':
      const currentDate = new Date();
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label={label}
            value={values[field.name] ? new Date(values[field.name]) : currentDate}
            onChange={(date) => setFieldValue(field.name, date)}
            format="MM/dd/yyyy"
            slotProps={{
              textField: {
                fullWidth: true,
                error: field.required && touched[field.name] && Boolean(errors[field.name]),
                helperText: field.required && touched[field.name] && errors[field.name],
              },
            }}
          />
        </LocalizationProvider>
      );

    case 'custom':
      return field.render(values, handleChange, touched, errors, setFieldValue);

    default:
      return null;
  }
};
const MedicineDetails = () => {
  const theme = useTheme();
  const { code } = useParams();
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [refetch, setRefetch] = useState(false);
  const navigate = useNavigate();
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState(initialMedicineValues);

  const tabItems = [
    { key: "information", icon: <MedicalServicesIcon />, label: "Medicine Info" },
    { key: "inventory", icon: <PharmacyIcon />, label: "Inventory" },
    { key: "history", icon: <CalendarIcon />, label: "Usage History" },
    { key: "tests", icon: <LabIcon />, label: "Lab Tests" }
  ];

  const medicineValidationSchema = Yup.object({
    name: Yup.string().required('Medicine name is required'),
    category: Yup.string(),
    batchNumber: Yup.string(), // changed
    expiry_date: Yup.date().required(),
    start_date: Yup.date().nullable(),
    quantity: Yup.number().min(0, 'Quantity must be at least 0'),
    unitprice: Yup.number().min(0, 'Price must be at least 0'), // changed
    remark: Yup.string(),
  });



  const handleOpenEdit = (item) => {
    setFormData({
      ...item,
    });
    setOpenEdit(true);
  };

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/medicines/by-condition`,{
        params:{
          code:code
        }
      });
      setMedicine(response.data[0]);

    } catch (error) {
      console.error('Error fetching medicine details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicine();
  }, [code, apiUrl,refetch]);

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  const handleEditSubmit = async (values) => {
    try {
      const response = await axios.put(`${apiUrl}/medicines/${medicine.id}`, values);
      if (response.status === 200) {
        setOpenEdit(false);
        setRefetch(prev => !prev);
        await Swal.fire({
          title: `Medicine Updated!`,
          text: `Medicine updated successfully.`,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Edit error:', error);
      setOpenEdit(false);
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || `Failed to update Medicine.`,
        icon: 'error',
        timer: 3000,
      });
    }
  };

  const handleClose = () => {
    setOpenEdit(false);
  };
  const getStatusChip = () => {
    if (!medicine) return null;

    const expiryDate = new Date(medicine.expiry_date);
    const now = new Date();
    const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    if (expiryDate < now) {
      return (
        <Chip
          icon={<ExpiredIcon />}
          label="EXPIRED"
          color="error"
          sx={{ ml: 1, fontWeight: 'bold' }}
        />
      );
    } else if (expiryDate <= tenDaysFromNow) {
      return (
        <Chip
          icon={<WarningIcon />}
          label="EXPIRING SOON"
          color="warning"
          sx={{
            ml: 1,
            fontWeight: 'bold',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 }
            }
          }}
        />
      );
    } else {
      return (
        <Chip
          icon={<GoodIcon />}
          label="GOOD"
          color="success"
          sx={{ ml: 1, fontWeight: 'bold' }}
        />
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!medicine) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" color="error">Medicine not found</Typography>
        <Button
          variant="outlined"
          startIcon={<IoMdArrowRoundBack />}
          onClick={() => navigate('/medicines')}
          sx={{ mt: 2 }}
        >
          Back to Medicines List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Back to medicines list">
          <IconButton
            onClick={() => navigate('/medicines')}
            size="large"
            sx={{ mr: 2, backgroundColor: theme.palette.action.hover }}
          >
            <IoMdArrowRoundBack />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h3" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            {medicine.name}
            {getStatusChip()}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {medicine.code} • {medicine.category} • {medicine.notes}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() =>handleOpenEdit(medicine)}
          sx={{ mr: 2 }}
        >
          Edit
        </Button>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchMedicine}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Medicine Card */}
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <Typography variant="h5" align="center">
                  {medicine.name}
                </Typography>
                <Typography color="textSecondary" align="center">
                  {medicine.category}
                </Typography>

                <Box sx={{ display: 'flex', mt: 2, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip
                    label={`Batch: ${medicine.batchnumber}`}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`Expires: ${formatDate(medicine.expiry_date)}`}
                    size="small"
                    color={new Date(medicine.expiry_date) < new Date() ? 'error' : 'default'}
                  />
                </Box>

                <Divider sx={{ width: '100%', my: 2 }} />

                <Typography variant="body2" color="textSecondary" align="center">
                  <strong>Manufacturer:</strong> {medicine.manufacturer || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  <strong>Unit Price:</strong> {formatCurrency(medicine.unitprice)}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  <strong>In Stock:</strong> {medicine.quantity}
                </Typography>
              </Box>

              <Divider sx={{ width: '100%', my: 3 }} />

              <Tabs
                orientation="vertical"
                value={tabIndex}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{
                  '& .MuiTabs-indicator': {
                    left: 0,
                    width: 4,
                    borderRadius: 2
                  }
                }}
              >
                {tabItems.map((tab, index) => (
                  <Tab
                    key={tab.key}
                    label={
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%',
                        px: 2,
                        py: 1
                      }}>
                        {tab.icon}
                        <Typography sx={{ ml: 2 }}>{tab.label}</Typography>
                      </Box>
                    }
                    sx={{
                      alignItems: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 1,
                      my: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                        color: theme.palette.primary.main
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Paper>
          </motion.div>
        </Grid>

        {/* Right Side: Content Area */}
        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: '70vh' }}>
              {tabIndex === 0 && (
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Medicine Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Code</Typography>
                      <Typography variant="body1">{medicine.code}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Name</Typography>
                      <Typography variant="body1">{medicine.name}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Category</Typography>
                      <Typography variant="body1">{medicine.category || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Manufacturer</Typography>
                      <Typography variant="body1">{medicine.notes || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Batch Number</Typography>
                      <Typography variant="body1">{medicine.batchnumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Expiry Date</Typography>
                      <Typography variant="body1">
                        {formatDate(medicine.expiry_date)}
                        {getStatusChip()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Start Date</Typography>
                      <Typography variant="body1">{formatDate(medicine.start_date)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Unit Price</Typography>
                      <Typography variant="body1">{formatCurrency(medicine.unitprice)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="textSecondary">Remarks</Typography>
                      <Typography variant="body1">{medicine.remark || 'No remarks'}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabIndex === 1 && (
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Inventory Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Current Stock</Typography>
                      <Typography variant="h4">{medicine.quantity}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Total Value</Typography>
                      <Typography variant="h4">
                        {formatCurrency(medicine.quantity * medicine.unitprice)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Last Restocked</Typography>
                      <Typography variant="body1">{formatDate(medicine.start_date)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="textSecondary">Days Until Expiry</Typography>
                      <Typography variant="body1">
                        {Math.ceil((new Date(medicine.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabIndex === 2 && (
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Usage History
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography color="textSecondary">Usage history data will be displayed here</Typography>
                </Box>
              )}

              {tabIndex === 3 && (
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Related Lab Tests
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography color="textSecondary">Lab test data will be displayed here</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
      {/* Edit Modal */}
      <Modal open={openEdit} onClose={handleClose} aria-labelledby="edit-modal-title" aria-describedby="edit-modal-description">
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          sx={{
            position: 'absolute',
            top: '10%',
            left: '30%',
            transform: 'translate(-50%, -50%)',
            width: 1050,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 5,
            borderRadius: '8px',
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'grey.500',
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography id="edit-modal-title" sx={{ color: theme.palette.primary[100] }} textAlign="center" variant="h4">
            Edit Medicine
          </Typography>


          <Formik
            initialValues={formData}
            validationSchema={medicineValidationSchema}
            onSubmit={handleEditSubmit}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Code"
                      name="code"
                      value={values.code}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </Grid>

                  {formFields.map((field, index) => (
                    <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={index}>
                      {renderFormField(field, values, handleChange, touched, errors, setFieldValue)}
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    mt: 3,
                    backgroundColor: theme.palette.primary[100],
                    ":hover": {
                      backgroundColor: theme.palette.primary[100],
                      transform: "scale(1.02)"
                    },
                  }}
                  type="submit"
                >
                  {isSubmitting ? 'Updating...' : `Update Medicine`}
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>

    </Box>

  );
};

export default MedicineDetails;