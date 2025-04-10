const express = require('express');
const  Patient  = require('../models/patientSchema.js');
const  PatientService  = require('../services/patient/patientService');
const CrudController  = require('../controllers/crudControllr.js');


const patientService = new PatientService(Patient);
const PatientController = new CrudController(patientService);

const router = express.Router();
router.get('/by-condition',PatientController.findByCondition);

router.get('/', PatientController.getAll);
router.get('/:id', PatientController.getById);
router.post('/', PatientController.create);
router.put('/:id', PatientController.update);
router.delete('/:id', PatientController.delete);
router.get('/by-code/:code', PatientController.getByCode);

module.exports = router;