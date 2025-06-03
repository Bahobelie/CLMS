const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Your sequelize instance
const generateNextId = require('../services/generateNextId'); // Import the generateNextId method
const dayjs = require('dayjs'); // For 24-hour time formatting

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middle_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  age: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bmi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  blood_group: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'Ethiopia',
    allowNull: true,
  },
  district_state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  application_fee: {
    type: DataTypes.STRING,
    defaultValue: 'Expired',
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING,
    defaultValue: 'Remark',
    allowNull: true,
  },
  application_fee_amount: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
    allowNull: true,
  },
  referencecode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kebele: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  woreda: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sub_city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  identification_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  tableName: 'patients',
  underscored: true, // created_at, updated_at instead of camelCase
});

// Automatically generate a unique `code` before creating a new Patient
Patient.beforeCreate(async (patient) => {
  if (!patient.code) {
    patient.code = await generateNextId(Patient, 'PA-');
  }
});

// Format created_at and updated_at in 24-hour format when returning JSON
Patient.prototype.toJSON = function () {
  const values = { ...this.get() };

  if (values.created_at) {
    values.created_at = dayjs(values.created_at).format('YYYY-MM-DD HH:mm:ss');
  }
  if (values.updated_at) {
    values.updated_at = dayjs(values.updated_at).format('YYYY-MM-DD HH:mm:ss');
  }

  return values;
};

module.exports = Patient;
