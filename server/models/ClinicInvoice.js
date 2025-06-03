const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Your DB connection instance
const generateNextId = require('../services/generateNextId'); // Reuse if needed

const ClinicInvoice = sequelize.define('ClinicInvoice', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  patientid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id'
    }
  },
  serviceid: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'SystemConstants',
      key: 'key'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'clinic_invoices'
});

// Before creating, generate code & calculate total
ClinicInvoice.beforeCreate(async (invoice) => {
  if (!invoice.invoiceCode) {
    invoice.invoiceCode = await generateNextId(ClinicInvoice, 'INV-');
  }
  if (invoice.price && invoice.quantity) {
    invoice.totalAmount = parseFloat(invoice.price) * parseInt(invoice.quantity);
  }
});

// Sync model
sequelize.sync()
  .then(() => console.log('ClinicInvoice table synced'))
  .catch((err) => console.error('Error syncing ClinicInvoice:', err));

module.exports = ClinicInvoice;
