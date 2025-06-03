const express = require('express');
const  ClinicInfo  = require('../models/ClinicInfo');
const  ClinicInfoService  = require('../services/Automation/ClinicInfoService');
const CrudController  = require('../controllers/crudControllr.js');
const UltraSoundService = require('../services/UltraSoundService/UltraSoundService');


const ClinicInfoServices = new ClinicInfoService(ClinicInfo);
const ClinicInfoController = new CrudController(ClinicInfoServices);

const router = express.Router();

router.get('/by-condition',ClinicInfoController.findByCondition);

router.get('/', ClinicInfoController.getAll);
router.get('/:id', ClinicInfoController.getById);
router.post('/', ClinicInfoController.create);
router.put('/:id', ClinicInfoController.update);
router.delete('/:id', ClinicInfoController.delete);
router.get('/by-code/:code', ClinicInfoController.getByCode);



router.post('/uploadLogo', ClinicInfoService.getUploadLogoMiddleware(), async (req, res) => {
  try {

    const uploadedPath = req.file.path || `/uploads/${req.file.filename}`; // Adjust based on your multer config
    const log_url=uploadedPath.replace(/\\/g, '/').replace('uploads/', '/uploads/')

    res.status(200).json({ message: 'Logo uploaded successfully',url: log_url});
  } catch (error) {
    res.status(500).json({ message: 'Error uploading logo: ' + error.message });
  }
});

module.exports = router;