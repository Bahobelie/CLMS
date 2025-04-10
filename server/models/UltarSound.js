const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/connectDb');
const generateNextId = require("../services/generateNextId");  // Ensure your Sequelize instance is properly configured

const Ultrasound = sequelize.define('Ultrasound', {
        code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                defaultValue: null,  // This will be auto-generated
        },
        patientId: {
                type: DataTypes.INTEGER,  // Assuming Patient ID is an integer
                allowNull: false,
                references: {
                        model: 'Patients',  // Ensure the 'Patients' table is defined elsewhere
                        key: 'id',
                },
        },
        imageUrl: {
                type: DataTypes.STRING,
                allowNull: true,
        },
        description: {
                type: DataTypes.STRING,
                allowNull: true,
        },
        remark: {
                type: DataTypes.STRING,
                allowNull: true,
        },
}, {
        timestamps: true,  // Automatically handles createdAt and updatedAt
        tableName: 'ultrasounds',  // Custom table name if needed
});

// Hook to set the code before creating an Ultrasound record
Ultrasound.beforeCreate(async (ultrasound, options) => {
        if (!ultrasound.code) {
                ultrasound.code = await generateNextId(ultrasound, 'US-');
        }
});

module.exports = Ultrasound;
