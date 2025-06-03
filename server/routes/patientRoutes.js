// patientRoutes.js
const express = require('express');
const Patient = require('../models/patientSchema.js');
const PatientService = require('../services/patient/patientService');
const CrudController = require('../controllers/crudControllr.js');

function patientRoutes(io) {
  const router = express.Router();

  const patientService = new PatientService(Patient, io); // <-- Pass io here
  const PatientController = new CrudController(patientService);

  router.get('/by-condition', PatientController.findByCondition);
  router.get('/', PatientController.getAll);
  router.get('/:id', PatientController.getById);
  router.post('/', PatientController.create);
  router.put('/:id', PatientController.update);
  router.delete('/:id', PatientController.delete);
  router.get('/by-code/:code', PatientController.getByCode);

  router.post('/bulk', async (req, res) => {
    try {
      const data=req.body


      // Call the service method correctly
      const response = await patientService.bulkCreate(data);
      res.status(201).json(response);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  return router;
}

module.exports = patientRoutes;
