const express = require('express');
const  PatientHistory  = require('../models/patientHistorySchema.js');
const  CrudService  = require('../services/CrudService.js');
const CrudController  = require('../controllers/crudControllr.js');
const PatientHistoryService = require('../services/PatientHistoryService/patientHistoryService.js');

const PatientHistoryServices = new PatientHistoryService(PatientHistory);
const PatientHistoryController = new CrudController(PatientHistoryServices);

const router = express.Router();
router.get('/by-condition',PatientHistoryController.findByCondition);

router.get('/', PatientHistoryController.getAll);
router.get('/:id', PatientHistoryController.getById);
router.post('/', PatientHistoryController.create);
router.put('/:id', PatientHistoryController.update);
router.delete('/:id', PatientHistoryController.delete);
router.get('/by-code/:code', PatientHistoryController.getByCode);

module.exports = router;