const morgan=require('morgan');

const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
const labTestRoutes = require('./routes/labTestRoutes');
const ultraSoundRoutes = require('./routes/ultraSoundRoutes');
const systemConstantRoutes = require('./routes/systemconstantRoutes');
const patientRoutes = require('./routes/patientRoutes');
const patientHistoryRoutes = require('./routes/patientHistoryRoutes');
const modelRelatedRoutes=require('./routes/modelRelatedRoutes');
const cors = require('cors');


const app = express();
app.use(cors());

app.use(express.json()); // Middleware for JSON parsing
app.use(morgan("combined")); // Middleware for logging all request

// Use the generated routes
app.use('/api/admins', adminRoutes);
app.use('/api/labTests', labTestRoutes);
app.use('/api/ultarSounds', ultraSoundRoutes);
app.use('/api/systemConstants', systemConstantRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patientHistorys', patientHistoryRoutes);

app.use('/api/model',modelRelatedRoutes);

module.exports = app;
