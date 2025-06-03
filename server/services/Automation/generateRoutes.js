
const fs = require('fs');
const path = require('path');
// List of models
const models = ['Admin', 'LapReport', 'LabTest', 'PatientHistory',"Patient","SystemConstant","UltraSound"]; // Add your models here

const generateRoute = (modelName) => {
  return `const express = require('express');
const  ${modelName}  = require('../models/${modelName}.js');
const  CrudService  = require('../services/CrudService.js');
const CrudController  = require('../controllers/crudControllr.js');


const ${modelName}Service = new CrudService(${modelName});
const ${modelName}Controller = new CrudController(${modelName}Service);

const router = express.Router();

router.get('/', ${modelName}Controller.getAll);
router.get('/:id', ${modelName}Controller.getById);
router.post('/', ${modelName}Controller.create);
router.put('/:id', ${modelName}Controller.update);
router.delete('/:id', ${modelName}Controller.delete);
router.get('/by-code:code', ${modelName}Controller.getByCode);

module.exports = router;`;
};

const routesDir = path.join(__dirname, '../../routes');
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir);
}

models.forEach((model) => {
  const filePath = path.join(routesDir, `${model.toLowerCase()}Routes.js`);
  fs.writeFileSync(filePath, generateRoute(model));
  console.log(`Generated: ${filePath}`);
});
