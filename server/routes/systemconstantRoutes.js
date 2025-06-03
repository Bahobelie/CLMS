const express = require('express');
const  SystemConstant  = require('../models/SystemConstant.js');
const  CrudService  = require('../services/CrudService.js');
const CrudController  = require('../controllers/crudControllr.js');
const SystemConstantService = require('../services/SystemConstantService/SystemConstantService');

const SystemConstantServices = new SystemConstantService(SystemConstant);
const SystemConstantController = new CrudController(SystemConstantServices);

const router = express.Router();

router.get('/by-condition',SystemConstantController.findByCondition);

router.get('/', SystemConstantController.getAll);
router.get('/:id', SystemConstantController.getById);
router.post('/', SystemConstantController.create);
router.put('/:id', SystemConstantController.update);
router.delete('/:id', SystemConstantController.delete);
router.get('/by-code/:code', SystemConstantController.getByCode);


router.post('/bulk', async (req, res) => {
  try {
   const data=req.body


    // Call the service method correctly
    const response = await SystemConstantServices.bulkCreate(data);
    res.status(201).json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;