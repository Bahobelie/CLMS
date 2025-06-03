const morgan=require('morgan');

const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
const labTestRoutes = require('./routes/labTestRoutes');
const ultraSoundRoutes = require('./routes/ultraSoundRoutes');
const systemConstantRoutes = require('./routes/systemconstantRoutes');
// const patientRoutes = require('./routes/patientRoutes');
const patientHistoryRoutes = require('./routes/patientHistoryRoutes');
const modelRelatedRoutes=require('./routes/modelRelatedRoutes');
const appointmentRoutes=require('./routes/AppointmentRoutes');
const employeeRoutes=require('./routes/EmployeeRoutes');
const prescriptionRoutes=require('./routes/PrescriptionRoutes');
const ClinicInfoRoutes=require('./routes/ClinicInfoRoutes');
const RolePermissionRouts=require('./routes/RolePermissionRoutes');
const EmergencyHealthInfoRoutes=require('./routes/EmergencyHealthInfoRoutes');
const MedicineRoutes=require('./routes/MedicineRoutes');

const cors = require('cors');
const runSchema = require('./config/runSchema');


const app = express();
app.use(cors());

app.use(express.json()); // Middleware for JSON parsing
app.use(morgan("combined")); // Middleware for logging all request
app.use(express.urlencoded({ extended: true }));


// Use the generated routes
app.use('/api/admins', adminRoutes);
app.use('/api/labTests', labTestRoutes);
app.use('/api/ultarsounds', ultraSoundRoutes);
app.use('/api/systemConstants', systemConstantRoutes);
app.use('/api/patientHistorys', patientHistoryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/prescriptions',prescriptionRoutes)
app.use('/api/clinicinfo',ClinicInfoRoutes)
app.use('/api/permission',RolePermissionRouts)
app.use('/api/emergencyHealthInfo',EmergencyHealthInfoRoutes)
app.use('/api/medicines',MedicineRoutes)

app.use('/api/model',modelRelatedRoutes);

app.post('/api/run-schema', async (req, res) => {
  try {
    await runSchema();
    res.status(200).json({ message: '✅ Schema executed successfully' });
  } catch (error) {
    res.status(500).json({ error: '❌ Error executing schema' });
  }
});

module.exports = app;
