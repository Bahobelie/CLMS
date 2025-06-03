import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  TextField,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfDay, isSameDay } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const LabTestsView = ({ patient }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const theme = useTheme();

  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(startOfDay(new Date()));
  const [showDateFilter, setShowDateFilter] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/labTests/by-condition/`, {
        params: {
          patientid: patient.id
        }
      });
      const sortedTests = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLabTests(sortedTests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient?.id) {
      fetchLabTests();
    }
  }, [patient, refreshCount]);

  const getSelectedLabtest = async (labtest) => {
    try {
      const response = await axios.get(`${apiUrl}/systemconstants/by-condition`, {
        params: { name: labtest.name }
      });
      setSelectedRow(response.data[0]);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleResultUpdate = async (newRow, oldRow) => {
    try {
      await axios.put(`${apiUrl}/labTests/${newRow.id}`, {
        result: newRow.result,
        referencerange: newRow.referencerange,
        remark:newRow.remark,
        status: newRow.result ? 'complete' : 'pending'
      });
      setRefreshCount(prev => prev + 1);
      return newRow;
    } catch (error) {
      console.error('Error updating test result:', error);
      return oldRow;
    }
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'success';
      case 'pending': return 'warning';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    if (!showDateFilter) {
      setDateFilter(startOfDay(new Date()));
    }
  };

  const columns = [
    { field: 'code', headerName: 'Test Code', width: 120, editable: false },
    { field: 'name', headerName: 'Name', width: 180, editable: false },
    {
      field: 'referencerange',
      headerName: 'Reference Range',
      width: 180,
      editable: true,
      renderCell: (params) => (
        typeof params.value === 'object'
          ? `${params.value.min} - ${params.value.max}`
          : params.value || 'N/A'
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
      editable: false,
    },
    {
      field: 'result',
      headerName: 'Result',
      width: 80,
      flex: 5,
      editable: true,
    },
    {
      field: 'remark',
      headerName: 'Remark',
      width: 80,
      editable: true,
    },
    {
      field: 'paymntstatus',
      headerName: 'Payment Status',
      width: 150,
      renderCell: (params) => (
        params.value === 'paid' ? (
          <span style={{ color: 'green', fontWeight: 'bold' }}>Paid</span>
        ) : (
          <span style={{ color: 'red', fontWeight: 'bold' }}>Unpaid</span>
        )
      ),
      editable: false,
    },
  ];

  const filteredTests = labTests.filter((test) => {
    const dateMatch = showDateFilter ? isSameDay(new Date(test.createdAt), dateFilter) : true;
    const paymentMatch = paymentFilter === 'all' ? true :
      (paymentFilter === 'paid' ? test.paymntstatus === 'paid' : test.paymntstatus !== 'paid');
    return dateMatch && paymentMatch;
  });

  if (loading) return <CircularProgress />;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4" sx={{ color: theme.palette.primary[100] }}>Lab Tests</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {showDateFilter && (
              <DatePicker
                label="Filter by Date"
                value={dateFilter}
                onChange={(newValue) => setDateFilter(newValue)}
                renderInput={(params) => (
                  <TextField {...params} sx={{ width: 200 }} />
                )}
              />
            )}

            <ToggleButtonGroup
              value={paymentFilter}
              exclusive
              onChange={(e, newValue) => newValue && setPaymentFilter(newValue)}
              size="small"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="paid">Paid</ToggleButton>
              <ToggleButton value="unpaid">Unpaid</ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title={showDateFilter ? "Hide date filter" : "Show date filter"}>
              <IconButton
                onClick={toggleDateFilter}
                color={showDateFilter ? 'primary' : 'default'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTests}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onRowClick={(params) => getSelectedLabtest(params.row)}
            processRowUpdate={handleResultUpdate}
            onProcessRowUpdateError={(error) => console.error(error)}
            editMode="cell"
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            initialState={{
              filter: {
                filterModel: {
                  items: [],
                  quickFilterValues: [],
                },
              },
            }}
          />
        </Paper>
        {selectedRow && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body1" fontWeight={500}>
              Reference Range:
            </Typography>
            <Chip
              label={selectedRow.referencerange || 'N/A'
              }
              color="primary"
              variant="outlined"
              sx={{ height: 32, fontSize: 14 }}
            />
          </Stack>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default LabTestsView;