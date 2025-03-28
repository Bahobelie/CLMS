const express = require('express');
const  Patient  = require('../models/patientSchema.js');
const  CrudService  = require('../services/CrudService.js');
const CrudController  = require('../controllers/crudControllr.js');


const PatientService = new CrudService(Patient);
const PatientController = new CrudController(PatientService);

const router = express.Router();

router.get('/', PatientController.getAll);
router.get('/:id', PatientController.getById);
router.post('/', PatientController.create);
router.put('/:id', PatientController.update);
router.delete('/:id', PatientController.delete);
router.get('/by-code/:code', PatientController.getByCode);

module.exports = router;