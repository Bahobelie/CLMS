import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add,
  AddCircleOutline,
  ArrowBack,
  Delete,
  Edit,
  Medication,
  Person,
  Print,
  RemoveCircleOutline,
  Save,
  Search,
  Visibility
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import axios from 'axios';
import PrescriptionPrintForm from './PrescriptionPrintForm';

const apiUrl=import.meta.env.VITE_APP_IMAGE_PATH;
const loginUser=localStorage.getItem("user");

// Styled components
const PrescriptionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary[100],
  color: theme.palette.getContrastText(theme.palette.primary.light),
  borderRadius: '8px'
}));

const MedicineItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background[100],
  '&:hover': {
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.action.hover
  }
}));

// 1. First, modify the PrintContainer styled component
const PrintContainer = styled(Box)({
  '@media print': {
    '& .no-print': {
      display: 'none !important'
    },
    '& .print-content': {
      visibility: 'visible',
      position: 'relative',
      width: '100%',
      height: 'auto',
      overflow: 'visible'
    }
  }
});

// Clinic logo component
const ClinicLogo = ({clinicInfo}) => {
  const theme = useTheme();
  const isPrintMode = useMediaQuery('print');

  return (
    <Box
      className="prescription-logo"
      sx={{
        width: 120,
        height: 60,
        backgroundImage: `url(${clinicInfo.logo_url})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        // Ensure logo is visible in print mode
        '@media print': {
          filter: isPrintMode ? 'brightness(0)' : 'none',
          backgroundColor: 'transparent'
        },
        // Fallback styling if image fails to load
        backgroundColor: theme.palette.grey[200],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::after': {
          content: '"Clinic Logo"',
          display: 'none',
          position: 'absolute',
          fontSize: '0.7rem',
          color: theme.palette.text.secondary,
          ...(isPrintMode && {
            display: 'block'
          })
        }
      }}
    />
  );
};

// Prescription list component
const PrescriptionList = ({
                            prescriptions,
                            onAddNew,
                            onView,
                            onPrint,
                            onDelete,
                            loading,
                            patients,
                            doctors
                          }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [patientNames, setPatientNames] = useState({});
  const [doctorNames, setDoctorNames] = useState({});

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter prescriptions based on search term
  const filteredPrescriptions = Array.isArray(prescriptions)
    ? prescriptions.filter(prescription => {
      const searchLower = searchTerm.toLowerCase();
      const patientName = (patientNames[prescription.patientid] || '').toLowerCase();
      const doctorName = (doctorNames[prescription.doctorid] || '').toLowerCase();

      return (
        patientName.includes(searchLower) ||
        doctorName.includes(searchLower) ||
        (prescription.code?.toLowerCase().includes(searchLower)) ||
        (prescription.dosage?.toLowerCase().includes(searchLower)))
        ;
    })
    : [];

  // Paginated prescriptions
  const paginatedPrescriptions = filteredPrescriptions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteClick = (prescription) => {
    setPrescriptionToDelete(prescription);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (prescriptionToDelete) {
      await onDelete(prescriptionToDelete.id);
      setDeleteDialogOpen(false);
      setPrescriptionToDelete(null);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'medicine-popover' : undefined;

  const getPatientName = async (patientId) => {
    if (!patientId) return 'Unknown Patient';
    try {
      const response = await axios.get(`${apiUrl}/patients/by-condition`, {
        params: { id: patientId }
      });
      return response?.data?.[0]?.first_name || 'Unknown Patient';
    } catch (error) {
      console.error("Error fetching patient data:", error);
      return 'Unknown Patient';
    }
  };

  const getDoctorName = async (doctorId) => {
    if (!doctorId) return 'Unknown Doctor';
    try {
      const response = await axios.get(`${apiUrl}/employees/by-condition`, {
        params: { id: doctorId }
      });
      return response?.data?.[0]?.firstname || 'Unknown Doctor';
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      return 'Unknown Doctor';
    }
  };

  useEffect(() => {
    const fetchNames = async () => {
      const patientNamesMap = {};
      const doctorNamesMap = {};

      for (const prescription of prescriptions) {
        if (!patientNamesMap[prescription.patientid]) {
          patientNamesMap[prescription.patientid] = await getPatientName(prescription.patientid);
        }
        if (!doctorNamesMap[prescription.doctorid]) {
          doctorNamesMap[prescription.doctorid] = await getDoctorName(prescription.doctorid);
        }
      }

      setPatientNames(patientNamesMap);
      setDoctorNames(doctorNamesMap);
    };

    if (prescriptions.length > 0) {
      fetchNames();
    }
  }, [prescriptions]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold',color:theme.palette.primary[100]}}>Prescriptions</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={onAddNew}
          sx={{ minWidth: 200,backgroundColor:theme.palette.primary[100],'&:hover': {backgroundColor:theme.palette.primary[100]}
              }}
        >
          New Prescription
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Search prescriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table sx={{ minWidth: 650 }} aria-label="prescriptions table">
              <TableHead sx={{ backgroundColor: theme.palette.primary[100] }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rx Code</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Patient</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Doctor</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Medicines</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPrescriptions.length > 0 ? (
                  paginatedPrescriptions.map((prescription) => {
                    const createdDate = new Date(prescription.created_at);
                    return (
                      <TableRow
                        key={prescription.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Typography fontWeight="medium">{prescription.code?.trim()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography fontWeight="medium">
                              {patientNames[prescription.patientid] || 'Loading...'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {doctorNames[prescription.doctorid] || 'Loading...'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {prescription.medicines?.length > 0 ? (
                            <>
                              <Chip
                                label={`${prescription.medicines.length} medicines`}
                                size="small"
                                icon={<Medication fontSize="small" />}
                                onClick={handleClick}
                                clickable
                               sx={{color:theme.palette.primary[100]}}
                              />
                              <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                }}
                                PaperProps={{ sx: { p: 2, maxWidth: 300 } }}
                              >
                                <Box>
                                  {prescription.medicines.map((med, idx) => (
                                    <Box key={idx} sx={{ mb: 1 }}>
                                      name:<strong>{med.name}</strong><br />
                                      Dosage: {med.dosage}<br />
                                      Frequency: {med.frequency}<br />
                                      quantity:{med.quantity}
                                    </Box>
                                  ))}
                                </Box>
                              </Popover>
                            </>
                          ) : (
                            <Typography variant="caption">No medicines</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(createdDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Tooltip title="View">
                              <IconButton
                                sx={{color:theme.palette.primary[100]}}
                                onClick={() => onView(prescription)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                sx={{color:theme.palette.primary[100]}}
                                onClick={() => onPrint(prescription)}
                              >
                                <Print />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteClick(prescription)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No prescriptions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPrescriptions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '.MuiTablePagination-toolbar': {
                  paddingLeft: 0
                }
              }}
            />
          </Box>
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete prescription {prescriptionToDelete?.code?.trim()}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Medicine form component
const MedicineForm = ({ medicine, onChange, onRemove, index }) => {
  return (
    <MedicineItem elevation={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Medicine Name"
            size="small"
            value={medicine.name || ''}
            onChange={(e) => onChange(index, 'name', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Dosage"
            size="small"
            value={medicine.dosage || ''}
            onChange={(e) => onChange(index, 'dosage', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Frequency"
            size="small"
            value={medicine.frequency || ''}
            onChange={(e) => onChange(index, 'frequency', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Duration"
            size="small"
            value={medicine.duration || ''}
            onChange={(e) => onChange(index, 'duration', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Quantity"
            size="small"
            type="number"
            value={medicine.quantity || ''}
            onChange={(e) => onChange(index, 'quantity', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1}>
          <Box display="flex" justifyContent="flex-end">
            <IconButton
              color="error"
              onClick={() => onRemove(index)}
              sx={{ mt: 1 }}
            >
              <RemoveCircleOutline />
            </IconButton>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Instructions"
            multiline
            rows={2}
            size="small"
            value={medicine.instructions || ''}
            onChange={(e) => onChange(index, 'instructions', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={medicine.before_meal || false}
                  onChange={(e) => onChange(index, 'before_meal', e.target.checked)}
                  color="primary"
                />
              }
              label="Before Meal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={medicine.after_meal || false}
                  onChange={(e) => onChange(index, 'after_meal', e.target.checked)}
                  color="primary"
                />
              }
              label="After Meal"
            />
          </Box>
        </Grid>
      </Grid>
    </MedicineItem>
  );
};

// Prescription form component
const PrescriptionForm = ({
                            prescription,
                            onChange,
                            onSave,
                            onBack,
                            mode = 'create',
                            saving,
                            patients,
                            doctors
                          }) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogSeverity, setDialogSeverity] = useState('success');
  const [selectedPatient, setSelectedPatient] = useState(null);


  const [clinicInfo,setclinicInfo]=useState('');


  useEffect(() => {
    const fetchlogo = async () => {
      try {
        const logos = await axios.get(`${apiUrl}/api/clinicinfo/by-condition`,{
          params:{
            isactive:true
          }
        });

        if (logos.data && logos.data.length > 0) {

          const latestData = logos.data.reduce((latest, current) => {
            const latestDate = new Date(latest.updatedAt || latest.createdAt);
            const currentDate = new Date(current.updatedAt || current.createdAt);
            return currentDate > latestDate ? current : latest;
          });

          setclinicInfo(latestData)
        }
      } catch (error) {
        console.error('Error fetching clinic data:', error);
      }
    };

    fetchlogo();
  }, []);
  const handleInputChange = (field, value) => {
    onChange({
      ...prescription,
      [field]: value
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...prescription.medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value
    };
    handleInputChange('medicines', updatedMedicines);
  };

  const handleAddMedicine = () => {
    const currentMedicines = Array.isArray(prescription.medicines)
      ? prescription.medicines
      : [];

    handleInputChange('medicines', [
      ...currentMedicines,
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: 1,
        instructions: '',
        before_meal: false,
        after_meal: false
      }
    ]);
  };


  const handleRemoveMedicine = (index) => {
    const updatedMedicines = prescription.medicines.filter((_, i) => i !== index);
    handleInputChange('medicines', updatedMedicines);
  };

  const handleLocalSave = async () => {
    try {
      await onSave(prescription);

    } catch (error) {
    console.log(error)
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstname} ${doctor.lastname}` : 'Unknown Doctor';
  };

  const getPatientDetails = (patient) => {
    if (!patient) return null;

    return {
      sex: patient.gender || 'Not specified',
      cardNumber: patient.code || 'Not specified',
      kebele: patient.country || 'Not specified',
      region: patient.district_state || 'Not specified',
      town: patient.district_state || 'Not specified',
      phone: patient.phone_number || 'Not specified'
    };
  };
  const patientDetails = getPatientDetails(prescription.patientid);

  return (
    <PrintContainer>
      <Box
           className="print-content"

           sx={{
        p: isMobile ? 1 : 3,
        backgroundColor: '#fff',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ mb: 2 ,color:theme.palette.primary[100]}}
          className="no-print"
        >
          Back to List
        </Button>

        {/* Header with Logo */}
        <PrescriptionHeader className="prescription-header">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ClinicLogo clinicInfo={clinicInfo} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {clinicInfo.name}
              </Typography>
              <Typography variant="body2">
                {clinicInfo.address}
              </Typography>
            </Box>
          </Box>
          <Box textAlign="right" sx={{ minWidth: 150 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>PRESCRIPTION</Typography>
            <Typography variant="body2">Rx No: {prescription.code || 'New'}</Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </PrescriptionHeader>

        {/* Patient & Doctor Selection */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderLeft: `4px solid ${theme.palette.primary[100]}` }}>
              <Typography variant="h6" sx={{
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.primary[100]
              }}>
                <Person sx={{ mr: 1 }}  /> Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Autocomplete
                options={[patients]} // Ensure options is an array
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (ID: ${option.code})`}
                value={patients || null} // value should be one object, not the whole list
                onChange={(_, newValue) => {
                  handleInputChange('patientid', newValue?.id || '');
                  setSelectedPatient(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Patient"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}
              />


              {prescription.patientid && patientDetails && (
                <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Typography variant="h6" sx ={{color:theme.palette.primary[100]}} gutterBottom>
                    Patient Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2"><strong>Sex:</strong> {patients.gender}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2"><strong>Card No:</strong> {patients.code}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2"><strong>Phone:</strong> {patients.phone_number}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2"><strong>Kebele:</strong> {patients.country}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2"><strong>Region:</strong> {patients.district_state}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2"><strong>Town:</strong> {patientDetails.district_state}</Typography>
                    </Grid>
                  </Grid>
                </Box>

              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderLeft: `4px solid ${theme.palette.primary[100]}` }}>
              <Typography variant="h6" sx={{
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.primary[100]
              }}>
                <Person sx={{ mr: 1 }} /> Doctor Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControl
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                required
                error={!prescription.doctorid} // highlights in red if empty
              >
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={prescription.doctorid || ''}
                  onChange={(e) => handleInputChange('doctorid', e.target.value)}
                  label="Doctor"
                >
                  {doctors.map(doctor => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {`Dr.${doctor.firstname} ${doctor.lastname}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {prescription.doctorid && (
                <Typography variant="body2">
                  Selected Doctor: {getDoctorName(prescription.doctorid)}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Medicines Section */}
        <Paper sx={{
          p: 2,
          mb: 3,
          borderLeft: `4px solid ${theme.palette.primary[100]}`
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" sx={{
              color: theme.palette.primary[100]
            }}>
              Medicines
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddCircleOutline />}
              onClick={handleAddMedicine}
              className="no-print"
            >
              Add Medicine
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {prescription.medicines?.length > 0 ? (
            prescription.medicines.map((medicine, index) => (
              <MedicineForm
                key={index}
                medicine={medicine}
                onChange={handleMedicineChange}
                onRemove={handleRemoveMedicine}
                index={index}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No medicines added yet
            </Typography>
          )}
        </Paper>

        {/* Additional Notes */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary[100] }}>
            Additional Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter any additional notes or instructions..."
            value={prescription.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </Paper>

        {/* Doctor Signature */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 4,
          mb: 4
        }}>
          <Box sx={{
            textAlign: 'center',
            width: 250,
            pt: 1
          }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {prescription.doctorid ? getDoctorName(prescription.doctorid) : 'Doctor Name'}
            </Typography>
            <Typography variant="body2">
              {doctors.find(d => d.id === prescription.doctorid)?.specialization || 'Specialization'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
        p: 2,
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2]
      }} className="no-print">
        <Button
          variant="contained"
          color="success"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleLocalSave}
          size={isMobile ? 'small' : 'medium'}
          disabled={saving}
        >
          {mode === 'create' ? 'Save Prescription' : 'Update Prescription'}
        </Button>
      </Box>

      {/* Dialog for messages */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ color: theme.palette.primary[100] }}>
          {dialogSeverity === 'success' ? 'Success' : 'Error'}
        </DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: theme.palette.primary[100] }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </PrintContainer>
  );
};

// Main component that manages the view state
const PrescriptionManagementSystem = ({ patient }) => {

  const apiUrl=import.meta.env.VITE_APP_API_URL;
  const theme=useTheme();

  const [view, setView] = useState('list'); // 'list' or 'form'
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentPrescription, setCurrentPrescription] = useState({
    code: ``,
    patientid: patient?.id || '',
    doctorid: '' || 0,
    medicines: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/prescriptions/by-condition`, {
        params: {
          patientid: patient.id
        }
      });
      setPrescriptions(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${apiUrl}/patients/by-condition`,{
        params:{
          id:patient.id
        }
      });
      setPatients(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch patients', 'error');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${apiUrl}/employees/by-condition`);
      setDoctors(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch doctors', 'error');
    }
  };

  const handleAddNew =async () => {
    const code=await axios.get(`${apiUrl}/model/next-code`,{
      params:{
        model:'Prescription',
        prefix:'PRE-'
      }
    });
    setCurrentPrescription({
      code: code.data.code,
      patientid: patient?.id || '',
      doctorid: '',
      medicines: [],
      notes: ''
    });
    setView('form');
  };

  const handleView = (prescription) => {
    setCurrentPrescription(prescription);
    setView('form');
  };


  const handlePrint = (prescription) => {
    setCurrentPrescription(prescription);
    setView('print');
  };

  const handleSave = async (prescriptionData) => {
    const prescriptionCode=await axios.get(`${apiUrl}/model/next-code`,{
      params:{
        model:'Prescription',
        prefix:'PRE-'
      }
    });
    setSaving(true);
    try {

      // Prepare the proper prescription object to save
      const prescriptionToSave = {
        code:prescriptionData.code?prescriptionData.code: prescriptionCode.data.code,
        patientid: patient.id, // Use the patient prop directly
        doctorid: prescriptionData.doctorid ? prescriptionData.doctorid : loginUser.id,
        medicines: prescriptionData.medicines.map(medicine => ({
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
          quantity: medicine.quantity,
          instructions: medicine.instructions,
          before_meal: medicine.before_meal,
          after_meal: medicine.after_meal
        })),
        notes: prescriptionData.notes
      };


      console.log('precription to save',loginUser)
      if (prescriptionData.id) {

        // Update existing prescription
        await axios.put(`${apiUrl}/prescriptions/${prescriptionData.id}`, prescriptionToSave);
        showSnackbar('Prescription updated successfully', 'success');
      } else {
        // Create new prescription
        await axios.post(`${apiUrl}/prescriptions`, prescriptionToSave);
        showSnackbar('Prescription created successfully', 'success');
      }
      fetchPrescriptions();
      setView('list');
    } catch (error) {
      console.log(error)
      showSnackbar('Failed to save prescription', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/prescriptions/${id}`);
      showSnackbar('Prescription deleted successfully', 'success');
      fetchPrescriptions();
    } catch (error) {
      showSnackbar('Failed to delete prescription', 'error');
    }
  };

  const handleBackToList = () => {
    setView('list');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      {view === 'list' ? (
        <PrescriptionList
          prescriptions={prescriptions}
          onAddNew={handleAddNew}
          onView={handleView}
          onPrint={handlePrint}
          onDelete={handleDelete}
          loading={loading}
          patients={patients}
          doctors={doctors}
        />
      ) : view === 'print' ? (
        <PrescriptionPrintForm
          prescription={currentPrescription}
          apiUrl={apiUrl}
          theme={theme}
          onBack={handleBackToList}
          patients={patients[0]}
          doctors={doctors}
        />
      ): (
        <PrescriptionForm
          prescription={currentPrescription}
          onChange={setCurrentPrescription}
          onSave={handleSave}
          onBack={handleBackToList}
          mode={currentPrescription.id ? 'edit' : 'create'}
          saving={saving}
          patients={patient}
          doctors={doctors}
        />
      )
      }

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PrescriptionManagementSystem;