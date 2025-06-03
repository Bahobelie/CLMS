const { Sequelize, DataTypes } = require('sequelize');
const generateNextId = require('../services/generateNextId');
const sequelize = require('../config/connectDb'); // Your Sequelize instance

const ClinicInfo = sequelize.define('ClinicInfo', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please enter clinic name' },
    },
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isactive:{
    type: DataTypes.BOOLEAN,
    allowNull: true,
    default: true
  },
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'clinic_info',
});

// Before creating a clinic record, auto-generate `code` if not present
ClinicInfo.beforeCreate(async (clinic) => {
  if (!clinic.code) {
    clinic.code = await generateNextId(ClinicInfo, 'CL-');
  }
});

// Sync the model with the database
sequelize.sync()
  .then(() => console.log('ClinicInfo table synced'))
  .catch((err) => console.error('Error syncing ClinicInfo table:', err));

module.exports = ClinicInfo;
