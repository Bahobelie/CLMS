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
  Button,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Refresh as RefreshIcon, FilterAlt as FilterIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isToday, parseISO, startOfDay, isSameDay } from 'date-fns';

const LabTestsView = ({ patient }) => {
  const [labTests, setLabTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTest, setEditingTest] = useState(null);
  const [resultValue, setResultValue] = useState('');
  const [dateFilter, setDateFilter] = useState(startOfDay(new Date()));
  const [showDateFilter, setShowDateFilter] = useState(true);
  const [showingLatest, setShowingLatest] = useState(false);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/api/labTests/by-condition/`, {
        params: {
          patientid: patient.id
        }
      });
      const sortedTests = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLabTests(sortedTests);

      // Check if there are tests for today
      const hasTodayTests = sortedTests.some(test =>
        isSameDay(new Date(test.createdAt), new Date())
      );

      if (!hasTodayTests && sortedTests.length > 0) {
        // If no tests today, show the most recent tests
        setShowingLatest(true);
        setFilteredTests(sortedTests.slice(0, 5)); // Show 5 most recent
      } else {
        setShowingLatest(false);
        const todayTests = sortedTests.filter(test =>
          isSameDay(new Date(test.createdAt), new Date())
        );
        setFilteredTests(todayTests);
      }
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();;

  }, [patient]);

  useEffect(() => {
    if (labTests.length > 0 && showDateFilter) {
      const filtered = labTests.filter(test =>
        isSameDay(new Date(test.createdAt), dateFilter)
      );
      setFilteredTests(filtered);
      setShowingLatest(false);
    }
  }, [dateFilter, showDateFilter, labTests]);

  const handleEditClick = (test) => {
    setEditingTest(test);
    setResultValue(test.result || '');
  };

  const handleSaveResult = async () => {
    try {
      await axios.put(`http://localhost:4000/api/labTests/${editingTest.id}`, {
        result: resultValue,
        status: resultValue ? 'complete' : 'pending'
      });
      fetchLabTests();
      setEditingTest(null);
    } catch (error) {
      console.error('Error updating test result:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'success';
      case 'pending': return 'warning';
      case 'canceled':return 'error';
      default: return 'default';
    }
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    if (!showDateFilter) {
      setDateFilter(startOfDay(new Date()));
    }
  };

  const showAllTests = () => {
    setFilteredTests(labTests);
    setShowingLatest(false);
    setShowDateFilter(false);
  };

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
          <Typography variant="h4">Lab Tests</Typography>

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

            <Tooltip title={showDateFilter ? "Hide date filter" : "Show date filter"}>
              <IconButton
                onClick={toggleDateFilter}
                color={showDateFilter ? 'primary' : 'default'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton onClick={fetchLabTests}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {showingLatest && (
              <Button
                variant="outlined"
                onClick={showAllTests}
                size="small"
              >
                Show All Tests
              </Button>
            )}
          </Box>
        </Box>

        {showingLatest && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff8e1', borderRadius: 1 }}>
            <Typography variant="body2">
              No tests found for today. Showing {filteredTests.length} most recent tests instead.
            </Typography>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Test Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Reference Range</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Result</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{test.code}</TableCell>
                    <TableCell>{test.name}</TableCell>
                    <TableCell>{test.description}</TableCell>
                    <TableCell>{test.referencerange}</TableCell>
                    <TableCell>
                      <Chip
                        label={test.status}
                        color={getStatusColor(test.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {test.result || 'Not available'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(test.createdAt), 'MMM dd, yyyy - hh:mm a')}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Result">
                        <IconButton onClick={() => handleEditClick(test)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No tests found for selected date
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Result Dialog */}
        <Dialog open={Boolean(editingTest)} onClose={() => setEditingTest(null)}>
          <DialogTitle>
            Edit Test Result - {editingTest?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 400, pt: 2 }}>
              <TextField
                label="Test Result"
                fullWidth
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                multiline
                rows={4}
              />
              <Typography variant="caption" color="textSecondary">
                Reference: {editingTest?.referencerange}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingTest(null)}>Cancel</Button>
            <Button
              onClick={handleSaveResult}
              variant="contained"
              color="primary"
            >
              Save Result
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default LabTestsView;