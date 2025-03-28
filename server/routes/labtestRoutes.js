const express = require('express');
const  LabTest  = require('../models/LabTest.js');
const CrudController  = require('../controllers/crudControllr.js');
const LabTestService  = require('../services/LabTest/LabTestService');

const LabTestServices = new LabTestService(LabTest);
const LabTestController = new CrudController(LabTestServices);

const router = express.Router();

router.get('/', LabTestController.getAll);
router.get('/:id', LabTestController.getById);
router.post('/', LabTestController.create);
router.put('/:id', LabTestController.update);
router.delete('/:id', LabTestController.delete);
router.get('/by-code/:code', LabTestController.getByCode);

module.exports = router;