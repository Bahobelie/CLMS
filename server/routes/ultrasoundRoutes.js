const express = require('express');
const  UltraSound  = require('../models/UltarSound.js');
const  UltraSoundService  = require('../services/UltraSoundService/UltraSoundService');
const CrudController  = require('../controllers/crudControllr.js');


const UltraSoundServices = new UltraSoundService(UltraSound);
const UltraSoundController = new CrudController(UltraSoundServices);

const router = express.Router();
router.get('/by-condition',UltraSoundController.findByCondition);

router.get('/', UltraSoundController.getAll);
router.get('/:id', UltraSoundController.getById);
router.post('/', UltraSoundController.create);
router.put('/:id', UltraSoundController.update);
router.delete('/:id', UltraSoundController.delete);
router.get('/by-code/:code', UltraSoundController.getByCode);

router.post('/upload', UltraSoundService.getUploadMiddleware(), async (req, res) => {
  try {
    const result = await UltraSoundServices.create(req.body, req.file?.path);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;