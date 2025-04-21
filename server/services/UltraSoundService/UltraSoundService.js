const CrudService = require("./../CrudService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
    const patientName = req.body.patientName ||
      file.originalname.split('.')[0] ||
      'unknown';
    const fileName = `${patientName}-${Date.now()}${ext}`;

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
    const { patientId ,patientName} = data;

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
}

module.exports = UltraSoundService;
