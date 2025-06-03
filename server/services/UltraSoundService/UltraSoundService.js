const CrudService = require("./../CrudService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Patient = require("../../models/patientSchema");

const uploadDir = 'uploads/images/';

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for storing images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // e.g. .png
    const patientName = req.query.patientName || 'unknown';
    const code = req.query.code || 'unknown';

    const fileName = `${patientName}-${code}${ext}`;

    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage
});

class UltraSoundService extends CrudService {
  constructor(model) {
    super(model);
  }

  async create(data, filePath) {
    const { patientId, patientName } = data;

    if (!patientId) throw new Error("Patient ID is required");

    const imageUrl = filePath ? filePath.replace(/\\/g, '/') : null;

    return this.model.create({
      ...data,
      imageUrl,
      patientName
    });
  }

  static getUploadMiddleware() {
    return upload.single('image'); // Make sure your frontend uses 'image' as the field name
  }

  async delete(id) {
    try {
      // Step 1: Find the record in the database
      const record = await this.model.findOne({ where: { id } });
      if (!record) throw new Error("Record not found");

      // Step 2: Find the patient associated with the record
      const patient = await Patient.findOne({ where: { id: record.patientId } });

      const patientName = patient.first_name || 'unknown';
      const code = record.code || 'unknown';
      const ext = path.extname(record.imageUrl) || '.png';

      const fileName = `${patientName}-${code}${ext}`;

      // Step 3: Delete the file from the filesystem
      const filePath = path.join(__dirname, '..', '..', 'uploads', 'images', fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);  // Deletes the file
        console.log(`File ${filePath} deleted successfully`);
      }

      // Step 4: Delete the record from the database
      await this.model.destroy({ where: { id } });

      return { message: 'Record and file deleted successfully' };
    } catch (error) {
      console.error('Error deleting record and file:', error);
      throw new Error('Failed to delete record and file');
    }
  }

}

module.exports = UltraSoundService;
