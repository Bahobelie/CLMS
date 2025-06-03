const express = require('express');
const  Employee  = require('../models/Employee.js');
const  EmployeeService  = require('../services/Employeee/Employee');
const CrudController  = require('../controllers/crudControllr.js');


const EmployeeServices = new EmployeeService(Employee);
const EmployeeController = new CrudController(EmployeeServices);

const router = express.Router();

router.get('/by-condition',EmployeeController.findByCondition);

router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);
router.post('/', EmployeeController.create);
router.put('/:id', EmployeeController.update);
router.delete('/:id', EmployeeController.delete);
router.get('/by-code/:code', EmployeeController.getByCode);

router.post('/bulk', async (req, res) => {
  try {
    const data=req.body


    // Call the service method correctly
    const response = await EmployeeServices.bulkCreate(data);
    res.status(201).json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
module.exports = router;