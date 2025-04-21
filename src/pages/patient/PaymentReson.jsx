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
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, isToday, parseISO, startOfDay } from 'date-fns';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import { useTheme } from '@mui/material/styles';

const LabTestsTable = ({patient}) => {
  const theme=useTheme();

  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(startOfDay(new Date()));
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/labTests/by-condition',
          {
            params:{
              patientid:patient.id
            }
          });
        setLabTests(response.data);
      } catch (error) {
        console.error('Error fetching lab tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabTests();
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredTests = labTests
    .filter(test =>
      dateFilter ? isToday(parseISO(test.createdAt)) : true
    )
    .sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      }
      return a[orderBy] < b[orderBy] ? 1 : -1;
    });

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3,color:theme.palette.primary[100] }}>
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

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                {[
                  { id: 'code', label: 'Code' },
                  { id: 'name', label: 'Test Name' },
                  { id: 'description', label: 'Description' },
                  { id: 'referencerange', label: 'Reference Range' },
                  { id: 'status', label: 'Status' },
                  { id: 'createdAt', label: 'Date' },
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
                    <TableRow key={test.code} hover>
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
                      <TableCell>
                        <Box
                          sx={{
                            fontWeight: 'bold',
                            color: test.price === "0" ? '#4caf50' : '#ff5722'
                          }}
                        >
                          {test.price === "0" ? 'Free' : `$${test.price}`}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
      </Box>
    </LocalizationProvider>
  );
};

export default LabTestsTable;