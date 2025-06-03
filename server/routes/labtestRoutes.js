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
// Bulk update payment status
router.patch('/bulk-update', async (req, res) => {
  try {
    const { id, paymntstatus } = req.body;

    // Validate input
    if (!id || !Array.isArray(id) || id.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty IDs array' });
    }

    if (!['paid', 'unpaid'].includes(paymntstatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const updatedTests = await LabTestServices.bulkUpdatePaymentStatus(id, paymntstatus);

    if (updatedTests.length === 0) {
      return res.status(404).json({ error: 'No tests found with the provided IDs' });
    }

    res.json({
      message: `Successfully updated ${updatedTests.length} test(s)`,
      updatedTests
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;