const CrudService = require('./../CrudService');
const multer = require('multer');
const path = require('path');

class LabTestService extends CrudService {
  constructor(model) {
    super(model);
  }

  /**
   * Creates a single lab test (with uniqueness check)
   */
  async create(data) {
    const { code} = data;

    const existingLabTest = await this.model.findOne({
      where: {code },
    });

    if (existingLabTest) {
      throw new Error("LabTest with the same patient ID and code already exists");
    }

    return super.create(data);
  }
  static getUploadLogoMiddleware() {
    return (req, res, next) => {
      multer({
        storage: multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, 'uploads/logo/');
          },
          filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            const fileName = file.originalname;
            cb(null, fileName);
          }
        })
      }).single('logo')(req, res, next);  // Calling the multer middleware here
    };
  }
}

module.exports = LabTestService;