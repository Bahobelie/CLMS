const { Sequelize, DataTypes } = require('sequelize');
const generateNextId = require('../services/generateNextId');
const sequelize = require('../config/connectDb'); // Assuming you have a sequelize instance

// LabTest model definition
const LabTest = sequelize.define('LabTest', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
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
  patienthistoryid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'patient_histories', // Name of the PatientHistory table
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  isactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  result: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  referencerange: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['pending', 'complete','canceled']],
    },
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'lab_tests', // Table name in the database
});

// Before creating a LabTest, set code if it's null
LabTest.beforeCreate(async (labTest) => {
  if (!labTest.code) {
    labTest.code = await generateNextId(LabTest, 'LT-');
  }
});

// Sync the model with the database (optional, based on your setup)
sequelize.sync()
    .then(() => console.log('LabTest table synced'))
    .catch((err) => console.error('Error syncing table:', err));

module.exports = LabTest;
