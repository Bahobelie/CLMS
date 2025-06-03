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
  Typography,
  Pagination
} from '@mui/material';
import { Delete, Visibility, Edit } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { truncate } from 'lodash';
import Swal from 'sweetalert2';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PatientHistory from './PatientHistory';
import PatientHistoryModal from './PatientHistoryModal';
import generateCode from '../../utils/generateCode';

const MedicalRecords = ({ patient }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();

  // State management
  const [patientHistory, setPatientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetch, setRefetch] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/patientHistorys/by-condition?patientId=${patient.id}`
        );
        setPatientHistory(response.data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      } finally {
        setLoading(false);
        setRefetch(false);
      }
    };

    fetchPatientHistory();
  }, [patient, apiUrl, refetch]);

  let userRole = localStorage.getItem('userRole');

  const handleDelete = async (id) => {
    let userRole = localStorage.getItem('userRole');

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
            setPage(1); // Reset to first page after deletion
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
    try {
      if (editingRecord) {
        // Update existing record
        const response = await axios.put(
          `${apiUrl}/patientHistorys/${editingRecord.id}`,
          values
        );

        if (response.status === 200) {
          if (values.selectedLabTests?.length > 0) {
            try {
              // Get existing lab tests for this record
              const existingLabTests = await axios.get(`${apiUrl}/labTests/by-condition`, {
                params: {
                  patientid: patient.id,
                  patienthistoryid: editingRecord.id
                }
              });

              const existingTestIds = (Array.isArray(existingLabTests.data))?existingLabTests.data.map(test => test.name):[];

              // Determine tests to add (newly selected)
              const testsToAdd = values.selectedLabTests.filter(
                test => !existingTestIds.includes(test.name)
              );

              // Add new tests
              if (testsToAdd.length > 0) {
                const labItemCode = await generateCode('LabTest', `LT-`);
                const newTests = testsToAdd.map((test, index) => ({
                  code: `${labItemCode}${index}`,
                  name: test.name || "UNNAMED_TEST",
                  description: test.description || "",
                  price: test.amount || 0,
                  isactive: true,
                  referencerange: test.referencerange || "N/A",
                  status: 'pending',
                  remark: test.remark || "",
                  patientid: patient.id,
                  patienthistoryid: editingRecord.id,
                  systemConstantId: test.id
                }));

                await axios.post(`${apiUrl}/labTests/bulkCreate`, {
                  labTests: newTests,
                  patientid:patient.id
                });
              }

              // Update existing tests that might have changed
              const testsToUpdate = values.selectedLabTests.filter(
                test => existingTestIds.includes(test.id)
              );

              if (testsToUpdate.length > 0) {
                await Promise.all(testsToUpdate.map(test => {
                  const existingTest = existingLabTests.data.find(
                    t => t.systemConstantId === test.id
                  );
                  if (existingTest) {
                    return axios.put(`${apiUrl}/labTests/${existingTest.id}`, {
                      ...existingTest,
                      name: test.name || existingTest.name,
                      description: test.description || existingTest.description,
                      price: test.amount || existingTest.price,
                      referencerange: test.referencerange || existingTest.referencerange,
                      remark: test.remark || existingTest.remark
                    });
                  }
                  return Promise.resolve();
                }));
              }
            } catch (labError) {
              console.error("Error updating lab tests:", labError);
              throw labError;
            }
          }

          await Swal.fire({
            title: "Updated!",
            text: "Patient history updated successfully.",
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
          setRefetch(prev => !prev);
          setOpenModal(false);
          setEditingRecord(null);
        }
      }
      else {
        // Create new record
        const itemCode = await axios.get(`${apiUrl}/model/next-code`, {
          params: {
            model: `patientHistory`,
            prefix: 'PH-'
          }
        });
        const labItemCode = await generateCode('LabTest', `LT-`);

        let payload = {
          code: itemCode.data.code,
          patientId: patient.id,
          ...values
        };

        const labTests = await Promise.all(
          values.selectedLabTests?.map(async (test, index) => ({
            code: labItemCode + index,
            name: test.name || "UNNAMED_TEST",
            description: test.description || "",
            price: test.amount || 0,
            isactive: true,
            referencerange: test.referencerange || "N/A",
            status: 'pending',
            remark: test.remark || "",
          })) || []
        );

        // 1. First API call - Create Patient History
        const response = await axios.post(`${apiUrl}/patientHistorys`, payload);


        // 2. Create Lab Tests if they exist
        if (values.selectedLabTests?.length > 0) {
          try {
            await axios.post(`${apiUrl}/labTests/bulkCreate`, {
              patientid: patient.id,
              labTests: labTests.map(test => ({
                ...test,
                patientid: patient.id,
                remark: test.remark || "",
                patienthistoryid: response.data.id
              })),
            });
          } catch (labError) {
            // Rollback if lab test creation fails
            await axios.delete(`${apiUrl}/patientHistorys/${response.data.id}`);
            throw labError;
          }
        }

        // Success Handling
        setOpenModal(false);
        setRefetch(prev => !prev);
        setPage(1); // Reset to first page after adding new record

        await Swal.fire({
          title: "Success!",
          text: "Patient history and lab tests saved successfully.",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      setOpenModal(false);
      setEditingRecord(null);
      console.error("Submission error:", error);
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to save data. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleView = (record) => {
    setModalContent(record);
    setOpenHistoryModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenHistoryModal(false);
  };

  const handleOpenModal = () => {
    setEditingRecord(null);
    setOpenModal(true);
  };

  const filteredHistory = Array.isArray(patientHistory) && patientHistory.length > 0
    ? patientHistory
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter((record) => {
        if (!filterStartDate) return true;
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        return recordDate === filterStartDate;
      })
    : [];

  // Pagination calculations
  const paginatedHistory = filteredHistory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

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
            onClick={handleOpenModal}
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
        <Typography variant="body2" color={theme.palette.primary[100]}>
          Loading...
        </Typography>
      ) : filteredHistory.length === 0 ? (
        <Typography variant="body2" color={theme.palette.error.dark}>
          {filterStartDate ? 'No records found below selected date range.' : 'No patient history found.'}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {paginatedHistory.map((record) => (
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
                      <strong>Complaint:</strong> {truncate(record.medical_history_conditions)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>History:</strong> {truncate(record.medical_history_hospitalizations)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Assessment:</strong> {truncate(record.assessment)}
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
                        onClick={() => handleView(record)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        sx={{
                          color: theme.palette.primary[100],
                          backgroundColor: 'white',
                          border: '1px',
                          borderColor: 'rgb(232 237 238)',
                          p: 3.2,
                          '&:hover': { backgroundColor: 'white' }
                        }}
                        onClick={() => handleEdit(record)}
                      >
                        <Edit />
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

      {filteredHistory.length > itemsPerPage && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.palette.primary.main,
                border: `1px solid ${theme.palette.primary.light}`,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                },
              },
            }}
          />
        </Box>
      )}

      {/* PatientHistory Modal */}
      {openModal && (
        <PatientHistory
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingRecord(null);
          }}
          patient={patient}
          userRole={userRole}
          handelSubmite={handleSaveHistory}
          initialData={editingRecord}
        />
      )}

      {openHistoryModal && (
        <PatientHistoryModal
          open={openHistoryModal}
          onClose={handleClose}
          patient={patient}
          record={modalContent}
          showLabTests={false}
        />
      )}
    </>
  );
};

export default MedicalRecords;