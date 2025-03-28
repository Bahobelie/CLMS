
const mongoose = require('mongoose');
const generateNextId = require('../services/generateNextId.js');
const { model, Schema } = require('mongoose');


// ========================================= Patient Model =================================//

const PatientSchema=new mongoose.Schema({
  code:{type:String,required:true},
  firstName:{type:String,required:true},
  middleName:{type:String,required:true},
  lastName:{type:String,required:false},
  gender: { type: String, enum: ["Male", "Female"], required: true, },
  dateOfBirth: { type: Date, required:false},
  age:{type:Number,required:true},
  phoneNumber:{type:String,required:false,minlength:10,maxlength:10},
  BMI: { type: String, enum: ["No", "Weight", "Height", "Both Height and Weight"],required:false},
  BP: { type: String, enum: ["Yes", "No"] },
  bloodGroup: { type: String, enum: ["Unknown", "To Test", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",]},
  country: { type: String, default: "Ethiopia",required:false},
  districtState: { type: String, enum: ["Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromiya", "Somali", "SNNPR", "Tigray"]},
  applicationFee: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid"},
  remarks: { type: String, default: "Remark" },
},
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON:{virtuals:true},
  }
  );
PatientSchema.pre("save",async function(next){
  if(!this.code)
    this.code=await generateNextId(mongoose.model("Patient"),("PA-"));
  next();
});

module.exports= mongoose.model("Patient", PatientSchema);