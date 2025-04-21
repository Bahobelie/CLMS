const morgan=require('morgan');

const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
const labTestRoutes = require('./routes/labTestRoutes');
const ultraSoundRoutes = require('./routes/ultraSoundRoutes');
const systemConstantRoutes = require('./routes/systemconstantRoutes');
const patientRoutes = require('./routes/patientRoutes');
const patientHistoryRoutes = require('./routes/patientHistoryRoutes');
const modelRelatedRoutes=require('./routes/modelRelatedRoutes');
const appointmentRoutes=require('./routes/AppointmentRoutes');
const employeeRoutes=require('./routes/EmployeeRoutes');

const cors = require('cors');


const app = express();
app.use(cors());

app.use(express.json()); // Middleware for JSON parsing
app.use(morgan("combined")); // Middleware for logging all request
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
const path = require('path');





// Use the generated routes
app.use('/api/admins', adminRoutes);
app.use('/api/labTests', labTestRoutes);
app.use('/api/ultarsounds', ultraSoundRoutes);
app.use('/api/systemConstants', systemConstantRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patientHistorys', patientHistoryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/employees', employeeRoutes);

app.use('/api/model',modelRelatedRoutes);

module.exports = app;
