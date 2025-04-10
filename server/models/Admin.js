const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const generateNextId = require('../services/generateNextId'); // Import the generateNextId method
const sequelize = require('../config/connectDb'); // Assuming you have a sequelize instance

// Administrator model definition
const Administrator = sequelize.define('Administrator', {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please enter name' },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'Please enter email' },
            isEmail: { msg: 'Please enter a valid email' },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please enter password' },
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'Please enter phone' },
        },
    },
    role: {
        type: DataTypes.INTEGER, // Assuming role is an integer ID referencing SystemConstant
        allowNull: false,
        references: {
            model: 'SystemConstants', // Reference to SystemConstant model
            key: 'id',
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    tableName: 'administrators', // Name of the table
});

// Before creating an administrator, we will set the code if it's null
Administrator.beforeCreate(async (administrator) => {
    if (!administrator.code) {
        // Generate next ID using the generateNextId function
        administrator.code = await generateNextId(Administrator, 'AD-');
    }
    // Hash password before saving
    if (administrator.password) {
        const salt = await bcrypt.genSalt(10);
        administrator.password = await bcrypt.hash(administrator.password, salt);
    }
});

// Method to compare passwords
Administrator.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sync the model with the database
sequelize.sync()
    .then(() => console.log('Administrator table synced'))
    .catch((err) => console.error('Error syncing table:', err));

module.exports = Administrator;
