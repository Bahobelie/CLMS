const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Adjust the path as needed

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  patientid: { // Typo kept as per your table; consider correcting to `patientId`
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients', // table name or model name depending on setup
      key: 'id',
    },
  },
  doctorid: { // Typo kept as per your table; consider correcting to `patientId`
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employee', // table name or model name depending on setup
      key: 'id',
    },
  },
  medicines: {
    type: DataTypes.JSON, // ⬅️ JSON array of medicines
    allowNull: false,
    defaultValue: [],
  },
  notes:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'prescription',
  timestamps: false, // You're managing timestamps manually
});

module.exports = Prescription;
