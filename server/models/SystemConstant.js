const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Your Sequelize instance
const generateNextId = require('../services/generateNextId'); // Import the generateNextId method

// Define the SystemConstants model
const SystemConstants = sequelize.define('SystemConstant', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true, // Nullable
    defaultValue: null,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  index: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  parentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'SystemConstants', // Refers to the same table (self-referencing)
      key: 'id',
    },
    allowNull: true, // Nullable (for self-referencing)
  },
  referencerange: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true, // Nullable field added
    defaultValue: null, // Can be set to null initially
  },
}, {
  timestamps: true,
  tableName: 'system_constants', // Name of the table
});

// Before creating a SystemConstant record, we will set the code if it's null
SystemConstants.beforeCreate(async (systemConstant) => {
  if (!systemConstant.code) {
    systemConstant.code = await generateNextId(SystemConstants, 'SYC-');
  }
});

module.exports = SystemConstants;
