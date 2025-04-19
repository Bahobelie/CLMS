const Admin = require('.././models/Admin');
const patientSchema = require('.././models/patientSchema');
const patientHistorySchema = require('.././models/patientHistorySchema');
const LabTest = require('.././models/LabTest');
const Prescription = require('.././models/Prescription');
const SystemConstant = require('.././models/SystemConstant');
const UltarSound = require('.././models/UltarSound');
const LabReport = require('.././models/LabReport');
const Appointment =require('.././models/Appointment');
const employeeSchema=require('.././models/Employee');

module.exports = {
  Admin,
  patientSchema,
  patientHistorySchema,
  LabTest,
  Prescription,
  SystemConstant,
  UltarSound,
  LabReport,
  Appointment,
  employeeSchema
};