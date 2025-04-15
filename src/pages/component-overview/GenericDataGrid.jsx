import { motion } from 'framer-motion';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ActionMenu from './ActionMenu';
import { useState, useEffect } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import * as Yup from 'yup';
import { Form, Formik, Field } from 'formik';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Swal from 'sweetalert2';

const GenericDataGrid = ({
                           title,
                           apiEndpoint,
                           modelName,
                           prefix,
                           columns,
                           initialFormValues,
                           validationSchema,
                           formFields,
                           detailPagePath,
                           searchFields = ['name', 'code'],
                           additionalActions = [],
                         }) => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemCode, setItemCode] = useState('');
  const [refetch, setRefetch] = useState(false);
  const [formData, setFormData] = useState(initialFormValues);

  // Fetch all items
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/${apiEndpoint}`);
      setData(response.data || []);
    } catch (error) {
      console.error(`Error fetching ${modelName}:`, error);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchData();
  }, [refetch]);

  useEffect(() => {
    // Filter based on search term
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search') || '';

    if (searchTerm) {
      const filtered = data.filter((item) => {
        return searchFields.some(field => {
          const fieldValue = item[field] ? item[field].toString().toLowerCase() : '';
          return fieldValue.includes(searchTerm.toLowerCase());
        });
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [location.search, data]);

  const handleOpen = async () => {
    try {
      const response = await axios.get(`${apiUrl}/model/next-code`, {
        params: {
          model: `${modelName}Schema`,
          prefix: prefix
        }
      });
      setItemCode(response.data.code);
      setOpen(true);
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormValues);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        code: itemCode,
        ...values
      };

      const response = await axios.post(`${apiUrl}/${apiEndpoint}`, payload);

      if (response.status === 201) {
        setOpen(false);
        setRefetch(prev => !prev);
        await Swal.fire({
          title: `${modelName} Created!`,
          text: 'Record created successfully.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to create record.',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      setOpen(false);
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to create record.',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <Field
            as={TextField}
            fullWidth
            label={field.label}
            name={field.name}
            required={field.required}
            error={field.touched && Boolean(field.errors)}
            helperText={field.touched && field.errors}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth error={field.touched && Boolean(field.errors)}>
            <InputLabel>{field.label}{field.required && ' *'}</InputLabel>
            <Select
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              label={`${field.label}${field.required ? ' *' : ''}`}
            >
              {field.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {field.touched && field.errors && (
              <FormHelperText>{field.errors}</FormHelperText>
            )}
          </FormControl>
        );
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label={`${field.label}${field.required ? ' *' : ''}`}
              value={field.value}
              onChange={(date) => field.onChange({ target: { name: field.name, value: date } })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: field.touched && Boolean(field.errors),
                  helperText: field.touched && field.errors,
                },
              }}
            />
          </LocalizationProvider>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Typography variant='h2'>{title}</Typography>
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
          rows={filteredData}
          columns={[
            ...columns,
            {
              field: 'actions',
              headerName: 'Actions',
              width: 150,
              renderCell: (params) => (
                <ActionMenu
                  rowId={params.row.code}
                  onRefetch={() => setRefetch(prev => !prev)}
                  additionalActions={additionalActions}
                />
              ),
            }
          ]}
          checkboxSelection
          getRowId={(row) => row.code}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 15,
                page: 0,
              }
            }
          }}
          onRowDoubleClick={(params) => {
            navigate(`${detailPagePath}/${params.row.code}`);
          }}
          pageSizeOptions={[15, 24, 50, 100]}
          slots={{
            toolbar: () => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px' }}>
                {(user?.role.toLowerCase() === "receptionist" || user?.role.toLowerCase() === 'doctor') && (
                  <Button
                    onClick={handleOpen}
                    sx={{
                      backgroundColor: theme.palette.primary[100],
                      marginBottom: '15px',
                      ':hover': {
                        backgroundColor: theme.palette.primary[100],
                        transform: 'scale(1.02)'
                      }
                    }}
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    New {modelName}
                  </Button>
                )}
                <GridToolbar />
              </div>
            ),
          }}
          sx={{
            height: 'auto',
            width: 'auto',
            margin: '15px',
            '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
              fontWeight: '500',
            },
          }}
        />
      </motion.div>

      {/* Modal for adding new item */}
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
            width: 850,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 5,
            borderRadius: '8px',
          }}
        >
          <Typography id="modal-title" textAlign='center' variant="h4">
            Add New {modelName}
          </Typography>
          <Formik
            initialValues={formData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Code"
                      name="code"
                      value={itemCode}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </Grid>

                  {formFields.map((fieldConfig, index) => (
                    <Grid item xs={12} sm={fieldConfig.fullWidth ? 12 : 6} key={index}>
                      {renderFormField({
                        ...fieldConfig,
                        value: values[fieldConfig.name],
                        onChange: handleChange,
                        touched: touched[fieldConfig.name],
                        errors: errors[fieldConfig.name]
                      })}
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
                  {isSubmitting ? 'Saving...' : `Save ${modelName}`}
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
};

export default GenericDataGrid;