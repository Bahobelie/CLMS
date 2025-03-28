const mongoose = require("mongoose");
const { Types } = require('mongoose');
const generateNextId = require('../services/generateNextId.js');
const { model, Schema } = require('mongoose');

// ====================================LabTest Model =======================================//

const LabTestSchema = new mongoose.Schema({
  code:{type:String,unique:true},
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  estimatedTimeInHours: { type: Number, required: false }, // Time to get results
  isActive: { type: Boolean, default: true },
  patientId:{type:Types.ObjectId, ref: "Patient",required: true,default: null },
  result:{type:String,required:false,default:null},
  referenceRange:{type:String, required: false },
  status:{type:String, enum:["pending","complete"],required:false},
  remark:{type:String,required:false},
},
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);
LabTestSchema.pre("save",async function (next) {
  if (!this.code) {
    this.code=await generateNextId(mongoose.model("LabTest"),"LT-");
  }
  next();
})
module.exports = mongoose.model("LabTest", LabTestSchema);
