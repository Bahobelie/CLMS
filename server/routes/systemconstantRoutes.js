const express = require('express');
const  SystemConstant  = require('../models/SystemConstant.js');
const  CrudService  = require('../services/CrudService.js');
const CrudController  = require('../controllers/crudControllr.js');


const SystemConstantService = new CrudService(SystemConstant);
const SystemConstantController = new CrudController(SystemConstantService);

const router = express.Router();

router.post('/by-condition',SystemConstantController.findByCondition);

router.get('/', SystemConstantController.getAll);
router.get('/:id', SystemConstantController.getById);
router.post('/', SystemConstantController.create);
router.put('/:id', SystemConstantController.update);
router.delete('/:id', SystemConstantController.delete);
router.get('/by-code/:code', SystemConstantController.getByCode);

module.exports = router;