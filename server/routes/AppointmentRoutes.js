const express = require('express');
const  Appointment  = require('../models/Appointment.js');
const  AppointmentService  = require('../services/Appointment/AppointmentService');
const CrudController  = require('../controllers/crudControllr.js');


const AppointmentServices = new AppointmentService(Appointment);
const AppointmentController = new CrudController(AppointmentServices);

const router = express.Router();

router.get('/by-condition',AppointmentController.findByCondition);

router.get('/', AppointmentController.getAll);
router.get('/:id', AppointmentController.getById);
router.post('/', AppointmentController.create);
router.put('/:id', AppointmentController.update);
router.delete('/:id', AppointmentController.delete);
router.get('/by-code/:code', AppointmentController.getByCode);

module.exports = router;