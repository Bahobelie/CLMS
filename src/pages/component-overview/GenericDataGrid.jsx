import { motion } from 'framer-motion';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
import { Checkbox, IconButton, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';

const GenericDataGrid = ({
                           // Configuration props
                           title,
                           apiEndpoint,
                           modelName,
                           subModelName,
                           prefix,
                           detailPagePath,
                           pathe,
                           // Data display props
                           columns,
                           valueGetters = {},
                           customRenderers = {},
                           datapassed = [],
                           // Form configuration
                           initialFormValues,
                           validationSchema,
                           formFields,

                           // Search configuration
                           searchFields = ['first_name', 'last_name', 'code', 'age'],

                           // Additional functionality
                           additionalActions = [],
                           customHandlers = {},
                           serviceConfig = null,
                           params = {},

                           // Reception type handling
                           employeeType = null, // 'doctor', 'receptionist', etc.
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
  const [isLoading, setIsLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [canCreate, setCanCreate] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelFileError, setExcelFileError] = useState(null);
  const [excelData, setExcelData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // const shouldShowNewButton = () => {
  //   if (!employeeType) return true;
  //   if (employeeType === 'doctor' && user?.role.toLowerCase() === 'admin') return true;
  //   if (employeeType === 'receptionist' && user?.role.toLowerCase() === 'admin') return true;
  //   return false;
  // };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let fetchParams = { ...params };
      if (employeeType) {
        fetchParams.type = employeeType.toUpperCase();
      }

      const response = await axios.get(`${apiUrl}/${apiEndpoint}/by-condition`, {
        params: fetchParams
      });
      const sortedPatients = Array.isArray(response.data)
        ? response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        : [];

      setData(sortedPatients);
    } catch (error) {
      console.error(`Error fetching ${modelName}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkCreatePermission = async () => {
      const role = localStorage.getItem('userRole')?.toLowerCase();
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];

      try {
        const response = await axios.get(`${apiUrl}/permission/by-condition`, {
          params: { role }
        });

        const hasPermission = response.data.some(
          (permission) =>
            permission.menu.toLowerCase() === `${lastSegment}-management`
        );

        setCanCreate(hasPermission);
      } catch (error) {
        console.error('Permission check failed:', error);
      }
    };
    checkCreatePermission();
    fetchData();
  }, [refetch, employeeType]);

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

  const getModelForCodeGeneration = () => {
    if (employeeType) {
      return `${employeeType}`;
    }
    return `${modelName.toLowerCase()}`;
  };

  const handleOpen = async () => {
    try {
      const response = await axios.get(`${apiUrl}/model/next-code`, {
        params: {
          model: getModelForCodeGeneration(),
          prefix: prefix
        }
      });
      setItemCode(response.data.code);

      const initialData = employeeType
        ? { ...initialFormValues, type: employeeType.toUpperCase() }
        : initialFormValues;

      setFormData(initialData);
      setOpen(true);
    } catch (error) {
      console.error('Error generating code:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to generate code',
        icon: 'error',
        timer: 3000,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setOpenEdit(false);
    setImportOpen(false);
    setFormData(initialFormValues);
    setExcelFile(null);
    setExcelData(null);
    setExcelFileError(null);
  };

  const handleOpenEdit = (item) => {
    const employeeType = datapassed.find(type => type.name === item.type);
    setCurrentItem(item);
    setFormData({
      ...item,
      type: employeeType ? employeeType.id : item.type,
    });
    setOpenEdit(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const response = await axios.put(`${apiUrl}/${apiEndpoint}/${currentItem.id}`, values);
      if (response.status === 200) {
        setOpenEdit(false);
        setRefetch(prev => !prev);
        await Swal.fire({
          title: `${modelName} Updated!`,
          text: `${modelName} updated successfully.`,
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
        text: error.response?.data?.message || `Failed to update ${modelName}.`,
        icon: 'error',
        timer: 3000,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      let payload = {
        code: itemCode,
        ...values
      };

      if (employeeType) {
        payload.type = employeeType.toUpperCase();
      }

      if (customHandlers.onSubmit) {
        await customHandlers.onSubmit(payload);
      } else {
        const response = await axios.post(`${apiUrl}/${apiEndpoint}`, payload);
        if (response.status === 201) {
          setOpen(false);
          setRefetch(prev => !prev);
          await Swal.fire({
            title: `${modelName} Created!`,
            text: `${modelName} created successfully.`,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setOpen(false);
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || `Failed to create ${modelName}.`,
        icon: 'error',
        timer: 3000,
      });
    }
  };

  // Excel Import Functions
  const handleFile = (e) => {
    const fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (fileTypes.includes(selectedFile.type)) {
        setExcelFileError(null);
        const reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = async (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'buffer' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet);

            // Generate codes for each record
            const codesResponse = await axios.get(`${apiUrl}/model/next-code`, {
              params: {
                model: getModelForCodeGeneration(),
                prefix: prefix,
                count: rawData.length
              }
            });

            // Map Excel data to model fields with generated codes
            const processedData = rawData.map((item, index) => {
              const mappedItem = { code: codesResponse.data.code +[index] };
              formFields.forEach(col => {
                if (col.name !== 'actions' && col.name in item) {
                  mappedItem[col.name] = item[col.name];
                }
              });
              return mappedItem;
            });

            setExcelFile(e.target.result);
            setExcelData(processedData);
          } catch (error) {
            console.error('Error processing file:', error);
            setExcelFileError('Error processing file. Please check the format.');
          }
        };
      } else {
        setExcelFileError('Please select only Excel or CSV file types');
      }
    } else {
      console.log('Please select your file');
    }
  }

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: 'buffer' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Generate codes for each record
      const codesResponse = await axios.get(`${apiUrl}/model/next-code`, {
        params: {
          model: getModelForCodeGeneration(),
          prefix: prefix,
        }
      });

      // Map Excel columns to model fields
      const mappedData = data.map((item,index) => {
        const mappedItem = { code: codesResponse.data.code +[index] };
        formFields.forEach(col => {
          const matchKey = Object.keys(item).find(key => key.toLowerCase() === col.name.toLowerCase());
          if (matchKey) {
            mappedItem[col.name] = item[matchKey];
          }
        });

        return mappedItem;
      });

      setExcelData(mappedData);

      try {
        const response = await axios.post(`${apiUrl}/${apiEndpoint}/bulk`, mappedData);
        if (response.status === 201) {
          handleClose();
          await Swal.fire({
            title: 'Success!',
            text: `${mappedData.length} ${modelName} records imported successfully.`,
            icon: 'success',
            timer: 3000,
          });
          setRefetch(prev => !prev);
        }
      } catch (error) {
        console.error('Import error:', error,mappedData);
        handleClose();
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to import data.',
          icon: 'error',
          timer: 3000,
        });
      }
    } else {
      setExcelFileError('Please select a file first');
    }
  };

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

  const preparedRows = Array.isArray(filteredData)
    ? filteredData
      .map(item => {
        if (!item) return null;

        try {
          const row = {
            id: item.code || item.id || '',
            ...item
          };

          if (valueGetters) {
            Object.entries(valueGetters).forEach(([field, getter]) => {
              try {
                row[field] = typeof getter === 'function'
                  ? getter(item)
                  : item[field];
              } catch (error) {
                console.error(`Error applying getter for field ${field}:`, error);
                row[field] = null;
              }
            });
          }

          if (employeeType) {
            row.employeeType = employeeType.length > 0
              ? employeeType.charAt(0).toUpperCase() + employeeType.slice(1).toLowerCase()
              : '';
          }

          return row;
        } catch (error) {
          console.error('Error preparing row:', error, item);
          return null;
        }
      })
      .filter(Boolean)
    : [];

  const preparedColumns = [
    ...columns.map(column => {
      if (customRenderers[column.field]) {
        return {
          ...column,
          renderCell: (params) => customRenderers[column.field](params)
        };
      }
      return column;
    }),
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <ActionMenu
          pathe={pathe}
          rowId={params.row.id}
          code={params.row.code}
          onRefetch={() => setRefetch(prev => !prev)}
          additionalActions={additionalActions}
          customHandlers={customHandlers}
          employeeType={employeeType}
          onEdit={() => handleOpenEdit(params.row)}
          detailPagePath={detailPagePath}
        />
      ),
    }
  ];

  if (employeeType) {
    preparedColumns.splice(1, 0, {
      field: 'type',
      headerName: 'Employment Type',
      width: 120,
      valueGetter: () => employeeType.charAt(0).toUpperCase() + employeeType.slice(1),
    });
  }

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
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 11,
                page: 0,
              }
            }
          }}
          onRowDoubleClick={(params) => {
            navigate(`${detailPagePath}/${params.row.code || params.row.id}`);
          }}
          pageSizeOptions={[11, 24, 50, 100]}
          slots={{
            toolbar: () => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px' }}>
                <div>
                  {canCreate && (
                    <>
                      <Button
                        onClick={handleOpen}
                        sx={{
                          backgroundColor: theme.palette.primary[100],
                          marginBottom: '15px',
                          marginRight: '15px',
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
                      <Button
                        onClick={() => setImportOpen(true)}
                        sx={{
                          backgroundColor: theme.palette.success.main,
                          marginBottom: '15px',
                          ':hover': {
                            backgroundColor: theme.palette.success.dark,
                            transform: 'scale(1.02)'
                          }
                        }}
                        variant="contained"
                        startIcon={<UploadFileIcon />}
                      >
                        Import from Excel
                      </Button>
                    </>
                  )}
                </div>
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

      {/* Add Modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
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
            width: 850,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 5,
            borderRadius: '8px',
          }}
        >
          <Typography id="modal-title" sx={{ color: theme.palette.primary[100] }} textAlign='center' variant="h4">
            Add New {modelName}
          </Typography>
          {employeeType && (
            <Typography textAlign='center' variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
              {employeeType.charAt(0).toUpperCase() + employeeType.slice(1)}
            </Typography>
          )}
          <Formik
            initialValues={formData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
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
            Edit {modelName}
          </Typography>

          {employeeType && (
            <Typography textAlign="center" variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
              {employeeType.charAt(0).toUpperCase() + employeeType.slice(1)}
            </Typography>
          )}

          <Formik
            initialValues={formData}
            validationSchema={validationSchema}
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
                  {isSubmitting ? 'Updating...' : `Update ${modelName}`}
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>

      {/* Import Modal */}
      <Modal open={importOpen} onClose={handleClose} aria-labelledby="import-modal-title" aria-describedby="import-modal-description">
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          sx={{
            position: 'absolute',
            top: '1%',
            left: '30%',
            transform: 'translate(-50%, -50%)',
            width: 900,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
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

          <Typography id="import-modal-title" sx={{ color: theme.palette.primary[100] }} textAlign="center" variant="h4">
            Import {modelName} from Excel
          </Typography>

          <Box component="form" onSubmit={handleFileSubmit} sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please upload an Excel file with the following columns:
            </Typography>

            <ul style={{ marginBottom: '20px' }}>
              {formFields.filter(col => col.field !== 'actions').map((col, index) => (
                <li key={index}>{col.name || col.label}</li>
              ))}
            </ul>

            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFile}
              style={{ display: 'none' }}
              id="excel-file-input"
            />
            <label htmlFor="excel-file-input">
              <Button
                variant="contained"
                component="span"
                fullWidth
                sx={{
                  mb: 2,
                  backgroundColor: theme.palette.primary[100],
                  ":hover": {
                    backgroundColor: theme.palette.primary[100],
                  },
                }}
                startIcon={<UploadFileIcon />}
              >
                Select Excel File
              </Button>
            </label>

            {excelFileError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {excelFileError}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!excelFile}
              sx={{
                backgroundColor: theme.palette.success.main,
                ":hover": {
                  backgroundColor: theme.palette.success.dark,
                },
              }}
            >
              Import Data
            </Button>

            {excelData && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Preview (first 5 rows):</Typography>
                <pre style={{
                  maxHeight: '200px',
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  {JSON.stringify(excelData.slice(0, 5), null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default GenericDataGrid;