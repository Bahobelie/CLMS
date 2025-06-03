import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Avatar, Button, Grid, Typography, Box, Stack, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Divider, Chip, CircularProgress, TextField, InputAdornment,
  MenuItem, FormControl, Select, Pagination, Card, CardContent, CardActionArea, Badge, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  AccountCircle, DateRange, AttachMoney, People, Search, FilterList, Clear,
  Print, PictureAsPdf, LocalHospital, MonitorHeart, Bloodtype, Height,
  Scale, Favorite, ArrowBack, Close, Event, Person, Receipt
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import Swal from 'sweetalert2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Assets
import avatar1 from 'assets/images/users/avatar-1.png';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard = styled(Card)(({ theme, active }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: active ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
    border: `2px solid ${theme.palette.primary.light}`
  }
}));

const DataTableContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontWeight: 600
  }
}));

export default function DashboardDefault() {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  // Data states
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [totalEarning, setTotalEarning] = useState(0);
  const [chartData, setChartData] = useState([]);

  // Display states
  const [displayData, setDisplayData] = useState([]);
  const [dataType, setDataType] = useState('patients');
  const [loading, setLoading] = useState(true);

  // UI states
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStatCard, setActiveStatCard] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, appointmentsRes, employeesRes, labTestsRes] = await Promise.all([
          axios.get(`${apiUrl}/patients`),
          axios.get(`${apiUrl}/appointments`),
          axios.get(`${apiUrl}/employees`),
          axios.get(`${apiUrl}/labtests/by-condition`, { params: { status: 'complete' } })
        ]);

        const sortedPatients = patientsRes.data.sort((a, b) =>
          new Date(b.updated_at) - new Date(a.updated_at)
        );

        setPatients(sortedPatients);
        setAppointments(appointmentsRes.data);
        setEmployees(employeesRes.data);
        setLabTests(labTestsRes.data);
        setDisplayData(sortedPatients);

        const total = labTestsRes.data.reduce((sum, test) => sum + Number(test.price || 0), 0);
        setTotalEarning(total);
        setChartData(prepareMonthlyData(sortedPatients));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare monthly patient data for chart
  const prepareMonthlyData = (patients) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyCounts = Array(12).fill(0);

    patients.forEach(patient => {
      const date = new Date(patient.createdAt || patient.updatedAt);
      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()]++;
      }
    });

    return monthNames.map((month, index) => ({
      name: month,
      patients: monthlyCounts[index]
    }));
  };

  // Handle stat card click
  const handleStatCardClick = (type) => {
    setActiveStatCard(activeStatCard === type ? null : type);
    setViewMode('list');
    setDataType(type);
    setSearchTerm('');
    setPage(1);

    switch(type) {
      case 'patients':
        setDisplayData(patients);
        break;
      case 'appointments':
        setDisplayData(appointments);
        break;
      case 'employees':
        setDisplayData(employees);
        break;
      case 'earnings':
        setDisplayData(labTests);
        break;
      default:
        setDisplayData(patients);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [];
    const term =searchTerm!=null?searchTerm?.toLowerCase():[];

    switch(dataType) {
      case 'patients':
        result = patients.filter(patient =>
          patient.first_name.toLowerCase().includes(term) ||
          patient.last_name.toLowerCase().includes(term) ||
          patient.code.toLowerCase().includes(term)
        );
        break;
      case 'appointments':
        result = appointments.filter(appt => {
          const term = searchTerm.toLowerCase();

          // Find the patient associated with this appointment
          const patient = patients.find(p => p.id === appt.patientId);
          const patientName = patient
            ? `${patient.first_name} ${patient.last_name}`.toLowerCase()
            : '';

          return (
            appt.code.toLowerCase().includes(term) ||  // Search by appointment code
            appt.status.toLowerCase().includes(term) || // Search by status
            patientName.includes(term)                // NEW: Search by patient name
          );
        });
        break;
      case 'employees':
        result = employees.filter(employee =>
          employee.firstname.toLowerCase().includes(term) ||
          employee.lastname.toLowerCase().includes(term) ||
          employee.specialization.toLowerCase().includes(term)
        );
        break;
      case 'earnings':
        const isArray=Array.isArray(labTests)
        result = (isArray?labTests:[]).filter(test =>
          test.name.toLowerCase().includes(term) ||
          test.patientName.toLowerCase().includes(term) ||
          test.status.toLowerCase().includes(term)
        );
        break;
      default:
        result = patients;
    }

    setDisplayData(result);
  }, [searchTerm, dataType, patients, appointments, employees, labTests]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Pagination calculation
  const count = Math.ceil(displayData.length / rowsPerPage);
  const isArray = Array.isArray(displayData);
  const paginatedData = (isArray ? displayData : []).slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );


  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';

    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start; // milliseconds

      // Convert to minutes
      const diffMins = Math.round(diffMs / 60000);

      // Format as hours and minutes if over 60 minutes
      if (diffMins >= 60) {
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        return `${hours}h ${minutes}m`;
      }

      return `${diffMins} minutes`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'N/A';
    }
  };

  // Render data tables based on type
  const renderDataTable = () => {
    switch(dataType) {
      case 'patients':
        return (
          <DataTableContainer>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{
                  backgroundColor: theme.palette.primary[100],
                  '& .MuiTableCell-root': {
                    backgroundColor: theme.palette.primary[100]
                  }
                }}>
                  <TableRow>
                    <TableCell>Patient ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Blood Group</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((patient) => (
                    <TableRow
                      key={patient.id}
                      hover
                      onClick={() => {
                        setSelectedItem(patient);
                        setOpenDialog(true);
                      }}
                      sx={{ '&:hover': { cursor: 'pointer' } }}
                    >
                      <TableCell>{patient.code}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            src={avatar1}
                            sx={{ width: 36, height: 36 }}
                          />
                          <span>{patient.first_name} {patient.last_name}</span>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.gender}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{calculateAge(patient.date_of_birth)} yrs</TableCell>
                      <TableCell>
                        {patient.blood_group ? (
                          <Chip
                            label={patient.blood_group}
                            size="small"
                            color="error"
                          />
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.application_fee || 'Active'}
                          color={patient.application_fee === 'Active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DataTableContainer>
        );
      case 'appointments':
        return (
          <DataTableContainer>
            <TableContainer  component={Paper}>
              <Table>
                <TableHead sx={{ '& .MuiTableCell-root': {
                    backgroundColor: theme.palette.primary[100],
                    color: 'white !important'
                  } }}>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((appt) => (
                    <TableRow key={appt.id} hover onClick={() => {
                      setSelectedItem(appt);
                      setOpenDialog(true);
                    }}>
                      <TableCell>{appt.code}</TableCell>
                      <TableCell>
                        {patients.find(patient => patient.id === appt.patientId)?.first_name || 'Unknown'}
                        {patients.find(patient => patient.id === appt.patientId)?.last_name || ''}
                      </TableCell>
                      <TableCell>{new Date(appt.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={appt.status} color={
                          appt.status === 'Completed' ? 'success' :
                            appt.status === 'Cancelled' ? 'error' : 'warning'
                        } />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DataTableContainer>
        );
      case 'employees':
        return (
          <DataTableContainer>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{
                  '& .MuiTableCell-root': {
                    backgroundColor: theme.palette.primary[100],
                    color: 'white !important'
                  }
                }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((employee) => (
                    <TableRow key={employee.id} hover onClick={() => {
                      setSelectedItem(employee);
                      setOpenDialog(true);
                    }}>
                      <TableCell>{employee.firstname} {employee.firstname}</TableCell>
                      <TableCell>{employee.specialization}</TableCell>
                      <TableCell>{employee.phonenumber}</TableCell>
                      <TableCell>
                        <Chip label={employee.status || 'Active'} color={
                          (employee.status || 'Active').toLowerCase() === 'available'
                            ? 'success'
                            : 'warning'
                        } />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DataTableContainer>
        );
      case 'earnings':
        return (
          <DataTableContainer>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ '& .MuiTableCell-root': {
                    backgroundColor: theme.palette.primary[100],
                    color: 'white !important'
                  } }}>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>TestName</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((test) => (
                    <TableRow key={test.id} hover onClick={() => {
                      setSelectedItem(test);
                      setOpenDialog(true);
                    }}>
                      <TableCell>{test.code}</TableCell>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{patients.find((pa)=>pa.id===test.patientid)?.first_name}</TableCell>
                      <TableCell>{new Date(test.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{test.price} Birr</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DataTableContainer>
        );
      default:
        return null;
    }
  };

  // Render detail dialog based on data type
  const renderDetailDialog = () => {
    if (!selectedItem) return null;

    switch(dataType) {
      case 'patients':
        return (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{color:theme.palette.primary[100]}}>Patient Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar src={avatar1} sx={{ width: 100, height: 100 }} />
                  <Box>
                    <Typography variant="h4">{selectedItem.first_name} {selectedItem.last_name}</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={selectedItem.gender} />
                      <Chip label={`${calculateAge(selectedItem.date_of_birth)} years`} />
                      {selectedItem.blood_group && <Chip label={selectedItem.blood_group} color="error" />}
                    </Stack>
                  </Box>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{color:theme.palette.primary[100]}} gutterBottom>Personal Information</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography><strong>ID:</strong> {selectedItem.code}</Typography>
                      <Typography><strong>Phone:</strong> {selectedItem.phone_number || 'N/A'}</Typography>
                      <Typography><strong>Email:</strong> {selectedItem.email || 'N/A'}</Typography>
                      <Typography><strong>Address:</strong> {selectedItem.address || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{color:theme.palette.primary[100]}} gutterBottom>Medical Information</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography><strong>Blood Pressure:</strong> {selectedItem.bp || 'N/A'}</Typography>
                      <Typography><strong>Allergies:</strong> {selectedItem.allergies || 'None'}</Typography>
                      <Typography><strong>Notes:</strong> {selectedItem.remark || 'None'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
          </>
        );
      case 'appointments':
        return (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{color:theme.palette.primary[100]}}>Appointment Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="h4">{selectedItem.notes}</Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Details</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography><strong>Patient:</strong> {patients.find(patient => patient.id === selectedItem.patientId)?.first_name || 'Unknown'}</Typography>
                      <Typography><strong>Date:</strong> {new Date(selectedItem.createdAt).toLocaleString()}</Typography>
                      <Typography>
                        <strong>Duration:</strong>
                        {calculateDuration(selectedItem.start_time, selectedItem.end_time)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Status</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography>
                        <strong>Status:</strong>
                        <Chip label={selectedItem.status} sx={{ ml: 1 }} color={
                          selectedItem.status === 'Completed' ? 'success' :
                            selectedItem.status === 'Cancelled' ? 'error' : 'warning'
                        } />
                      </Typography>
                      <Typography><strong>Notes:</strong> {selectedItem.notes || 'None'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
          </>
        );
      case 'employees':
        return (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{color:theme.palette.primary[100]}}>Staff Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar src={avatar1} sx={{ width: 100, height: 100 }} />
                  <Box>
                    <Typography variant="h4">{selectedItem.firstname} {selectedItem.lastname}</Typography>
                    <Typography variant="h6" color="text.secondary">{selectedItem.specialization}</Typography>
                  </Box>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{color:theme.palette.primary[100]}} gutterBottom>Contact Information</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography><strong>Email:</strong> {selectedItem.email}</Typography>
                      <Typography><strong>Phone:</strong> {selectedItem.phonenumber || 'N/A'}</Typography>
                      <Typography><strong>Experience:</strong> {selectedItem.yearsofexperience || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{color:theme.palette.primary[100]}} gutterBottom>Employment Details</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography><strong>Specialization:</strong> {selectedItem.specialization || 'N/A'}</Typography>
                      <Typography><strong>Hire Date:</strong> {selectedItem.createdat ? new Date(selectedItem.createdat).toLocaleDateString() : 'N/A'}</Typography>
                      <Typography><strong>Status:</strong>
                        <Chip label={selectedItem.status || 'Active'}  color={
                          (selectedItem.status || 'Active').toLowerCase() === 'available'
                            ? 'success'
                            : 'warning'
                        } size="small" />
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
          </>
        );
      case 'earnings':
        return (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{color:theme.palette.primary[100]}}>Test Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="h4">{selectedItem.name}</Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{color:theme.palette.primary[100]}} gutterBottom>Test Information</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography><strong>Patient:</strong> {patients.find((pa)=>pa.id===selectedItem.patientid)?.first_name}.</Typography>
                      <Typography><strong>Date:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}</Typography>
                      <Typography><strong>Status:</strong> <Chip label={selectedItem.status} color="success" size="small" /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{color:theme.palette.primary[100]}} gutterBottom>Financial Details</Typography>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                      <Typography><strong>Amount:</strong> {selectedItem.price} Birr</Typography>
                      <Typography><strong>Payment Method:</strong> {selectedItem.paymentMethod || 'Cash'}</Typography>
                      <Typography><strong>Payment Status:</strong> <Chip label="Paid" color="success" size="small" /></Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {viewMode === 'dashboard' ? (
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2,color:theme.palette.primary[100] }}>
              Clinic Dashboard Overview
            </Typography>
          </Grid>

          {/* Analytics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              active={activeStatCard === 'patients'}
              onClick={() => handleStatCardClick('patients')}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 56, height: 56 }}>
                    <AccountCircle fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Patients
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {patients.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              active={activeStatCard === 'appointments'}
              onClick={() => handleStatCardClick('appointments')}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.light, width: 56, height: 56 }}>
                    <DateRange fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Appointments
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {appointments.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              active={activeStatCard === 'employees'}
              onClick={() => handleStatCardClick('employees')}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: theme.palette.success.light, width: 56, height: 56 }}>
                    <People fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Staff Members
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {employees.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              active={activeStatCard === 'earnings'}
              onClick={() => handleStatCardClick('earnings')}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.light, width: 56, height: 56 }}>
                    <AttachMoney fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Earnings
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {totalEarning.toLocaleString()} Birr
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          {/* Charts Section */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{color:theme.palette.primary[100],mb:'14px'}} gutterBottom>
                  Monthly Patient Registrations
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patients" fill="#3295a8" name="Patients" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{color:theme.palette.primary[100]}} gutterBottom>
                  Patient Demographics
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Male', value: patients.filter(p => p.gender === 'Male').length },
                          { name: 'Female', value: patients.filter(p => p.gender === 'Female').length },
                          { name: 'Active', value: patients.filter(p => p.application_fee === 'Active').length },
                          { name: 'Inactive', value: patients.filter(p => p.application_fee === 'Expired').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#4285F4" stroke="#fff" strokeWidth={1} /> {/* Male - Google Blue */}
                        <Cell fill="#EA4335" stroke="#fff" strokeWidth={1} /> {/* Female - Google Red */}
                        <Cell fill="#34A853" stroke="#fff" strokeWidth={1} /> {/* Active - Google Green */}
                        <Cell fill="#FBBC05" stroke="#fff" strokeWidth={1} /> {/* Inactive - Google Yellow */}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} patients`, name]}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Patients Preview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="boody2" sx={{ color:theme.palette.primary[100]}}>Recent Patients</Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleStatCardClick('patients')}
                    startIcon={<People />}
                  >
                    View All Patients
                  </Button>
                </Stack>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {patients.slice(0, 6).map((patient) => (
                      <Grid item xs={12} sm={6} md={4} key={patient.id}>
                        <Card onClick={() => {
                          setSelectedItem(patient);
                          setDataType('patients');
                          setOpenDialog(true);
                        }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar src={avatar1} sx={{ width: 60, height: 60 }} />
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {patient.first_name} {patient.last_name}
                                </Typography>
                                <Stack direction="row" spacing={1} mt={1}>
                                  <Chip label={patient.gender} size="small" />
                                  {patient.blood_group && (
                                    <Chip label={patient.blood_group} size="small" color="error" />
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* Data List View */
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => {
                  setViewMode('dashboard');
                  setActiveStatCard(null);
                }}
                variant="outlined"
                sx={{
                  color:theme.palette.primary[100]
                }}
              >
                Back to Dashboard
              </Button>

              <Typography variant="h5" sx={{color:theme.palette.primary[100]}} fontWeight={700}>
                {dataType === 'patients' && 'All Patients'}
                {dataType === 'appointments' && 'All Appointments'}
                {dataType === 'employees' && 'All Staff Members'}
                {dataType === 'earnings' && 'Earnings Report'}
              </Typography>

              <TextField
                variant="outlined"
                size="small"
                placeholder={`Search ${dataType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Stack>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {renderDataTable()}

                {displayData.length === 0 && (
                  <Box display="flex" justifyContent="center" p={3}>
                    <Typography variant="body1" color="text.secondary">
                      No {dataType} found
                    </Typography>
                  </Box>
                )}

                {displayData.length > rowsPerPage && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={count}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        {renderDetailDialog()}
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => {
              setOpenDialog(false);
              Swal.fire({
                title: "Export in Progress",
                text: "The PDF export feature will be available soon!",
                icon: "info",
                showClass: {
                  popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
                },
                hideClass: {
                  popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
                },
                showConfirmButton: true,
                confirmButtonText: "Got it!",
                confirmButtonColor: "#3085d6",
              });
            }
          }
            sx={{ mr: 1 }}
          >
            Export as PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}