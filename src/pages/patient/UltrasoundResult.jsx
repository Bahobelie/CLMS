import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  TablePagination,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';
import EditLabTestModal from './EditLabTestModal';
import ViewLabTestModal from './ViewLabTestModal';

const UltrasoundResult = ({ patient, record }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const imageUrl = import.meta.env.VITE_APP_IMAGE_PATH;

  const [data, setData] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [ultrasounds, setUltraSounds] = useState([]);
  const [viewImageDialogOpen, setViewImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Table state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('code');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statusColors = {
    pending: 'warning',
    complete: 'success',
    canceled: 'error'
  };

  // Fetch ultrasound results for the patient
  const fetchUltraSounds = async () => {
    try {
      const response = await axios.get(`${apiUrl}/ultarsounds/by-condition`, {
        params: {
          patientId: patient.id,
          patienthistoryid:record.id
        }
      });
      setUltraSounds(response.data || []);
    } catch (err) {
      console.error('Error fetching ultrasound results:', err);
      setError('Failed to load ultrasound results. Please try again.');
    }
  };


  useEffect(() => {
    fetchUltraSounds();
  }, [patient]);

  // Table handlers
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  // Action handlers
  const handleView = (test) => {
    setCurrentTest(test);
    setViewModalOpen(true);
  };

  const handleEdit = (test) => {
    setCurrentTest(test);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentTest(null);
    setEditModalOpen(true);
  };

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setViewImageDialogOpen(true);
  };

  const handleSaveSuccess = () => {
    setSnackbarMessage('Test saved successfully');
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (test) => {
    setSelectedTest(test);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${apiUrl}/labTests/${selectedTest.id}`);
      setSnackbarMessage(`Test "${selectedTest.name}" deleted successfully`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting test:', err);
      setSnackbarMessage('Failed to delete test');
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTest(null);
    }
  };

  const handleRefresh = () => {
    fetchUltraSounds();
    setSnackbarMessage('Data refreshed');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Filter and sort data
  const filteredData = Array.isArray(data)
    ? data.filter((item) => {
      const searchStr = filter.toLowerCase();
      return (
        item.code?.toLowerCase().includes(searchStr) ||
        item.name?.toLowerCase().includes(searchStr) ||
        item.patientid?.toString().includes(searchStr) ||
        item.status?.toLowerCase().includes(searchStr)
      );
    })
    : [];

  const sortedData = filteredData.sort((a, b) => {
    let comparison = 0;
    if (a[orderBy] > b[orderBy]) {
      comparison = 1;
    } else if (a[orderBy] < b[orderBy]) {
      comparison = -1;
    }
    return order === 'asc' ? comparison : -comparison;
  });

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  // Table columns
  const columns = [
    { id: 'code', label: 'Test Code', minWidth: 100, sortable: true },
    { id: 'name', label: 'Test Name', minWidth: 150, sortable: true },
    { id: 'price', label: 'Price', minWidth: 80, align: 'right', sortable: true },
    { id: 'status', label: 'Status', minWidth: 120, sortable: true },
    { id: 'result', label: 'Result', minWidth: 100, sortable: false },
    { id: 'actions', label: 'Actions', minWidth: 120, sortable: false }
  ];

  return (
    <>

      {/* Ultrasound Results Section */}
      <Paper sx={{ width: '100%', overflow: 'hidden', p: 2, mt: 4 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2,color:theme.palette.primary[100] }}>
          Ultrasound Results
        </Typography>

        {ultrasounds.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
            No ultrasound results available
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(ultrasounds) ? (
                  ultrasounds.map((ultrasound) => (
                    <TableRow hover key={ultrasound.code}>
                      <TableCell>{ultrasound.code}</TableCell>
                      <TableCell>{ultrasound.name}</TableCell>
                      <TableCell>{ultrasound.description || '-'}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={`${apiUrl}/${ultrasound.imageUrl}`}
                          alt={ultrasound.name}
                          sx={{ width: 56, height: 56, cursor: 'pointer' }}
                          onClick={() =>
                            handleViewImage(
                              `${imageUrl}/images/${ultrasound.imageUrl.split('/').pop()}`
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Image">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleViewImage(
                                  `${imageUrl}/images/${ultrasound.imageUrl.split('/').pop()}`
                                )
                              }
                              color="primary"
                            >
                              <ImageIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton size="small" color="secondary">
                              <PdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No ultrasound data available</TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Image View Dialog */}
      <Dialog
        open={viewImageDialogOpen}
        onClose={() => setViewImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ultrasound Image</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
              <img
                src={selectedImage}
                alt="Ultrasound"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewImageDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              // Add download functionality here
              window.open(selectedImage, '_blank');
            }}
            color="primary"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Typography>
              Are you sure you want to delete the test "{selectedTest.name}"?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <EditLabTestModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        test={currentTest}
        onSave={handleSaveSuccess}
        patient={patient}
        apiUrl={apiUrl}
        record={record}
      />

      <ViewLabTestModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        test={currentTest}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UltrasoundResult;