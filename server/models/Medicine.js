// models/medicine.model.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb');
const generateNextId = require('../services/generateNextId'); // Optional: for custom code

const Medicine = sequelize.define('Medicine', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please enter medicine name' },
    },
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  start_date:{
    type: DataTypes.DATE,
    allowNull: true,
  },
  unitprice:{
    type:DataTypes.DECIMAL,
    allowNull:true
  },
  batchnumber:{
    type:DataTypes.STRING,
    allowNull:true
  },
  remark:{
    type:DataTypes.STRING,
    allowNull:true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'medicines',
});

Medicine.beforeCreate(async (medicine) => {
  if (!medicine.code) {
    medicine.code = await generateNextId(Medicine, 'MD-');
  }
});

sequelize.sync()
  .then(() => console.log('Medicine table synced'))
  .catch((err) => console.error('Error syncing medicine table:', err));

module.exports = Medicine;
