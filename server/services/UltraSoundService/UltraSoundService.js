const CrudService = require("./../CrudService");
const multer = require("multer");
const path = require("path");

class UltraSoundService extends CrudService {
  constructor(model) {
    super(model);
  }

  async create(data) {
    const { patientId } = data;
    if (!patientId) throw new Error("Patient ID is required");

    return super.create(data);
  }

  // Multer storage setup for image uploads
  static storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/ultrasound/"); // Save images in "uploads/ultrasound/"
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
  });

  static upload = multer({ storage: UltraSoundService.storage });

  // Method to update lab test with uploaded ultrasound image
  async uploadImage(testId, filePath) {
    const test = await this.model.findByIdAndUpdate(
      testId,
      { ultrasoundImage: filePath },
      { new: true }
    );

    if (!test) {
      throw new Error("Lab Test not found");
    }
    return test;
  }
}

module.exports = UltraSoundService;
