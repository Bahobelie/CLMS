import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { truncate } from 'lodash';
import Swal from 'sweetalert2';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PatientHistory from './PatientHistory';
import PatientHealthInfo from './PatientHealtInfo';

const MedicalRecords = ({ patient }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();

  // State management
  const [patientHistory, setPatientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetch, setRefetch] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [openModal, setopenModal] = useState(false);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/patientHistorys/by-condition?patientId=${patient.id}`
        );
        setPatientHistory(response.data); // Expecting an array
      } catch (error) {
        console.error('Error fetching patient details:', error);
      } finally {
        setLoading(false);
        setRefetch(false);
      }
    };

    fetchPatientHistory();
  }, [patient, apiUrl, refetch]);

  const handleDelete = async (id) => {
    let userRole = localStorage.getItem('userRole'); // Assuming the role is stored as 'userRole'

    if (userRole === 'Receptionist' || userRole === 'Doctor') {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${apiUrl}/patientHistorys/${id}`);

          if (response.status === 200) {
            await Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success"
            });
            setRefetch(true);
          }
        } catch (error) {
          console.log(error);
          await Swal.fire({
            title: "Error",
            text: "An error occurred while deleting your file. Please try again later.",
            icon: "error"
          });
        }
      }
    } else {
      await Swal.fire({
        title: "Unauthorized!",
        text: "You don't have permission to delete this.",
        icon: "error"
      });
    }
  };
  const handleSaveHistory = async (values) => {
    console.log('values fro history',values);

    const itemCode = await axios.get(`${apiUrl}/model/next-code`, {
      params: {
        model: `patientHistorySchema`,
        prefix: 'PH-'
      }
    });
    console.log(itemCode.data.code)
    try {
      let payload = {
        code: itemCode.data.code,
        ...values
      };
      console.log('payload',payload)
        const response = await axios.post(`${apiUrl}/patientHistorys`, payload);

        if (response.status === 201) {
          setopenModal(false);
          setRefetch(prev => !prev);
          await Swal.fire({
            title: `PatientHistory's Created!`,
            text: 'Record created successfully.',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          });
        }

    } catch (error) {
      setopenModal(false);
      console.log(error);
      await Swal.fire({
        title: 'Error!',
        text: error?.message || 'Failed to create record.',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  }
  const handleView = (id) => {
    console.log('View clicked for ID:', id);
    // Add view logic here
  };

  const handelopenModal = () => {
    setopenModal((prev)=>!prev);
  };

  const filteredHistory = patientHistory.filter((record) => {
    if (!filterStartDate) return true;

    const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
    return filterStartDate ? recordDate >= filterStartDate : true;
  });

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={4}
      >
        <Typography variant="h5" sx={{ textAlign: 'left', flex: 1 }}>
          Medical
          <span style={{ color: theme.palette.primary[100], marginLeft: '4px' }}>
            Records
          </span>
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            onClick={handelopenModal}
            sx={{
              backgroundColor: theme.palette.primary[100],
              ':hover': {
                backgroundColor: theme.palette.primary[100],
                transform: 'scale(1.02)',
              },
            }}
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
          >
            New History
          </Button>

          <TextField
            label="Start Date"
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />
        </Stack>
      </Box>

      {loading ? (
        <Typography variant="body2" color="textSecondary">
          Loading...
        </Typography>
      ) : filteredHistory.length === 0 ? (
        <Typography variant="body2" color={theme.palette.error.dark}>
          {filterStartDate ? 'No records found below selected date range.' : 'No patient history found.'}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {(showAll ? filteredHistory : filteredHistory.slice(0, 3)).map((record) => (
            <Card
              key={record.id}
              sx={{
                backgroundColor: 'rgb(248 250 250)',
                borderLeft: `2px solid ${theme.palette.primary[100]}`,
                borderRadius: 3
              }}
            >
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(record.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }).replace(' ', ', ')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Complaint:</strong> {truncate(record.chief_complaint_symptoms)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Diagnosis:</strong> {truncate(record.medical_history_conditions)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Treatment:</strong> {truncate(record.current_treatments_current_doctor)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Prescription:</strong> {truncate(record.current_treatments_current_medications)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={2} display="flex" justifyContent="flex-end">
                    <Box display="flex" gap={1}>
                      <IconButton
                        sx={{
                          color: theme.palette.primary[100],
                          backgroundColor: 'white',
                          border: '1px',
                          borderColor: 'rgb(232 237 238)',
                          p: 3.2,
                          '&:hover': { backgroundColor: 'white' }
                        }}
                        onClick={() => handleView(record.id)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        sx={{
                          color: theme.palette.error.main,
                          backgroundColor: 'white',
                          p: 3.2,
                          '&:hover': { backgroundColor: 'white' }
                        }}
                        onClick={() => handleDelete(record.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {filteredHistory.length > 4 && (
        <Box mt={2} textAlign="center">
          <Button
            variant="outlined"
            sx={{ color: theme.palette.primary.main, cursor: 'pointer' }}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </Button>
        </Box>
      )}

      {/* PatientHistory Modal */}
      {openModal && (
        <PatientHistory
          open={openModal}
          onClose={() => setopenModal(false)}
          patient={patient}
          handelSubmite={handleSaveHistory}
        />
      )}
    </>
  );
};

export default MedicalRecords;
