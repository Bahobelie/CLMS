import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Paper, Typography, CircularProgress, IconButton, Tooltip,
  TextField, MenuItem, Select, FormControl, InputLabel, Box,
  Button, Divider, Chip, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import {
  Refresh, Search, Print, Receipt,
  FilterAlt, AttachMoney, Delete
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const LabTestReport = ({ conditionParams }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patientNames, setPatientNames] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();

  // Fetch data when component mounts or conditionParams change
  useEffect(() => {
    fetchData();
  }, [conditionParams]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        conditionParams ? `${apiUrl}/labtests/by-condition` : `${apiUrl}/labtests`,
        { params: conditionParams }
      );
      setData(response.data);
      await fetchPatientNames(response.data);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientNames = async (tests) => {
    try {
      const names = {};
      const uniquePatientIds = [...new Set(tests.map(test => test.patientid))];

      for (const id of uniquePatientIds) {
        const response = await axios.get(`${apiUrl}/patients/by-condition`, {
          params: { id }
        });
        names[id] = `${response.data[0]?.first_name || ''} ${response.data[0]?.last_name || ''}`.trim();
      }
      setPatientNames(names);
    } catch (error) {
      console.error('Error fetching patient names:', error);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return theme.palette.success.main;
      case 'pending': return theme.palette.warning.main;
      case 'cancelled': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  // Process data with additional fields
  const processedData = useMemo(() => {
    return data.map(test => ({
      ...test,
      id: test._id || test.id, // Ensure we have a unique id
      patientName: patientNames[test.patientid] || 'Loading...',
      formattedPrice: test.price !== "0" ? `$${parseFloat(test.price).toFixed(2)}` : '-',
      numericPrice: parseFloat(test.price) || 0,
      formattedStatus: test.status.charAt(0).toUpperCase() + test.status.slice(1),
      statusColor: getStatusColor(test.status)
    }));
  }, [data, patientNames]);

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return processedData.filter(test => {
      const matchesSearch =
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || test.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [processedData, searchTerm, statusFilter]);

  // Calculate totals for selected tests
  const billingSummary = useMemo(() => {
    const subtotal = selectedTests.reduce((sum, test) => sum + test.numericPrice, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      itemCount: selectedTests.length
    };
  }, [selectedTests]);



  const columns = [
    {
      field: 'select',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={selectedTests.some(t => t.id === params.row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTests([...selectedTests, params.row]);
            } else {
              setSelectedTests(selectedTests.filter(t => t.id !== params.row.id));
            }
          }}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Test Name',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'patientName',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.formattedStatus}
          size="small"
          sx={{
            backgroundColor: `${params.row.statusColor}20`,
            color: params.row.statusColor,
            fontWeight: 500
          }}
        />
      )
    },
    {
      field: 'result',
      headerName: 'Result',
      width: 120
    },
    {
      field: 'referencerange',
      headerName: 'Reference',
      width: 120
    },
    {
      field: 'numericPrice',
      headerName: 'Price',
      width: 100,
      valueFormatter: (params) => params.value > 0 ? `$${params.value.toFixed(2)}` : '-',
      cellClassName: (params) => params.value > 0 ? '' : 'secondary-text'
    }
  ];

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ p: 1, gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Divider orientation="vertical" flexItem />
        <Button
          startIcon={<Receipt />}
          onClick={() => setReceiptOpen(true)}
          disabled={selectedTests.length === 0}
        >
          Generate Bill ({selectedTests.length})
        </Button>
      </GridToolbarContainer>
    );
  };

  if (loading && !data.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ padding: 2, textAlign: 'center', color: 'error.main' }}>
        <Typography>{error}</Typography>
        <IconButton onClick={fetchData} color="primary">
          <Refresh />
        </IconButton>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Laboratory Test Report
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filter Controls */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search tests..."
          InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status Filter"
            startAdornment={<FilterAlt sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <Chip
          label={`${filteredData.length} tests found`}
          color="info"
          variant="outlined"
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: '60vh', width: '100%' }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          checkboxSelection={false}
          disableRowSelectionOnClick
          slots={{ toolbar: CustomToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
          }}
          pageSizeOptions={[25, 50, 100]}
        />
      </Box>

      {/* Billing Summary */}
      {selectedTests.length > 0 && (
        <Paper elevation={3} sx={{ mt: 3, p: 2, backgroundColor: 'background.paper' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              Billing Summary ({selectedTests.length} items selected)
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<Delete />}
                onClick={() => setSelectedTests([])}
                color="error"
                size="small"
              >
                Clear
              </Button>
              <Button
                startIcon={<Print />}
                onClick={() => window.print()}
                variant="contained"
                size="small"
              >
                Print
              </Button>
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Box sx={{ minWidth: 300 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal:</Typography>
                <Typography fontWeight="bold">${billingSummary.subtotal}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Tax (10%):</Typography>
                <Typography>${billingSummary.tax}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">Total:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${billingSummary.total}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Laboratory Test Receipt</Typography>
            <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary">PATIENT:</Typography>
            <Typography>
              {selectedTests[0]?.patientName || 'N/A'}
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>TESTS PERFORMED:</Typography>
            {selectedTests.map((test, index) => (
              <Box key={test.id} display="flex" justifyContent="space-between" mb={1}>
                <Typography>
                  {index + 1}. {test.name}
                </Typography>
                <Typography>
                  ${test.numericPrice.toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>${billingSummary.subtotal}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tax (10%):</Typography>
              <Typography>${billingSummary.tax}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography variant="subtitle1">Total Amount:</Typography>
              <Typography variant="h6" fontWeight="bold">
                ${billingSummary.total}
              </Typography>
            </Box>
          </Box>

          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Thank you for choosing our laboratory services
            </Typography>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={() => window.print()}
              sx={{ mt: 2 }}
            >
              Print Receipt
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default LabTestReport;