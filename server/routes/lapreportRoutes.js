const express = require('express');
const  LapReport  = require('../models/LabReport');
const  CrudService  = require('../services/CrudService.js');
const CrudController  = require('../controllers/crudControllr.js');


const LapReportService = new CrudService(LapReport);
const LapReportController = new CrudController(LapReportService);

const router = express.Router();

router.get('/', LapReportController.getAll);
router.get('/:id', LapReportController.getById);
router.post('/', LapReportController.create);
router.put('/:id', LapReportController.update);
router.delete('/:id', LapReportController.delete);
router.get('/by-code/:code', LapReportController.getByCode);

module.exports = router;