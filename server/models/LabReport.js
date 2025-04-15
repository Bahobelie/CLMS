const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb');
const generateNextId = require('../services/generateNextId'); // Assuming you have a sequelize instance
const bcrypt = require('bcryptjs');

// LabReport model definition
const LabReport = sequelize.define('LabReport', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  patientId: {
    type: DataTypes.INTEGER, // Assuming you are using integer for patient IDs, or adjust to fit your schema
    allowNull: false,
    references: {
      model: 'Patients', // Reference to the Patients table
      key: 'id',
    },
  },
  labTestId: {
    type: DataTypes.INTEGER, // Assuming you are using integer for labTest IDs
    allowNull: false,
    references: {
      model: 'LabTests', // Reference to the LabTests table
      key: 'id',
    },
  },
  testDate: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW, // Automatically set current date and time
  },
  resultDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  result: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reportFileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'lab_reports', // Table name in the database
});

// Before creating an administrator, we will set the code if it's null
LabReport.beforeCreate(async (administrator) => {
  if (!administrator.code) {
    // Generate next ID using the generateNextId function
    administrator.code = await generateNextId(LabReport, 'LR-');
  }
  // Hash password before saving
  if (administrator.password) {
    const salt = await bcrypt.genSalt(10);
    administrator.password = await bcrypt.hash(administrator.password, salt);
  }
});

// Sync the model with the database (optional, based on your setup)
sequelize.sync()
    .then(() => console.log('LabReport table synced'))
    .catch((err) => console.error('Error syncing table:', err));

module.exports = LabReport;
