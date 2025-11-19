const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const generateNextId = require('../services/generateNextId'); // Import the generateNextId method
const sequelize = require('../config/connectDb'); // Assuming you have a sequelize instance

// Administrator model definition
const Referral = sequelize.define('Referral', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  hospital: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please enter hospital Name' },
    },
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id',
    },
  },
  chiefComplaint: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ga: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hx: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  findings: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  investigation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  asset: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  management: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referralDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  tableName: 'Referral', // Name of the table
});





module.exports = Referral;
