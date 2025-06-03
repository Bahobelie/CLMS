const express = require('express');
const  Prescription  = require('../models/Prescription.js');
const  PrescriptionService  = require('../services/PresecriptionService/PresciptionService');
const CrudController  = require('../controllers/crudControllr.js');


const PrescriptionServices = new PrescriptionService(Prescription);
const PrescriptionController = new CrudController(PrescriptionServices);

const router = express.Router();

router.get('/by-condition',PrescriptionController.findByCondition);

router.get('/', PrescriptionController.getAll);
router.get('/:id', PrescriptionController.getById);
router.post('/', PrescriptionController.create);
router.put('/:id', PrescriptionController.update);
router.delete('/:id', PrescriptionController.delete);
router.get('/by-code/:code', PrescriptionController.getByCode);


module.exports = router;