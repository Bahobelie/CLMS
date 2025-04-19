const express = require('express');
const generateNextId = require('../services/generateNextId');
const router = express.Router();
const {Admin,employeeSchema,patientSchema,patientHistorySchema,LabReport,LabTest,UltarSound,SystemConstant,Prescription,Appointment} = require('.././models');

const {Patient}=require('../models');
  const models = {
      Admin,
      patientSchema,
      patientHistorySchema,
      LabReport,
      LabTest,
      UltarSound,
      SystemConstant,
      Prescription,
      Appointment,
     employeeSchema,
  };

router.get('/next-code', async (req, res) => {
  const { model, prefix } = req.query;
  try {
    if (!model || !prefix) {
      return res.status(400).json({ error: 'Model and prefix are required' });
    }
    const selectedModel = models[model];

    if (!selectedModel) {
      return res.status(400).json({ error: 'Invalid model name' });
    }

    const nextCode = await generateNextId(selectedModel, prefix);
    res.json({ code: nextCode });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Error generating code' });
  }
});

module.exports = router;