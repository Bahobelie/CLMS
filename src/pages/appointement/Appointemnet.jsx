import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, IconButton, Button, ButtonGroup, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  FormControl, InputLabel, Select, Tooltip, Zoom, Chip
} from '@mui/material';
import {
  ChevronLeft, ChevronRight,
  ViewModule as MonthIcon,
  CalendarToday as WeekIcon,
  AccessTime as DayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Swal from 'sweetalert2';
import { format, isSameDay, isSameMonth, startOfWeek, addDays, addMonths, subMonths, getDay, isWithinInterval } from 'date-fns';

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12; // Convert 0 to 12 for 12-hour format
  const suffix = i < 12 ? 'am' : 'pm';
  return `${hour}:00 ${suffix}`;
}).filter((_, i) => i % 2 === 0); // Only show even hours if you want 12 slots

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
  postponed: 'secondary'
};

const AppointmentCalendar = ({ patient }) => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  // State management
  const [view, setView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentCode, setAppointmentCode] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [showFilters,setShowFilters] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    start_time: '',
    end_time: '',
    status: 'pending',
    time: '12:00 pm',
    date: '',
    notes: '',
    patientId: patient?.id || '',
    code: '',
    doctor: null
  });

  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    // endDate: null,
    isActive: false
  });

  // Color theme variables
  const primaryColor = theme.palette.primary[100];
  const primaryLight = theme.palette.primary[50];
  const primaryDark = theme.palette.primary[200];
  const textOnPrimary = '#ffffff';
  const hoverBg = theme.palette.primary[50];
  const borderColor = theme.palette.divider;

  // Fetch appointments with applied filters
  const fetchAppointments = useCallback(async () => {
    try {
      const params = patient?.id ? { patientId: patient.id } : {};

      if (dateFilter.isActive && (dateFilter.startDate)) {
        const formatDateForAPI = (date) => {
          if (!date) return null;
          return format(date, 'yyyy-MM-dd');
        };

        const startDate = formatDateForAPI(dateFilter.startDate);

        if (startDate) {
          params.start_time = `>=${startDate}T00:00:00`;
        }
      }

      const response = await axios.get(`${apiUrl}/appointments/by-condition`, {
        params
      });

      const TypeDoctor = await axios.get(`${apiUrl}/systemConstants/by-condition`, {
        params:{
          type:'Role',
          name:'Doctor'
        }
      });

      const doctorResponse = await axios.get(`${apiUrl}/employees/by-condition`, {
        params: { type: TypeDoctor.data[0].id }
      });

      console.log('response',TypeDoctor.data[0].id);

      setAppointments(response.data);
      setDoctors(doctorResponse.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch appointments',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }, [patient?.id, apiUrl, dateFilter.isActive, dateFilter.startDate]);
  // Initial data fetching
  useEffect(() => {
    const fetchAppointmntCode=async ()=>{
      try {
        const response = await axios.get(`${apiUrl}/model/next-code`, {
          params: {
            model: `Appointment`,
            prefix: 'APPT-'
          }
        });
        setAppointmentCode(response.data.code)
      } catch (error)
      {
        console.log(error)
      }
    }
    fetchAppointmntCode()
    fetchAppointments();
  }, [fetchAppointments, apiUrl]);

  // Set default doctor if patient exists
  useEffect(() => {
    if (patient?.id && doctors.length > 0) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: patient.id,
        doctor: doctors[0]
      }));
    }
  }, [patient, doctors]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate(prevDate => {
      if (view === 'month') return subMonths(prevDate, 1);
      if (view === 'week') return addDays(prevDate, -7);
      return addDays(prevDate, -1);
    });
  };

  const handleNext = () => {
    setCurrentDate(prevDate => {
      if (view === 'month') return addMonths(prevDate, 1);
      if (view === 'week') return addDays(prevDate, 7);
      return addDays(prevDate, 1);
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setSelectedTime('');
  };

  // Appointment CRUD operations
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

    setNewAppointment({
      ...newAppointment,
      date: format(newDate, 'yyyy-MM-dd'),
      time: time,
      start_time: newDate.toISOString(),
      end_time: new Date(newDate.getTime() + 30 * 60000).toISOString()
    });
    setOpenDialog(true);
  };

  const handleAppointmentClick = (appointment, e) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
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
          const response = await axios.get(`${apiUrl}/model/next-code`, {
            params: {
              model: `Appointment`,
              prefix: 'APPT-'
            }
          });

      setAppointmentCode(response.data.code)

      const appointment = {
        code: response.data.code,
        patientId: patient.id,
        start_time: newAppointment.start_time,
        end_time: newAppointment.end_time,
        status: newAppointment.status,
        notes: newAppointment.notes || '',
        doctorid: newAppointment.doctor?.id
      };

      await axios.post(`${apiUrl}/appointments`, appointment);
      setOpenDialog(false);
      await Swal.fire({
        title: 'Success!',
        text: 'Appointment created successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      await fetchAppointments();
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
        doctorid: newAppointment.doctor?.id
      };

      await axios.put(`${apiUrl}/appointments/${selectedAppointment.id}`, updatedAppointment);

      setOpenEditDialog(false);
      await Swal.fire({
        title: 'Success!',
        text: 'Appointment updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      await fetchAppointments();
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

      await axios.delete(`${apiUrl}/appointments/${selectedAppointment.id}`);
      Swal.fire(
        'Deleted!',
        'Appointment has been deleted.',
        'success'
      );
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete appointment',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  // Date filtering functions
  const handleApplyDateFilter = () => {
    if (dateFilter.startDate) {
      setDateFilter(prev => ({ ...prev, isActive: true }));
      // Force a re-render by updating currentDate
      setCurrentDate(new Date(dateFilter.startDate));
    }
  };

  const handleClearDateFilter = () => {
    setDateFilter({ startDate: null,Active: false });
    // Force a re-render by updating currentDate
    setCurrentDate(new Date(currentDate));
  };

  // Utility functions
  const formatTimeFromISO = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return format(date, 'h:mm a');
  };

  function getDayOfWeek(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

// Updated filtering functions
  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const appointmentsArray = Array.isArray(appointments) ? appointments : []; // Ensure appointments is an array
    return appointmentsArray.filter(appt => {
      const apptDate = new Date(appt.start_time);
      const apptDateStr = format(apptDate, 'yyyy-MM-dd');

      // Check if appointment matches the date
      const dateMatch = apptDateStr === dateStr;

      // Check if appointment matches patient filter
      const patientMatch = !patient || appt.patientId === patient.id;

      // Check if appointment matches date range filter
      let dateRangeMatch = true;
      if (dateFilter.isActive) {
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null; // Add this line

        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
          dateRangeMatch = dateRangeMatch && apptDate >= startDate;
        }
        if (endDate) { // Add this block
          endDate.setHours(23, 59, 59, 999);
          dateRangeMatch = dateRangeMatch && apptDate <= endDate;
        }
      }

      return dateMatch && patientMatch && dateRangeMatch;
    });
  };


  const getAppointmentsForTimeSlot = (date, startTime, endTime) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const appointmentsArray = Array.isArray(appointments) ? appointments : [];
    return appointmentsArray.filter(appt => {
      const apptDate = new Date(appt.start_time);
      const apptDateStr = format(apptDate, 'yyyy-MM-dd');

      // Check if appointment matches the date
      const dateMatch = apptDateStr === dateStr;

      // Check if appointment matches patient filter
      const patientMatch = !patient || appt.patientId === patient.id;

      // Check if appointment matches date range filter
      let dateRangeMatch = true;
      if (dateFilter.isActive) {
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;

        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
          dateRangeMatch = dateRangeMatch && apptDate >= startDate;
        }
      }

      return dateMatch && patientMatch && dateRangeMatch;
    }).filter(appt => {
      const apptStart = new Date(appt.start_time);
      const apptEnd = new Date(appt.end_time);
      const apptDateStr = format(apptStart, 'yyyy-MM-dd');

      // Parse the time slot
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const slotStart = new Date(date);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      // Check if appointment is on the same day
      const sameDay = apptDateStr === dateStr;

      // Check if appointment overlaps with time slot
      const overlaps = (apptStart < slotEnd && apptEnd > slotStart);

      // Check if appointment matches patient filter
      const patientMatch = !patient || appt.patientId === patient.id;

      // Check if appointment matches date range filter
      let dateRangeMatch = true;
      if (dateFilter.isActive) {
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;

        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
          dateRangeMatch = dateRangeMatch && apptStart >= startDate;
        }
      }

      return sameDay && overlaps && patientMatch && dateRangeMatch;
    });

  };
  // View rendering functions
  const renderAppointmentCard = (appt) => {
    const doctor = doctors.find((doc) => doc.id === appt.doctorid);
    return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2">Dr. { doctor?.firstname} {doctor.lastname || 'N/A'}</Typography>
          <Typography variant="caption" display="block">
           Day: {getDayOfWeek(appt.start_time)}
          </Typography>
          <Typography variant="caption" display="block">
           Time: {formatTimeFromISO(appt.start_time)} - {formatTimeFromISO(appt.end_time)}
          </Typography>

          {appt.notes && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Notes: {appt.notes}
            </Typography>
          )}
          <Chip
            label={appt.status}
            size="small"
            color={statusColors[appt.status] || 'default'}
            sx={{ mt: 1 }}
          />
        </Box>
      }
      TransitionComponent={Zoom}
      placement="top"
      key={appt.id}
    >
      <Paper
        sx={{
          p: 0.75,
          mb: 0.5,
          bgcolor: primaryColor,
          color: textOnPrimary,
          fontSize: '0.8rem',
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: primaryDark,
          }
        }}
        onClick={(e) => handleAppointmentClick(appt, e)}
      >
        {patient?.first_name || `Patient ${appt.patientId}`}
        {appt.doctor && (
          <Typography variant="caption" sx={{ display: 'block' }}>
            Dr. {appt.doctor.firstname} {appt.doctor.lastname}
          </Typography>
        )}
      </Paper>
    </Tooltip>
  )};

  const renderDayView = () => (
    <Paper sx={{ mt: 2, border: `1px solid ${borderColor}` }}>
      {timeSlots.map((slot, i) => {
        const [hourStr, suffix] = slot.split(' ');
        let hour = parseInt(hourStr);
        if (suffix === 'pm' && hour !== 12) hour += 12;
        if (suffix === 'am' && hour === 12) hour = 0;
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const slotAppointments = getAppointmentsForTimeSlot(currentDate, startTime, endTime);

        return (
          <Box
            key={i}
            sx={{
              height: 60,
              borderBottom: `1px solid ${borderColor}`,
              px: 2,
              display: 'flex',
              alignItems: 'flex-start',
              '&:hover': {
                backgroundColor: hoverBg,
                cursor: 'pointer'
              }
            }}
            onClick={() => handleTimeClick(slot)}
          >
            <Typography width={100} variant="subtitle2" color="text.secondary">{slot}</Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {slotAppointments.map(appt => renderAppointmentCard(appt))}
            </Box>
          </Box>
        );
      })}
    </Paper>
  );

  const renderWeekView = () => {
    const startOfCurrentWeek = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    return (
      <Paper sx={{ mt: 2, border: `1px solid ${borderColor}` }}>
        <Grid container sx={{ borderBottom: `1px solid ${borderColor}` }}>
          {weekDays.map((day, i) => (
            <Grid item xs key={i} sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">{daysOfWeek[i]}</Typography>
              <Typography variant="caption">{format(day, 'd')}</Typography>
            </Grid>
          ))}
        </Grid>
        {timeSlots.map((slot, i) => {
          const [hourStr, suffix] = slot.split(' ');
          let hour = parseInt(hourStr);
          if (suffix === 'pm' && hour !== 12) hour += 12;
          if (suffix === 'am' && hour === 12) hour = 0;
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

          return (
            <Grid container key={i} sx={{ borderBottom: `1px solid ${borderColor}`, minHeight: 60 }}>
              {weekDays.map((day, j) => {
                const dayAppointments = getAppointmentsForTimeSlot(day, startTime, endTime);
                return (
                  <Grid
                    item
                    xs
                    key={j}
                    sx={{
                      p: 0.5,
                      borderRight: `1px solid ${borderColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      '&:hover': {
                        backgroundColor: hoverBg,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handleTimeClick(slot)}
                  >
                    {dayAppointments.map(appt => renderAppointmentCard(appt))}
                  </Grid>
                );
              })}
            </Grid>
          );
        })}
      </Paper>
    );
  };

  const renderMonthView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfWeek(firstDayOfMonth);
    const endDate = addDays(lastDayOfMonth, 6 - getDay(lastDayOfMonth));
    const totalDays = (endDate.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const calendarDays = Array.from({ length: totalDays }, (_, i) => addDays(startDay, i));

    return (
      <Grid container spacing={1} mt={2}>
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayAppointments = getAppointmentsForDate(day);

          return (
            <Grid item xs={12 / 7} key={day} sx={{
              height: 100,
              border: `1px solid ${borderColor}`,
              overflow: 'hidden',
              backgroundColor: isCurrentMonth ? 'background.paper' : 'action.hover'
            }}>
              <Box
                sx={{
                  p: 0.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  backgroundColor: isSameDay(day, new Date()) ? primaryColor : 'transparent',
                  color: isSameDay(day, new Date()) ? textOnPrimary : 'inherit',
                  fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
                onClick={() => handleDateClick(day)}
              >
                <Typography variant="caption" color={!isCurrentMonth ? 'text.disabled' : 'inherit'}>
                  {format(day, 'd')}
                </Typography>
                {dayAppointments.length > 0 && (
                  <EventIcon sx={{ fontSize: 'small', color: primaryColor }} />
                )}
              </Box>
              <Box sx={{ p: 0.5, overflowY: 'auto', maxHeight: 80 }}>
                {dayAppointments.slice(0, 2).map(appt => renderAppointmentCard(appt))}
                {dayAppointments.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayAppointments.length - 2} more
                  </Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderFilterControls = () => (
    <Paper sx={{
      p: 2,
      mb: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      backgroundColor: primaryLight,
      flexWrap: 'wrap'
    }}>
      <DatePicker
        label="From Date"
        value={dateFilter.startDate}
        onChange={(newValue) => setDateFilter(prev => ({ ...prev, startDate: newValue }))}
        renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 180 }} />}
      />
      <Button
        onClick={handleApplyDateFilter}
        variant="contained"
        size="small"
        disabled={!dateFilter.startDate}
        sx={{
          backgroundColor: primaryColor,
          '&:hover': { backgroundColor: primaryDark },
          minWidth: 120
        }}
      >
        Apply Filter
      </Button>
      {dateFilter.isActive && (
        <Button
          onClick={handleClearDateFilter}
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          color="error"
          sx={{ minWidth: 120 }}
        >
          Clear Filter
        </Button>
      )}
      {dateFilter.isActive && (dateFilter.startDate ) && (
        <Chip
          label={
            dateFilter.startDate
              ? `${format(dateFilter.startDate, 'MMM d')}`
              :null
          }
          color="primary"
          size="small"
          sx={{ ml: 1 }}
        />
      )}
    </Paper>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        {/* Header with navigation controls */}
        <Grid container alignItems="center" justifyContent="space-between" spacing={2} mb={2}>
          <Grid item>
            <Typography variant="h4" sx={{ color: primaryColor }} fontWeight="bold">
              Appointments {patient ? `for ${patient.first_name || patient.name}` : ''}
            </Typography>
          </Grid>

          <Grid item>
            <ButtonGroup size="small" aria-label="navigation">
              <Button onClick={handlePrev} sx={{ color: primaryColor }}>
                <ChevronLeft />
              </Button>
              <Button disabled sx={{ color: 'text.primary' }}>
                {view === 'month' ? format(currentDate, 'MMMM yyyy') :
                  view === 'week' ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(addDays(startOfWeek(currentDate), 6), 'MMM d')}` :
                    format(currentDate, 'MMM d, yyyy')}
              </Button>
              <Button onClick={handleNext} sx={{ color: primaryColor }}>
                <ChevronRight />
              </Button>
              {/*<Button*/}
              {/*  onClick={handleToday}*/}
              {/*  sx={{ color: primaryColor }}*/}
              {/*>*/}
              {/*  Today*/}
              {/*</Button>*/}
            </ButtonGroup>
          </Grid>

          <Grid item>
            <ButtonGroup variant="outlined" size="small">
              <Button
                onClick={() => setView('week')}
                variant={view === 'week' ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: view === 'week' ? primaryColor : 'transparent',
                  color: view === 'week' ? textOnPrimary : primaryColor,
                  '&:hover': {
                    backgroundColor: view === 'week' ? primaryDark : primaryLight
                  }
                }}
              >
                <WeekIcon sx={{ mr: 0.5, fontSize: 'inherit' }} /> Week
              </Button>
              <Button
                onClick={() => setView('day')}
                variant={view === 'day' ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: view === 'day' ? primaryColor : 'transparent',
                  color: view === 'day' ? textOnPrimary : primaryColor,
                  '&:hover': {
                    backgroundColor: view === 'day' ? primaryDark : primaryLight
                  }
                }}
              >
                <DayIcon sx={{ mr: 0.5, fontSize: 'inherit' }} /> Day
              </Button>
              <Button
                onClick={() => setView('month')}
                variant={view === 'month' ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: view === 'month' ? primaryColor : 'transparent',
                  color: view === 'month' ? textOnPrimary : primaryColor,
                  '&:hover': {
                    backgroundColor: view === 'month' ? primaryDark : primaryLight
                  }
                }}
              >
                <MonthIcon sx={{ mr: 0.5, fontSize: 'inherit' }} /> Month
              </Button>
            </ButtonGroup>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setOpenDialog(true)}
              size="small"
              sx={{
                backgroundColor: primaryColor,
                color: textOnPrimary,
                '&:hover': {
                  backgroundColor: primaryDark
                }
              }}
            >
              New
            </Button>
          </Grid>

          <Grid item>
            <Tooltip title="Filter appointments">
              <IconButton
                onClick={() => setShowFilters(!showFilters)}  // Toggle visibility
                size="small"
                sx={{ color: dateFilter.isActive ? 'secondary.main' : primaryColor }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          {showFilters && renderFilterControls()}
        </Grid>



        {/* Calendar view */}
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}

        {/* Add Appointment Dialog */}
        <Dialog open={openDialog} onClose={handleCancel} fullWidth maxWidth="sm">
          <DialogTitle sx={{
            textAlign: 'center',
            color: primaryColor,
            fontSize: '1.5rem',
            backgroundColor: primaryLight,
            py: 2
          }}>
            Add New Appointment
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Appointment Code"
                value={appointmentCode}
                disabled
                fullWidth
                size="small"
              />

              {patient && (
                <TextField
                  label="Patient"
                  value={patient.first_name || patient.name || `Patient ${patient.id}`}
                  disabled
                  fullWidth
                  size="small"
                />
              )}

              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  setNewAppointment(prev => ({
                    ...prev,
                    date: format(newValue, 'yyyy-MM-dd')
                  }));
                }}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
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
                fullWidth
                size="small"
              >
                {timeSlots.map((slot, index) => (
                  <MenuItem key={index} value={slot}>{slot}</MenuItem>
                ))}
              </TextField>

              <FormControl fullWidth size="small">
                <InputLabel id="doctor-select-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-select-label"
                  id="doctor-select"
                  value={newAppointment.doctor?.id || ''}
                  label="Doctor"
                  onChange={(e) => {
                    const selectedDoctor = doctors.find(d => d.id === e.target.value);
                    setNewAppointment(prev => ({
                      ...prev,
                      doctor: selectedDoctor
                    }));
                  }}
                >
                  {Array.isArray(doctors) ? (
                    doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstname} {doctor.lastname}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">No doctors available</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  value={newAppointment.status}
                  label="Status"
                  onChange={(e) => setNewAppointment(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="postponed">Postponed</MenuItem>
                </Select>
              </FormControl>

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
                size="small"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancel}
              size="small"
              sx={{ color: primaryColor }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAppointment}
              variant="contained"
              disabled={!newAppointment.start_time || !patient?.id}
              size="small"
              sx={{
                backgroundColor: primaryColor,
                color: textOnPrimary,
                '&:hover': {
                  backgroundColor: primaryDark
                }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Appointment Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{
            textAlign: 'center',
            color: primaryColor,
            fontSize: '1.5rem',
            backgroundColor: primaryLight,
            py: 2
          }}>
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
                  size="small"
                />

                {patient && (
                  <TextField
                    label="Patient"
                    value={patient.first_name || patient.name || `Patient ${patient.id}`}
                    disabled
                    fullWidth
                    size="small"
                  />
                )}

                <DatePicker
                  label="Date"
                  value={new Date(selectedAppointment.start_time)}
                  onChange={(newValue) => {
                    const updatedDate = newValue;
                    const oldDate = new Date(selectedAppointment.start_time);
                    updatedDate.setHours(oldDate.getHours(), oldDate.getMinutes());
                    setSelectedAppointment(prev => ({
                      ...prev,
                      start_time: updatedDate.toISOString(),
                      end_time: new Date(updatedDate.getTime() + 30 * 60000).toISOString()
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />

                <TextField
                  select
                  label="Start Time"
                  value={formatTimeFromISO(selectedAppointment.start_time)}
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
                  fullWidth
                  size="small"
                >
                  {timeSlots.map((slot, index) => (
                    <MenuItem key={index} value={slot}>{slot}</MenuItem>
                  ))}
                </TextField>

                <FormControl fullWidth size="small">
                  <InputLabel id="edit-doctor-select-label">Doctor</InputLabel>
                  <Select
                    labelId="edit-doctor-select-label"
                    id="edit-doctor-select"
                    value={newAppointment.doctor?.id || selectedAppointment?.doctor?.id || ''}
                    label="Doctor"
                    onChange={(e) => {
                      const selectedDoctor = doctors.find(d => d.id === e.target.value);
                      setNewAppointment(prev => ({
                        ...prev,
                        doctor: selectedDoctor
                      }));
                    }}
                  >
                    {Array.isArray(doctors) ? (
                      doctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstname} {doctor.firstname}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">No doctors available</MenuItem>
                    )}

                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="edit-status-select-label">Status</InputLabel>
                  <Select
                    labelId="edit-status-select-label"
                    id="edit-status-select"
                    value={newAppointment.status || selectedAppointment.status}
                    label="Status"
                    onChange={(e) => setNewAppointment(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="postponed">Postponed</MenuItem>
                  </Select>
                </FormControl>

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
                  size="small"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDeleteAppointment}
              color="error"
              startIcon={<DeleteIcon />}
              size="small"
            >
              Delete
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              onClick={() => setOpenEditDialog(false)}
              size="small"
              sx={{ color: primaryColor }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment}
                    variant="contained"
                    startIcon={<EditIcon />}
                    size="small" color="primary">Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};
export default AppointmentCalendar;
