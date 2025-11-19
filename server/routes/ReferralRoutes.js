const express = require('express');
const  Referral  = require('../models/Referral.js');
const  ReferralService  = require('../services/ReferralService');
const CrudController  = require('../controllers/crudControllr.js');


const ReferralServices = new ReferralService(Referral);
const ReferralController = new CrudController(ReferralServices);

const router = express.Router();

router.get('/by-condition',ReferralController.findByCondition);

router.get('/', ReferralController.getAll);
router.get('/:id', ReferralController.getById);
router.post('/', ReferralController.create);
router.put('/:id', ReferralController.update);
router.delete('/:id', ReferralController.delete);
router.get('/by-code/:code', ReferralController.getByCode);


module.exports = router;