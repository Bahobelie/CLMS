const express = require('express');
const  LabTest  = require('../models/LabTest.js');
const CrudController  = require('../controllers/crudControllr.js');
const LabTestService = require('../services/LabTest/LabTestService');


const LabTestServices = new LabTestService(LabTest);
const LabTestController = new CrudController(LabTestServices);

const router = express.Router();

router.get('/by-condition',LabTestController.findByCondition);

router.get('/', LabTestController.getAll);
router.get('/:id', LabTestController.getById);
router.post('/', LabTestController.create);
router.put('/:id', LabTestController.update);
router.delete('/:id', LabTestController.delete);
router.get('/by-code/:code', LabTestController.getByCode);

// Custom bulk create endpoint
router.post('/bulkCreate', async (req, res) => {
  try {
    const { patientid, labTests } = req.body;

    if (!patientid || !labTests) {
      return res.status(400).json({ message: "patient and labTests are required" });
    }

    // Call the service method correctly
    const response = await LabTestServices.bulkCreateWithDeactivation(patientid, labTests);
    res.status(201).json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;