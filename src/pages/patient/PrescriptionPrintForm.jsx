import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { ArrowBack, Print, Save } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';

const PrescriptionPrintForm = ({
                            prescription,
                            onChange,
                            onSave,
                            onBack,
                            mode = 'create',
                            saving,
                            patients,
                            doctors,
                            theme, apiUrl
                          }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogSeverity, setDialogSeverity] = useState('success');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const prescriptionRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);

  const [clinicInfo,setclinicInfo]=useState('');

  const handlePrint = useReactToPrint({
    content: () => prescriptionRef.current,
    documentTitle: `Presciption-${new Date}-${patients.first_name}`,
    contentRef: prescriptionRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      .prescription-header {
        background-color: ${theme.palette.primary[100]} !important;
        color: ${theme.palette.getContrastText(theme.palette.primary[100])} !important;
      }
    `,
    removeAfterPrint: true
  });

  useEffect(() => {
    const fetchlogo = async () => {
      try {
        const logos = await axios.get(`${apiUrl}/clinicinfo/by-condition`,{
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

  const patientDetails = getPatientDetails(patients);

  return (
    <PrintContainer>
      {/* Printable Content */}
      <Box
        ref={prescriptionRef}
        sx={{
          p: isMobile ? 1 : 3,
          backgroundColor: '#fff',
          maxWidth: '210mm', // Standard A4 width
          margin: '0 auto',
          '@media print': {
            padding: 0,
            maxWidth: '100%'
          }
        }}
      >
        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          borderBottom: `2px solid ${theme.palette.primary[100]}`,
          pb: 2,
          '@media print': {
            borderBottom: `2px solid #000`
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {clinicInfo?.logo_url && (
              <Box sx={{ width: 80, height: 80 }}>
                <img
                  src={`${clinicInfo.logo_url}`}
                  alt="Clinic Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            )}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary[100] }}>
                {clinicInfo?.name || 'Medical Clinic'}
              </Typography>
              <Typography variant="body2">
                {clinicInfo?.address || 'Clinic Address'}
              </Typography>
              <Typography variant="body2">
                Phone: {clinicInfo?.phone || 'N/A'} | Email: {clinicInfo?.email || 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Box textAlign="right">
            <Typography variant="h5" sx={{
              fontWeight: 'bold',
              color: theme.palette.primary[100],
              textDecoration: 'underline'
            }}>
              PRESCRIPTION
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Rx No:</strong> {prescription.code || 'New'}
            </Typography>
          </Box>
        </Box>

        {/* Patient & Doctor Information */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{
              p: 2,
              border: `1px solid #ddd`,
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="h6" sx={{
                mb: 1,
                color: theme.palette.primary[100],
                borderBottom: `1px solid ${theme.palette.primary[100]}`,
                pb: 1
              }}>
                PATIENT INFORMATION
              </Typography>

              {prescription.patientid? (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {patients.first_name} {patients.last_name}
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Sex:</strong> {patients.gender}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Age:</strong> {patients.age || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Card No:</strong> {patients.code}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Phone:</strong> {patients.phone_number}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Address:</strong> {patients.country}, {patients.district_state}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No patient selected
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{
              p: 2,
              border: `1px solid #ddd`,
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="h6" sx={{
                mb: 1,
                color: theme.palette.primary[100],
                borderBottom: `1px solid ${theme.palette.primary[100]}`,
                pb: 1
              }}>
                DOCTOR INFORMATION
              </Typography>

              {prescription.doctorid ? (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {getDoctorName(prescription.doctorid)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Specialization:</strong> {doctors.find(d => d.id === prescription.doctorid)?.specialization || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>License No:</strong> {doctors.find(d => d.id === prescription.doctorid)?.license_number || 'N/A'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No doctor selected
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Medicines Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{
            mb: 1,
            color: theme.palette.primary[100],
            borderBottom: `1px solid ${theme.palette.primary[100]}`,
            pb: 1
          }}>
            PRESCRIBED MEDICATIONS
          </Typography>

          {prescription.medicines?.length > 0 ? (
            <Box sx={{
              border: `1px solid #ddd`,
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                display: 'flex',
                backgroundColor: '#f5f5f5',
                p: 1,
                borderBottom: `1px solid #ddd`,
                fontWeight: 'bold'
              }}>
                <Box sx={{ width: '40%' }}>Medicine Name</Box>
                <Box sx={{ width: '15%' }}>Dosage</Box>
                <Box sx={{ width: '15%' }}>Frequency</Box>
                <Box sx={{ width: '15%' }}>Duration</Box>
                <Box sx={{ width: '15%' }}>Instructions</Box>
              </Box>

              {prescription.medicines.map((medicine, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  p: 1,
                  borderBottom: index < prescription.medicines.length - 1 ? '1px solid #eee' : 'none',
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#f9f9f9'
                  }
                }}>
                  <Box sx={{ width: '40%' }}>{medicine.name}</Box>
                  <Box sx={{ width: '15%' }}>{medicine.dosage}</Box>
                  <Box sx={{ width: '15%' }}>{medicine.frequency}</Box>
                  <Box sx={{ width: '15%' }}>{medicine.duration}</Box>
                  <Box sx={{ width: '15%' }}>
                    {medicine.instructions}
                    {medicine.before_meal && ' (Before meal)'}
                    {medicine.after_meal && ' (After meal)'}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{
              textAlign: 'center',
              py: 2,
              fontStyle: 'italic'
            }}>
              No medications prescribed
            </Typography>
          )}
        </Box>

        {/* Additional Notes */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{
            mb: 1,
            color: theme.palette.primary[100],
            borderBottom: `1px solid ${theme.palette.primary[100]}`,
            pb: 1
          }}>
            ADDITIONAL NOTES
          </Typography>
          <Box sx={{
            p: 2,
            border: `1px solid #ddd`,
            borderRadius: 1,
            minHeight: 100,
            backgroundColor: '#f9f9f9'
          }}>
            {prescription.notes || (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No additional notes provided
              </Typography>
            )}
          </Box>
        </Box>

        {/* Doctor Signature */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 6
        }}>
          <Box sx={{
            textAlign: 'center',
            width: 250,
            pt: 1,
            borderTop: '1px solid #000'
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {prescription.doctorid ? getDoctorName(prescription.doctorid) : 'Doctor Name'}
            </Typography>
            <Typography variant="body2">
              {doctors.find(d => d.id === prescription.doctorid)?.specialization || 'Specialization'}
            </Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              License No: {doctors.find(d => d.id === prescription.doctorid)?.license_number || 'N/A'}
            </Typography>
          </Box>
        </Box>
        {/* Footer Section - Visible on screen*/}
        <Box sx={{
          mt: 4,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
          fontSize: '0.75rem',
          color: theme.palette.text.secondary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }} className="no-print">
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} {clinicInfo?.name || 'Medical Clinic'}. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Powered by <span style={{ fontWeight: 500 }}>Twist IT Solution</span>
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            v1.0.0 {/* You can replace with your actual version */}
          </Typography>
        </Box>
      </Box>


  {/* Action Buttons (Non-printable) */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2]
      }} className="no-print">
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleLocalSave}
            size={isMobile ? 'small' : 'medium'}
            disabled={saving}
          >
            {mode === 'create' ? 'Save' : 'Update'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Print />}
            onClick={handlePrint}
            size={isMobile ? 'small' : 'medium'}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Dialog for messages */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          {dialogSeverity === 'success' ? 'Success' : 'Error'}
        </DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </PrintContainer>
  );
};

export default PrescriptionPrintForm;