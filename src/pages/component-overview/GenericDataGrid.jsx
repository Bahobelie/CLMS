import { motion } from 'framer-motion';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
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
import ActionMenu from './ActionMenu';

const GenericDataGrid = ({
                           // Configuration props
                           title,
                           apiEndpoint,
                           modelName,
                           prefix,
                           detailPagePath,

                           // Data display props
                           columns,
                           valueGetters = {},
                           customRenderers = {},

                           // Form configuration
                           initialFormValues,
                           validationSchema,
                           formFields,

                           // Search configuration
                           searchFields = ['name', 'code'],

                           // Additional functionality
                           additionalActions = [],
                           customHandlers = {},
                           serviceConfig = null,
                         }) => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemCode, setItemCode] = useState('');
  const [refetch, setRefetch] = useState(false);
  const [formData, setFormData] = useState(initialFormValues);


  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/${apiEndpoint}`);
      setData(response.data || []);
    } catch (error) {
      console.error(`Error fetching ${modelName}:`, error);
    }
  };



  useEffect(() => {
    fetchData();
  }, [refetch]);

  // Handle search filtering
  useEffect(() => {
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

  // Modal handlers
  const handleOpen = async () => {
    try {
      const response = await axios.get(`${apiUrl}/model/next-code`, {
        params: {
          model: `${modelName.toLowerCase()}Schema`,
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

  // Form submission handler
  const handleSubmit = async (values) => {
    try {
      let payload = {
        code: itemCode,
        ...values
      };

      // Call custom submit handler if provided
      if (customHandlers.onSubmit) {
        await customHandlers.onSubmit(payload);
      } else {
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
        }
      }
    } catch (error) {
      setOpen(false);
      console.log(error);
      await Swal.fire({
        title: 'Error!',
        text: error?.message || 'Failed to create record.',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  // Render form field based on type
  const renderFormField = (field, values, handleChange, touched, errors, setFieldValue) => {
    const commonProps = {
      fullWidth: true,
      name: field.name,
      label: `${field.label}${field.required ? ' *' : ''}`,
      value: values[field.name],
      onChange: handleChange,
      error: touched[field.name] && Boolean(errors[field.name]),
      helperText: touched[field.name] && errors[field.name],
    };

    switch (field.type) {
      case 'text':
        return <Field as={TextField} {...commonProps} />;

      case 'select':
        return (
          <FormControl fullWidth error={touched[field.name] && Boolean(errors[field.name])}>
            <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
            <Select
              name={field.name}
              value={values[field.name] || ''}
              onChange={handleChange}
              label={`${field.label}${field.required ? ' *' : ''}`}
             >
              {field.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {touched[field.name] && errors[field.name] && (
              <FormHelperText>{errors[field.name]}</FormHelperText>
            )}
          </FormControl>
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label={`${field.label}${field.required ? ' *' : ''}`}
              value={values[field.name]}
              onChange={(date) => setFieldValue(field.name, date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: touched[field.name] && Boolean(errors[field.name]),
                  helperText: touched[field.name] && errors[field.name],
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

  // Prepare rows for DataGrid with value getters and custom renderers
  const preparedRows = filteredData.map(item => {
    const row = { id: item.code || item.id, ...item };

    // Apply value getters
    Object.entries(valueGetters).forEach(([field, getter]) => {
      row[field] = getter(item);
    });

    return row;
  });

  // Prepare columns for DataGrid with custom renderers
  const preparedColumns = columns.map(column => {
    if (customRenderers[column.field]) {

      return {
        ...column,
        renderCell: (params) => customRenderers[column.field](params)
      };
    }
    return column;
  }).concat([
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <ActionMenu
          rowId={params.row.code || params.row.id}
          onRefetch={() => setRefetch(prev => !prev)}
          additionalActions={additionalActions}
          customHandlers={customHandlers}
        />
      ),
    }
  ]);

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
          rows={preparedRows}
          columns={preparedColumns}
          checkboxSelection
          getRowId={(row) => row.code || row.id}
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
            navigate(`${detailPagePath}/${params.row.code || params.row.id}`);
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