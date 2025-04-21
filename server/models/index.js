const Admin = require('.././models/Admin');
const patient = require('.././models/patientSchema');
const patientHistory = require('.././models/patientHistorySchema');
const LabTest = require('.././models/LabTest');
const Prescription = require('.././models/Prescription');
const systemconstant = require('.././models/SystemConstant');
const ultarsound = require('.././models/UltarSound');
const LabReport = require('.././models/LabReport');
const Appointment =require('.././models/Appointment');
const employee=require('.././models/Employee');

module.exports = {
  Admin,
  patient,
  patientHistory,
  LabTest,
  Prescription,
  systemconstant,
  ultarsound,
  LabReport,
  Appointment,
  employee
};