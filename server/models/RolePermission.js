const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Adjust the path as needed

const RolePermission = sequelize.define('RolePermissions', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code:{
    type:DataTypes.STRING,
    allowNull: false,
    unique:true,
  },
  menu: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
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
  tableName: 'rolepermission', // use lowercase or adjust to match actual table
  timestamps: false, // manually handling created_at and updated_at
});

module.exports = RolePermission;
