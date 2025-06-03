
const express = require("express");
const adminController = require("../controllers/adminController");
const PatientModel = require("../models/patientSchema");

const router = express.Router();

// User Registration and Login Routes
router.post("/login", adminController.loginUser);

module.exports=router;