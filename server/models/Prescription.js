const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Your sequelize instance
const generateNextId = require('../services/generateNextId'); // Import the generateNextId method
const Patient = require('./patientSchema'); // Import the Patient model

// Prescription model definition
const Prescription = sequelize.define('Prescription', {
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  clinicName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cardNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  town: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  woreda: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kebele: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dx: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  prscriberName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prescriberQualification: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dispenserName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    references: {
      model: Patient, // Referring to the Patient model
      key: 'id', // Assuming 'id' is the primary key of the Patient model
    },
    allowNull: false,
  },
  dynamicFields: {
    type: DataTypes.JSONB, // Store dynamic fields as a JSON array
    defaultValue: null,
  },
}, {
  timestamps: true,
  tableName: 'prescriptions',
});

// Before creating a prescription record, we will set the code if it's null
Prescription.beforeCreate(async (prescription) => {
  if (!prescription.code) {
    prescription.code = await generateNextId(Prescription, 'PR-');
  }
});

// Set the association with the Patient model
Prescription.belongsTo(Patient, { foreignKey: 'patientId' });

module.exports = Prescription;
