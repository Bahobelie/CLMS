const express = require('express');
const PatientEmergencyHealthInfo = require('../models/EmergencyHealthInfo'); // Adjust the path as needed
const PatientEmergencyHealthInfoService = require('../services/patient/emergencyHealthInfoService');
const CrudController = require('../controllers/crudControllr');

const PatientEmergencyHealthInfoServices = new PatientEmergencyHealthInfoService(PatientEmergencyHealthInfo);
const PatientEmergencyHealthInfoController = new CrudController(PatientEmergencyHealthInfoServices);

const router = express.Router();

router.get('/by-condition', PatientEmergencyHealthInfoController.findByCondition);

router.get('/', PatientEmergencyHealthInfoController.getAll);
router.get('/:id', PatientEmergencyHealthInfoController.getById);
router.post('/', PatientEmergencyHealthInfoController.create);
router.put('/:id', PatientEmergencyHealthInfoController.update);
router.delete('/:id', PatientEmergencyHealthInfoController.delete);
router.get('/by-code/:code', PatientEmergencyHealthInfoController.getByCode); // Optional if `code` field exists

module.exports = router;
