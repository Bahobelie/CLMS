const express = require('express');
const  RolePermission  = require('../models/RolePermission');
const  RolePermissionService  = require('../services/Automation/RolePermission');
const CrudController  = require('../controllers/crudControllr.js');


const RolePermissionServices = new RolePermissionService(RolePermission);
const RolePermissionController = new CrudController(RolePermissionServices);

const router = express.Router();

router.get('/by-condition',RolePermissionController.findByCondition);

router.get('/', RolePermissionController.getAll);
router.get('/:id', RolePermissionController.getById);
router.post('/', RolePermissionController.create);
router.put('/:id', RolePermissionController.update);
router.delete('/:id', RolePermissionController.delete);
router.get('/by-code/:code', RolePermissionController.getByCode);

router.post('/bulk', async (req, res) => {
  try {
    const data=req.body


    // Call the service method correctly
    const response = await RolePermissionServices.bulkCreate(data);
    res.status(201).json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;