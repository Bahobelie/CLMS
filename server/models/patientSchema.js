const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb'); // Your sequelize instance
const generateNextId = require('../services/generateNextId'); // Import the generateNextId method


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
    validate: {
      isIn: [['Male', 'Female']],
    },
  },
  date_of_birth: { // Mapping to 'date_of_birth' in PostgreSQL
    type: DataTypes.DATE,
    allowNull: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phone_number: { // Mapping to 'phone_number' in PostgreSQL
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [10, 10], // Ensure 10 digits for phone number
    },
  },
  bmi: { // Mapping to 'bmi' in PostgreSQL
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['No', 'Weight', 'Height', 'Both Height and Weight']],
    },
  },
  bp: { // Mapping to 'bp' in PostgreSQL
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['Yes', 'No']],
    },
  },
  blood_group: { // Mapping to 'blood_group' in PostgreSQL
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [
        ['Unknown', 'To Test', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      ],
    },
    set(value) {
      this.setDataValue('blood_group', value.toUpperCase()); // Ensure uppercase
    },
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'Ethiopia',
    allowNull: true,
  },
  district_state: { // Mapping to 'district_state' in PostgreSQL
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [
        [
          'Addis Ababa',
          'Afar',
          'Amhara',
          'Benishangul-Gumuz',
          'Dire Dawa',
          'Gambela',
          'Harari',
          'Oromiya',
          'Somali',
          'SNNPR',
          'Tigray',
        ],
      ],
    },
  },
  application_fee: { // Mapping to 'application_fee' in PostgreSQL
    type: DataTypes.STRING,
    defaultValue: 'Unpaid',
    allowNull: true,
    validate: {
      isIn: [['Paid', 'Unpaid']],
    },
  },
  remarks: { // Mapping to 'remarks' in PostgreSQL
    type: DataTypes.STRING,
    defaultValue: 'Remark',
    allowNull: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  tableName: 'patients', // Table name
  underscored: true, // Ensures Sequelize uses snake_case for column names in PostgreSQL
});

// Before creating a patient record, we will set the code if it's null
Patient.beforeCreate(async (patient) => {
  if (!patient.code) {
    // Generate next ID using the generateNextId function
    patient.code = await generateNextId(Patient, 'PA-');
  }
});

module.exports = Patient;
