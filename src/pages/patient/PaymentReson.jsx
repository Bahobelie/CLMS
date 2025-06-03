import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
  TableSortLabel,
  TablePagination,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Divider,
  Grid, Snackbar, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, isToday, parseISO, startOfDay } from 'date-fns';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import PrintIcon from '@mui/icons-material/Print';
import { useTheme } from '@mui/material/styles';

const LabTestsTable = ({ patient }) => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(startOfDay(new Date()));
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTests, setSelectedTests] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await axios.get(`${apiUrl}/labTests/by-condition`, {
          params: {
            patientid: patient.id
          }
        });
        setLabTests(response.data);
      } catch (error) {
        console.error('Error fetching lab tests:', error);
        showSnackbar('Error fetching lab tests', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLabTests();
  }, [apiUrl, patient.id,snackbar]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handlePaymentChange = async (event, testId) => {
    const newPaymentStatus = event.target.value;

    try {
      // Optimistic UI update
      const updatedLabTests = labTests.map(test =>
        test.id === testId ? { ...test, paymntstatus: newPaymentStatus } : test
      );
      setLabTests(updatedLabTests);

      await axios.put(`${apiUrl}/labTests/${testId}`, {
        paymntstatus: newPaymentStatus
      });

      showSnackbar('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      // Revert on error
      const originalLabTests = labTests.map(test =>
        test.id === testId ? { ...test, paymntstatus: test.paymntstatus } : test
      );
      setLabTests(originalLabTests);
      showSnackbar('Failed to update payment status', 'error');
    }
  };

  const handleSelectTest = (event, testId) => {
    setSelectedTests({
      ...selectedTests,
      [testId]: event.target.checked,
    });
  };

  const handleSelectAllTests = (event) => {
    const newSelectedTests = {};
    if (event.target.checked) {
      filteredTests.forEach(test => (newSelectedTests[test.id] = true));
    }
    setSelectedTests(newSelectedTests);
  };

  const handleMakeAllSelectedPaid = async () => {
    const selectedTestIds = Object.keys(selectedTests).filter(id => selectedTests[id]);
    if (selectedTestIds.length === 0) {
      showSnackbar('No tests selected', 'warning');
      return;
    }

    try {
      // Optimistic UI update
      const updatedLabTests = labTests.map(test =>
        selectedTestIds.includes(test.id) ? { ...test, paymntstatus: 'paid' } : test
      );
      setLabTests(updatedLabTests);

      await axios.patch(`${apiUrl}/labTests/bulk-update`, {
        id: selectedTestIds,
        paymntstatus: 'paid',
      });

      showSnackbar(`${selectedTestIds.length} test(s) marked as paid`);
      setSelectedTests({}); // Clear selections
    } catch (error) {
      console.error('Error updating payment statuses:', error);
      // Revert on error
      const originalLabTests = labTests.map(test => {
        if (selectedTestIds.includes(test.id)) {
          return { ...test, paymntstatus: test.paymntstatus };
        }
        return test;
      });
      setLabTests(originalLabTests);
      showSnackbar('Failed to update payment statuses', 'error');
    }
  };

  const handleMakeAllSelectedUnpaid = async () => {
    const selectedTestIds = Object.keys(selectedTests).filter(id => selectedTests[id]);
    if (selectedTestIds.length === 0) {
      showSnackbar('No tests selected', 'warning');
      return;
    }

    try {
      // Optimistic UI update
      const updatedLabTests = labTests.map(test =>
        selectedTestIds.includes(test.id) ? { ...test, paymntstatus: 'unpaid' } : test
      );
      setLabTests(updatedLabTests);

      await axios.patch(`${apiUrl}/labTests/bulk-update`, {
        id: selectedTestIds,
        paymntstatus: 'unpaid',
      });

      showSnackbar(`${selectedTestIds.length} test(s) marked as unpaid`);
      setSelectedTests({});
    } catch (error) {
      console.error('Error updating payment statuses:', error);
      // Revert on error
      const originalLabTests = labTests.map(test => {
        if (selectedTestIds.includes(test.id)) {
          return { ...test, paymntstatus: test.paymntstatus };
        }
        return test;
      });
      setLabTests(originalLabTests);
      showSnackbar('Failed to update payment statuses', 'error');
    }
  };

  const handlePrintBill = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Lab Test Bill - ${patient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .patient-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 1.2em; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Lab Test Bill</h2>
            <p>Date: ${format(new Date(), 'MMM dd, yyyy')}</p>
          </div>
          
          <div class="patient-info">
            <p><strong>Patient:</strong> ${patient.first_name}</p>
            <p><strong>ID:</strong> ${patient.code}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Description</th>
                <th>Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTests.map(test => `
                <tr>
                  <td>${test.name}</td>
                  <td>${test.description || '-'}</td>
                  <td>${format(parseISO(test.createdAt), 'MMM dd, yyyy')}</td>
                  <td>${test.price || '0'}</td>
                  <td>${test.paymntstatus === 'paid' ? 'Paid' : 'Unpaid'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Amount: $${calculateTotalAmount().toFixed(2)}</p>
            <p>Total Paid: $${calculatePaidAmount().toFixed(2)}</p>
            <p>Balance Due: $${(calculateTotalAmount() - calculatePaidAmount()).toFixed(2)}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const calculateTotalAmount = () => {
    return filteredTests.reduce((sum, test) => sum + (parseFloat(test.price) || 0), 0);
  };

  const calculatePaidAmount = () => {
    return filteredTests
      .filter(test => test.paymntstatus === 'paid')
      .reduce((sum, test) => sum + (parseFloat(test.price) || 0), 0);
  };

  let filteredTests = [];
  if (Array.isArray(labTests)) {
    filteredTests = labTests
      .filter(test =>
        dateFilter ? isToday(parseISO(test.createdAt)) : true
      )
      .sort((a, b) => {
        if (order === 'asc') {
          return a[orderBy] > b[orderBy] ? 1 : -1;
        }
        return a[orderBy] < b[orderBy] ? 1 : -1;
      });
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilter = () => {
    setDateFilter(null);
  };

  const handleShowToday = () => {
    setDateFilter(startOfDay(new Date()));
  };

  const handleShowAll = () => {
    setDateFilter(null);
  };

  if (loading) return <div>Loading...</div>;

  const isAllSelected = filteredTests.length > 0 &&
    Object.keys(selectedTests).length === filteredTests.length &&
    filteredTests.every(test => selectedTests[test.id]);

  const selectedCount = Object.keys(selectedTests).filter(id => selectedTests[id]).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, color: theme.palette.primary[100] }}>
          Required Lab Tests
        </Typography>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker
              label="Filter by Date"
              value={dateFilter}
              onChange={(newValue) => setDateFilter(newValue)}
              renderInput={(params) => (
                <TextField {...params} sx={{ width: 300 }} />
              )}
            />

            <ButtonGroup variant="outlined">
              <Tooltip title="Clear date filter">
                <IconButton onClick={handleClearFilter} color="error">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Show today's tests">
                <Button
                  onClick={handleShowToday}
                  startIcon={<FilterAltOffIcon />}
                  variant={dateFilter ? 'outlined' : 'contained'}
                >
                  Today
                </Button>
              </Tooltip>
              <Tooltip title="Show all tests">
                <Button
                  onClick={handleShowAll}
                  startIcon={<AllInboxIcon />}
                  variant={!dateFilter ? 'contained' : 'outlined'}
                >
                  All
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {dateFilter
              ? `Showing today's tests (${filteredTests.length} records)`
              : `Showing all tests (${filteredTests.length} records)`}
          </Typography>
        </Box>

        {selectedCount > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMakeAllSelectedPaid}
            >
              Make Selected Paid ({selectedCount})
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleMakeAllSelectedUnpaid}
            >
              Make Selected Unpaid ({selectedCount})
            </Button>
          </Box>
        )}

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedCount > 0 && selectedCount < filteredTests.length
                    }
                    checked={isAllSelected}
                    onChange={handleSelectAllTests}
                  />
                </TableCell>
                {[
                  { id: 'code', label: 'Code' },
                  { id: 'name', label: 'Test Name' },
                  { id: 'description', label: 'Description' },
                  { id: 'referencerange', label: 'Reference Range' },
                  { id: 'status', label: 'Status' },
                  { id: 'createdAt', label: 'Date' },
                  { id: 'price', label: 'Amount' },
                  { id: 'payment', label: 'Payment' }
                ].map((headCell) => (
                  <TableCell key={headCell.id}>
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.length > 0 ? (
                filteredTests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((test) => (
                    <TableRow key={test.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={!!selectedTests[test.id]}
                          onChange={(event) => handleSelectTest(event, test.id)}
                        />
                      </TableCell>
                      <TableCell>{test.code}</TableCell>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{test.description}</TableCell>
                      <TableCell>{test.referencerange}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            borderRadius: 1,
                            bgcolor: test.status === 'completed' ? '#e8f5e9' :
                              test.status === 'pending' ? '#fff8e1' : '#ffebee',
                            color: test.status === 'completed' ? '#2e7d32' :
                              test.status === 'pending' ? '#ff8f00' : '#d32f2f'
                          }}
                        >
                          {test.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(test.createdAt), 'MMM dd, yyyy - HH:mm')}
                      </TableCell>
                      <TableCell>${parseFloat(test.price || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`payment-status-label-${test.id}`}>Payment</InputLabel>
                          <Select
                            labelId={`payment-status-label-${test.id}`}
                            id={`payment-status-${test.id}`}
                            value={test.paymntstatus || 'unpaid'}
                            label="Payment"
                            onChange={(event) => handlePaymentChange(event, test.id)}
                          >
                            <MenuItem value="unpaid">Unpaid</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No tests found for the selected criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
          />
        </TableContainer>

        {/* Summary Section */}
        <Box sx={{
          mt: 3,
          p: 2,
          backgroundColor: '#f9f9f9',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintBill}
                sx={{ mb: 2 }}
              >
                Print Bill
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total Tests:</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {filteredTests.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total Amount:</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  ${calculateTotalAmount().toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total Paid:</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                  ${calculatePaidAmount().toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Balance Due:</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                  ${(calculateTotalAmount() - calculatePaidAmount()).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
    </LocalizationProvider>
  );
};

export default LabTestsTable;