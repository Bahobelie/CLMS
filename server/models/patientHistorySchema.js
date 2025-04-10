const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Your sequelize instance
const generateNextId = require('../services/generateNextId'); // Import the generateNextId method

// PatientHistory model definition
const PatientHistory = sequelize.define('PatientHistory', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure that the code is unique
  },
  // Chief Complaint (Symptoms)
  chief_complaint_symptoms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chief_complaint_duration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chief_complaint_severity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Medical History
  medical_history_conditions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  medical_history_medications: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  medical_history_surgeries: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  medical_history_hospitalizations: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Family & Lifestyle Information
  allergies: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  family_history_chronic_diseases: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  family_history_genetic_conditions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lifestyle_smoking: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  lifestyle_alcohol: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  lifestyle_drugs: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  lifestyle_diet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lifestyle_exercise: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Current Symptoms & Treatments
  current_symptoms_pain_location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  current_symptoms_pain_severity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  current_symptoms_other_symptoms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  previous_treatments_previous_doctors: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  previous_treatments_medications_taken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  current_treatments_current_doctor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  current_treatments_current_medications: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Immunizations
  immunizations_up_to_date: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  immunizations_recent_vaccines: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Patient Current Info (Vitals & Exam Findings)
  patient_current_info_bp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_pr: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_rr: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_oxygen_saturation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_temp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_weight: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_height: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Physical Examination Findings
  patient_current_info_heent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_lgs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_rs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_cvs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_gis: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_gus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_is: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_mss: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patient_current_info_cns: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Patient ID - Reference to the Patient Table
  patientid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients', // Name of the Patient table
      key: 'id', // Column name in the patients table
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // In case the patient is deleted, set patientid to NULL
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  tableName: 'patient_histories', // Name of the table
});

// Before creating a patient history, we will set the code if it's null
PatientHistory.beforeCreate(async (patientHistory) => {
  if (!patientHistory.code) {
    // Generate next ID using the generateNextId function
    patientHistory.code = await generateNextId(PatientHistory, 'PH_');
  }
});

module.exports = PatientHistory;
