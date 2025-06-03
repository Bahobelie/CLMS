const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb');
const generateNextId = require('../services/generateNextId');

// Appointment model definition
const Appointment = sequelize.define('Appointment', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id',
    },
  },
  doctorid:{
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Employee',
      key: 'id',
    },
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'cancelled','confirmed','postponed']]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  timestamps: false,
  tableName: 'appointments',
});

// Before create hook to generate custom code
Appointment.beforeCreate(async (appointment) => {
  if (!appointment.code) {
    appointment.code = await generateNextId(Appointment, 'APPT-');
  }
});

sequelize.sync()
  .then(() => console.log('Appointment table synced'))
  .catch((err) => console.error('Error syncing Appointment table:', err));

module.exports = Appointment;
