// routes/medicine.routes.js
const express = require('express');
const Medicine = require('../models/Medicine');
const MedicineService = require('../services/MedicineService');
const CrudController = require('../controllers/crudControllr.js');

const medicineService = new MedicineService(Medicine);
const medicineController = new CrudController(medicineService);

const router = express.Router();

router.get('/by-condition', medicineController.findByCondition);
router.get('/', medicineController.getAll);
router.get('/:id', medicineController.getById);
router.post('/', medicineController.create);
router.put('/:id', medicineController.update);
router.delete('/:id', medicineController.delete);
router.get('/by-code/:code', medicineController.getByCode);

router.post('/bulk', async (req, res) => {
  try {
    const data=req.body


    // Call the service method correctly
    const response = await medicineService.bulkCreate(data);
    res.status(201).json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
module.exports = router;
