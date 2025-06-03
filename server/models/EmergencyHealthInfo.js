const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb');

const EmergencyHealthInfo = sequelize.define('PatientEmergencyHealthInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  patientid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients', // Assumes a 'patients' table exists
      key: 'id'
    }
  },
  blood_pressure: {
    type: DataTypes.STRING(10), // Example: '120/80'
    allowNull: true
  },
  pulse_rate: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  respiratory_rate: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  oxygen_saturation: {
    type: DataTypes.DECIMAL(5, 2), // Example: 98.75
    allowNull: true
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 1), // Example: 36.6
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2), // in kg
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 2), // in cm
    allowNull: true
  },
  createdat: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedat: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: false,
  tableName: 'patient_emergency_health_info'
});

module.exports = EmergencyHealthInfo;
