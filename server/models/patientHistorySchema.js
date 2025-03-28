const mongoose = require("mongoose");
const {model,Schema} = require('mongoose');
const generateNextId = require('../services/generateNextId.js');

//========================PatientHistory Modal ========================================//

const PatientHistorySchema=new mongoose.Schema({
  code:{type:String,required:true},

  // Chief Complaint (Symptoms)
  chiefComplaint: {
    symptoms: { type: String },
    duration: { type: String },
    severity: { type: String },
  },
  // Medical History
  medicalHistory: {
    conditions: { type: String },
    medications: { type: String },
    surgeries: { type: String },
    hospitalizations: { type: String },
  },

  // Family & Lifestyle Information
  allergies: { type: String },
  familyHistory: {
    chronicDiseases: { type: String },
    geneticConditions: { type: String },
  },

  lifestyle: {
    smoking: { type: Boolean },
    alcohol: { type: Boolean },
    drugs: { type: Boolean },
    diet: { type: String },
    exercise: { type: String },
  },
  // Current Symptoms & Treatments
  currentSymptoms: {
    painLocation: { type: String },
    painSeverity: { type: Number },
    otherSymptoms: { type: String },
  },
  previousTreatments: {
    previousDoctors: { type: String },
    medicationsTaken: { type: String },
  },
  currentTreatments: {
    currentDoctor: { type: String },
    currentMedications: { type: String },
  },
  // Immunizations
  immunizations: {
    upToDate: { type: Boolean, default: true },
    recentVaccines: { type: String },
  },
  // Patient Current Info (Vitals & Exam Findings)
  patientCurrentInfo: {
    BP: { type: String },
    PR: { type: String },
    RR: { type: String },
    oxygenSaturation: { type: String },
    temp: { type: String },
    weight: { type: String },
    height: { type: String },

    // Physical Examination Findings
    HEENT: { type: String },
    LGS: { type: String },
    RS: { type: String },
    CVS: { type: String },
    GIS: { type: String },
    GUS: { type: String },
    IS: { type: String },
    MSS: { type: String },
    CNS: { type: String },
  },
  description:{type:String,default:null},
  remark:{type:String,required:false},
},
  {
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  }
);
PatientHistorySchema.pre("save",async function(next){
  if(!this.code)
    this.code=generateNextId(mongoose.Model("PatientHistory"),"PH_");
  next();
})
module.exports= mongoose.model("PatientHistory", PatientHistorySchema);