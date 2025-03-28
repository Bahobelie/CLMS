
const mongoose = require("mongoose");

//=====================================LabReport Modal ====================================//

const LabReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  labTestId: { type: mongoose.Schema.Types.ObjectId, ref: "LabTest", required: true },
  testDate: { type: Date, default: Date.now },
  resultDate: { type: Date },
  result: { type: String, required: true }, // Example: "Positive", "Negative"
  remarks: { type: String },
  reportFileUrl: { type: String }, // If report is a file (PDF, Image)
});

module.exports = mongoose.model("LabReport", LabReportSchema);
