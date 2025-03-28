const express = require('express');
const  UltraSound  = require('../models/UltarSound.js');
const  UltraSoundService  = require('../services/UltraSoundService/UltraSoundService');
const CrudController  = require('../controllers/crudControllr.js');


const UltraSoundServices = new UltraSoundService(UltraSound);
const UltraSoundController = new CrudController(UltraSoundServices);

const router = express.Router();

router.get('/', UltraSoundController.getAll);
router.get('/:id', UltraSoundController.getById);
router.post('/', UltraSoundController.create);
router.put('/:id', UltraSoundController.update);
router.delete('/:id', UltraSoundController.delete);
router.get('/by-code/:code', UltraSoundController.getByCode);

// Multer upload middleware
const upload = UltraSoundService.upload;
// Image Upload Route
router.post(
  "/upload/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const updatedTest = await UltraSoundService.uploadImage(
        req.params.id,
        req.file.path
      );

      res.status(200).json({
        message: "Image uploaded successfully",
        filePath: req.file.path,
        updatedTest
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
module.exports = router;