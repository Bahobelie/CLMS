const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb');
const generateNextId = require('../services/generateNextId');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  type: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'system_constants', // matches table name in DB
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Available' // default value
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phonenumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  dateofbirth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  yearsofexperience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  availabilitydays: {
    type:  DataTypes.ARRAY(DataTypes.TEXT),
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
  timestamps: false, // You already define CreatedAt/UpdatedAt manually
  tableName: 'employee'
});
// Before create hook to generate custom code
Employee.beforeCreate(async (employee) => {
  if (!employee.code) {
    employee.code = await generateNextId(Employee, 'EMP-');
  }
});

module.exports = Employee;
