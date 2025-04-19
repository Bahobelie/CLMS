import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, IconButton, Button, ButtonGroup, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import {
  ChevronLeft, ChevronRight,
  ViewModule as MonthIcon,
  CalendarToday as WeekIcon,
  AccessTime as DayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Swal from 'sweetalert2';

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const suffix = i < 12 ? 'am' : 'pm';
  return `${hour}:00 ${suffix}`;
});

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 const TypeDoctor = 83; //['Dr. Abebe', 'Dr. Alemu', 'Dr. Selam', 'Dr. Tigist'];

const AppointmentCalendar = ({ patient }) => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const [view, setView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentCode, setAppointmentCode] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctors,setDoctors]=useState([]);

  const [newAppointment, setNewAppointment] = useState({
    start_time: '',
    end_time: '',
    status: 'pending',
    time: '12:00 pm', // Default time
    date: '',
    notes: '',
    patientId: patient?.id || '',
    code: '',
    doctor: doctors[0]
  });

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const params = patient?.id ? { patientId: patient.id } : {};
        const response = await axios.get(`${apiUrl}/appointments`, { params });
        const doctor=await axios.get(`${apiUrl}/employees/by-condition`, {
          params:{
            type:TypeDoctor
          }
        });
        setAppointments(response.data);
        setDoctors(doctor.data)

      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    // Get the next appointment code
    const fetchAppointmentCode = async () => {
      try {
        const response = await axios.get(`${apiUrl}/model/next-code`, {
          params: {
            model: `Appointment`,
            prefix: 'APPT-'
          }
        });
        setAppointmentCode(response.data.code);
      } catch (error) {
        console.error('Error fetching appointment code:', error);
      }
    };

    fetchAppointments();
    fetchAppointmentCode();
  }, [openDialog, openEditDialog, patient]);

  // Update patientId when patient prop changes
  useEffect(() => {
    if (patient?.id) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: patient.id
      }));
    }
  }, [patient]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    setSelectedTime('');
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setOpenEditDialog(false);
    setNewAppointment({
      start_time: '',
      end_time: '',
      status: 'pending',
      time: '12:00 pm',
      date: '',
      notes: '',
      patientId: patient?.id || '',
      code: '',
      doctor: doctors[0]
    });
  };

  const formattedDate = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
    ...(view === 'week' && { day: 'numeric' })
  });

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (view === 'month') {
      setCurrentDate(date);
      setView('day');
    }
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    const [hour, suffix] = time.split(' ');
    let hours = parseInt(hour);
    if (suffix === 'pm' && hours !== 12) hours += 12;
    if (suffix === 'am' && hours === 12) hours = 0;

    const newDate = new Date(selectedDate);
    newDate.setHours(hours, 0, 0, 0);
    setSelectedDate(newDate);

    setNewAppointment({
      ...newAppointment,
      date: newDate.toISOString().split('T')[0],
      time: time,
      start_time: newDate.toISOString(),
      end_time: new Date(newDate.getTime() + 30 * 60000).toISOString()
    });
    setOpenDialog(true);
  };

  const handleAppointmentClick = (appointment, e) => {
    e.stopPropagation(); // Stop event propagation
    setSelectedAppointment(appointment);
    // Set the current values in newAppointment state for editing
    setNewAppointment({
      ...newAppointment,
      status: appointment.status,
      notes: appointment.notes,
      doctor: appointment.doctor || doctors[0]
    });
    setOpenEditDialog(true);
  };

  const handleAddAppointment = async () => {
    try {
      if (!newAppointment.start_time || !patient?.id) {
        await Swal.fire({
          title: 'Error!',
          text: 'Please select a date and time',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }

      const appointment = {
        code: appointmentCode,
        patientId: patient.id,
        start_time: newAppointment.start_time,
        end_time: newAppointment.end_time,
        status: newAppointment.status,
        notes: newAppointment.notes || '',
        doctorid: newAppointment.doctor.id
      };

      console.log('docror',newAppointment.doctor)

      await axios.post(`${apiUrl}/appointments`, appointment);

      setOpenDialog(false);
      await Swal.fire({
        title: 'Success!',
        text: 'Appointment created successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      handleCancel();
    } catch (error) {
      setOpenDialog(false);

      console.error('Error creating appointment:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to create appointment',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      if (!selectedAppointment) return;

      const updatedAppointment = {
        ...selectedAppointment,
        status: newAppointment.status,
        notes: newAppointment.notes,
        doctor: newAppointment.doctor
      };

      await axios.put(`${apiUrl}/appointments/${selectedAppointment.id}`, updatedAppointment);

      setOpenEditDialog(false);
      await Swal.fire({
        title: 'Success!',
        text: 'Appointment updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      handleCancel();
    } catch (error) {
      console.error('Error updating appointment:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to update appointment',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDeleteAppointment = async () => {
    setOpenEditDialog(false);
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (!result.isConfirmed || !selectedAppointment) return;

      // Close the modal immediately before async operations

      // Perform the deletion
      await axios.delete(`${apiUrl}/appointments/${selectedAppointment.id}`);

      // Refresh appointments
      const response = await axios.get(`${apiUrl}/appointments`, {
        params: patient?.id ? { patientId: patient.id } : {}
      });
      setAppointments(response.data);

      // Show success message after everything is done
      await Swal.fire(
        'Deleted!',
        'Appointment has been deleted.',
        'success'
      );

    } catch (error) {
      console.error('Error deleting appointment:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete appointment',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = formatDate(date);
    return appointments.filter(appt => {
      const apptDate = new Date(appt.start_time).toISOString().split('T')[0];
      return apptDate === dateStr && (!patient || appt.patientId === patient.id);
    });
  };

  // Get appointments for a specific time slot
  const getAppointmentsForTime = (date, time) => {
    const dateStr = formatDate(date);
    const [hourStr, , period] = time.split(' ');
    let hour = parseInt(hourStr);
    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    return appointments.filter(appt => {
      const apptDate = new Date(appt.start_time);
      const apptHour = apptDate.getHours();
      const apptDateStr = formatDate(apptDate);

      return (
        apptDateStr === dateStr &&
        apptHour === hour &&
        (!patient || appt.patientId === patient.id)
      );
    });
  };

  // Format time from ISO string to 12-hour format
  const formatTimeFromISO = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Render appointment card
  const renderAppointmentCard = (appt) => (
    <Paper
      sx={{
        p: 1,
        bgcolor: 'primary.100',
        '&:hover': {
          bgcolor: 'primary.200',
          cursor: 'pointer'
        }
      }}
      onClick={(e) => handleAppointmentClick(appt,e)}
    >
      <Typography variant="body2">
        {patient?.first_name || `Patient ${appt.patientId}`}
      </Typography>
      <Typography variant="caption">{formatTimeFromISO(appt.start_time)}</Typography>
      {appt.doctor && (
        <Typography variant="caption" display="block">{appt.doctor}</Typography>
      )}
      {appt.notes && (
        <Typography variant="caption" display="block">{appt.notes}</Typography>
      )}
    </Paper>
  );

  // Render day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <Paper sx={{ mt: 2 }}>
        {timeSlots.map((slot, i) => {
          const slotAppointments = getAppointmentsForTime(currentDate, slot);
          return (
            <Box
              key={i}
              sx={{
                height: 50,
                borderBottom: '1px solid #ccc',
                px: 2,
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: 'primary.50',
                  cursor: 'pointer'
                }
              }}
              onClick={() => handleTimeClick(slot)}
            >
              <Typography width={100} variant="body2">{slot}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {slotAppointments.map((appt, idx) => (
                  <Box key={idx}>
                    {renderAppointmentCard(appt)}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Paper>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <Paper sx={{ mt: 2 }}>
        <Grid container sx={{ borderBottom: '1px solid #ccc', p: 1 }}>
          {weekDays.map((day, i) => (
            <Grid item xs key={i}>
              <Typography align="center" fontWeight="bold">
                {daysOfWeek[i]} {day.getDate()}
              </Typography>
            </Grid>
          ))}
        </Grid>
        {timeSlots.slice(0, 12).map((slot, i) => (
          <Grid container key={i} sx={{ borderBottom: '1px solid #eee', height: 50 }}>
            {weekDays.map((day, j) => {
              const dayAppointments = getAppointmentsForTime(day, slot);
              return (
                <Grid
                  item
                  xs
                  key={j}
                  sx={{
                    borderRight: '1px solid #f0f0f0',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => {
                    setSelectedDate(day);
                    handleTimeClick(slot);
                  }}
                >
                  {dayAppointments.map((appt, k) => (
                    <Box key={k}>
                      {renderAppointmentCard(appt)}
                    </Box>
                  ))}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Paper>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    const blankStart = start.getDay();

    return (
      <Paper sx={{ mt: 2 }}>
        <Grid container sx={{ borderBottom: '1px solid #ccc', p: 1 }}>
          {daysOfWeek.map(day => (
            <Grid item xs key={day}>
              <Typography align="center" fontWeight="bold">{day}</Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container flexWrap="wrap">
          {[...Array(blankStart)].map((_, i) => (
            <Grid item xs key={`blank-${i}`} sx={{ height: 80 }} />
          ))}
          {days.map((date, i) => {
            const dateAppointments = getAppointmentsForDate(date);
            return (
              <Grid
                item
                xs
                key={i}
                sx={{
                  border: '1px solid #eee',
                  height: 80,
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleDateClick(date)}
              >
                <Typography variant="body2">{date.getDate()}</Typography>
                <Box sx={{ overflow: 'hidden', maxHeight: 60 }}>
                  {dateAppointments.slice(0, 2).map((appt, j) => (
                    <Box key={j}>
                      {renderAppointmentCard(appt)}
                    </Box>
                  ))}
                  {dateAppointments.length > 2 && (
                    <Typography variant="caption">+{dateAppointments.length - 2} more</Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        {/* Header */}
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h4" sx={{ color: theme.palette.primary[100] }} fontWeight="bold">
              Appointments {patient ? `for ${patient.first_name || patient.name}` : ''}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              sx={{
                borderColor: theme.palette.primary[100],
                color: theme.palette.primary[100],
              }}
              onClick={handleToday}
              variant="outlined"
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Grid container alignItems="center" spacing={1}>
              <IconButton onClick={handlePrev}><ChevronLeft /></IconButton>
              <Typography variant="h6" fontWeight="bold">{formattedDate}</Typography>
              <IconButton onClick={handleNext}><ChevronRight /></IconButton>
            </Grid>
          </Grid>
          <Grid item>
            <ButtonGroup variant="outlined">
              <Button
                onClick={() => setView('month')}
                variant={view === 'month' ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: view === 'month' ? theme.palette.primary[100] : 'transparent',
                  borderColor: theme.palette.primary[100],
                  color: view === 'month' ? theme.palette.primary.contrastText : theme.palette.primary[100],
                  '&:hover': {
                    borderColor: view === 'month' ? theme.palette.primary.dark : theme.palette.primary[100],
                    color: view === 'month' ? theme.palette.primary.contrastText : theme.palette.primary[100],
                  },
                }}
              >
                <MonthIcon />
              </Button>
              <Button
                onClick={() => setView('week')}
                variant={view === 'week' ? 'contained' : 'outlined'}
                sx={{
                  borderColor: theme.palette.primary[100],
                  backgroundColor: view === 'week' ? theme.palette.primary[100] : 'transparent',
                  color: view === 'week' ? theme.palette.primary.contrastText : theme.palette.primary[100],
                  '&:hover': {
                    borderColor: view === 'week' ? theme.palette.primary.dark : theme.palette.secondary.dark,
                    color: view === 'week' ? theme.palette.primary[100] : theme.palette.primary[100],
                  },
                }}
              >
                <WeekIcon />
              </Button>
              <Button
                onClick={() => setView('day')}
                variant={view === 'day' ? 'contained' : 'outlined'}
                sx={{
                  borderColor: theme.palette.primary[100],
                  backgroundColor: view === 'day' ? theme.palette.primary[100] : 'transparent',
                  color: view === 'day' ? theme.palette.primary.contrastText : theme.palette.primary[100],
                  '&:hover': {
                    borderColor: view === 'day' ? theme.palette.primary.dark : theme.palette.secondary.dark,
                    color: view === 'day' ? theme.palette.primary.contrastText : theme.palette.primary[100],
                  },
                }}
              >
                <DayIcon />
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                backgroundColor: theme.palette.primary[100],
                '&:hover': {
                  backgroundColor: theme.palette.primary[100]
                }
              }}
            >
              New Appointment
            </Button>
          </Grid>
        </Grid>

        {/* View Content */}
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}

        {/* Add Appointment Dialog */}
        <Dialog open={openDialog} onClose={handleCancel} fullWidth maxWidth="sm">
          <DialogTitle sx={{ textAlign: 'center', color: theme.palette.primary[100], fontSize: '24px' }}>
            Add New Appointment
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Appointment Code"
                value={appointmentCode}
                disabled
                fullWidth
              />

              {patient && (
                <TextField
                  label="Patient"
                  value={patient.first_name || patient.name || `Patient ${patient.id}`}
                  disabled
                  fullWidth
                />
              )}

              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  setNewAppointment(prev => ({
                    ...prev,
                    date: newValue.toISOString().split('T')[0]
                  }));
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <TextField
                select
                label="Start Time"
                value={newAppointment.time}
                onChange={(e) => {
                  const time = e.target.value;
                  const [hour, suffix] = time.split(' ');
                  let hours = parseInt(hour);
                  if (suffix === 'pm' && hours !== 12) hours += 12;
                  if (suffix === 'am' && hours === 12) hours = 0;

                  const newDate = new Date(selectedDate);
                  newDate.setHours(hours, 0, 0, 0);

                  setNewAppointment(prev => ({
                    ...prev,
                    time: time,
                    start_time: newDate.toISOString(),
                    end_time: new Date(newDate.getTime() + 30 * 60000).toISOString()
                  }));
                }}
                SelectProps={{ native: true }}
                fullWidth
              >
                {timeSlots.map((slot, index) => (
                  <option key={index} value={slot}>
                    {slot}
                  </option>
                ))}
              </TextField>

              <TextField
                select
                label="Doctor"
                value={newAppointment.doctor}
                onChange={(e) => setNewAppointment(prev => ({
                  ...prev,
                  doctor: e.target.value
                }))}
                SelectProps={{ native: true }}
                fullWidth
              >
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor.id}>
                    Dr. {doctor.firstname}
                  </option>
                ))}
              </TextField>

              <TextField
                select
                label="Status"
                value={newAppointment.status}
                onChange={(e) => setNewAppointment(prev => ({
                  ...prev,
                  status: e.target.value
                }))}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </TextField>

              <TextField
                label="Notes"
                multiline
                rows={3}
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              onClick={handleAddAppointment}
              variant="contained"
              disabled={!newAppointment.start_time || !patient?.id}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Appointment Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ textAlign: 'center', color: theme.palette.primary[100], fontSize: '24px' }}>
            Edit Appointment
          </DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Appointment Code"
                  value={selectedAppointment.code}
                  disabled
                  fullWidth
                />

                {patient && (
                  <TextField
                    label="Patient"
                    value={patient.first_name || patient.name || `Patient ${patient.id}`}
                    disabled
                    fullWidth
                  />
                )}

                <TextField
                  label="Date & Time"
                  value={`${new Date(selectedAppointment.start_time).toLocaleDateString()} ${formatTimeFromISO(selectedAppointment.start_time)}`}
                  fullWidth
                />

                <TextField
                  select
                  label="Doctor"
                  value={newAppointment.doctor || selectedAppointment.doctor}
                  onChange={(e) => setNewAppointment(prev => ({
                    ...prev,
                    doctor: e.target.value
                  }))}
                  SelectProps={{ native: true }}
                  fullWidth
                >
                  {doctors.map((doctor, index) => (
                    <option key={index} value={doctor}>
                      Dr.{doctor.firstname}
                    </option>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Status"
                  value={newAppointment.status || selectedAppointment.status}
                  onChange={(e) => setNewAppointment(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  SelectProps={{ native: true }}
                  fullWidth
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </TextField>

                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  value={newAppointment.notes || selectedAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  fullWidth
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDeleteAppointment}
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateAppointment}
              variant="contained"
              startIcon={<EditIcon />}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentCalendar;