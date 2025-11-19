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

const PatientInjection = ({ patient, record }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const imageUrl = import.meta.env.VITE_APP_IMAGE_PATH;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

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



  // Fetch lab tests for the patient
  const fetchLabTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/labTests/by-condition`, {
        params: {
          patientid: patient.id,
          isactive: true,
          patienthistoryid: record.id
        }
      });
      const filteredLabTests =Array.isArray(response.data)?response.data.filter(item => item.remark === 'injection'):[];
      setData(filteredLabTests || []);
    } catch (err) {
      console.error('Error fetching lab tests:', err);
      setError('Failed to load lab tests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
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



  const handleSaveSuccess = () => {
    fetchLabTests();
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
      fetchLabTests(); // Refresh data
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
    fetchLabTests();
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
      <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            Injection  for <span style={{color: theme.palette.primary.main}}>{patient.first_name} {patient.middle_name} (ID: {patient.code})</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search tests..."
              value={filter}
              onChange={handleFilterChange}
              sx={{ mr: 1, width: isMobile ? '150px' : '250px' }}
            />
            <Tooltip title="Add New Test">
              <IconButton color="primary" onClick={handleAddNew}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="lab tests table" size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    {filter ? 'No matching tests found' : 'No lab tests available'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow hover key={row.id} tabIndex={-1}>
                      <TableCell>{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">${row.price}</TableCell>
                      <TableCell>
                        {row.status && (
                          <Chip
                            label={row.status}
                            color={statusColors[row.status] || 'default'}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {row.result || (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleView(row)}
                              color="info"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Test">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(row)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Test">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(row)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
        />
      </Paper>



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

export default PatientInjection;