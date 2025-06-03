const express = require('express');
const  Admin  = require('../models/Admin.js');
const  AdminService  = require('../services/admin/AdminService');
const CrudController  = require('../controllers/crudControllr.js');


const AdminServices = new AdminService(Admin);
const AdminController = new CrudController(AdminServices);

const router = express.Router();

router.post('/by-condition',AdminController.findByCondition);

router.get('/', AdminController.getAll);
router.get('/:id', AdminController.getById);
router.post('/', AdminController.create);
router.put('/:id', AdminController.update);
router.delete('/:id', AdminController.delete);
router.get('/by-code/:code', AdminController.getByCode);

// Login route
router.post('/login', async (req, res) => {
  try {
    const token = await AdminServices.login(req.body);
    res.status(200).json(token);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/register",async (req, res) => {
  try {
    const token = await AdminServices.login(req.body);
    res.status(200).json(token);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// In your controller
router.post('/change-password', async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;
    const result = await AdminServices.changePassword(adminId, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.post('/reset-password', async (req, res) => {
  try {
    const {username } = req.body;
    const result = await AdminServices.requestPasswordResetSimple(username);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;