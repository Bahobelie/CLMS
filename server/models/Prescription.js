
const mongoose = require('mongoose');
const {Model,Schema, Mongoose } = require('mongoose');
const generateNextId=require('./../services/generateNextId');

const Prescription = new Schema({
  code:{type:String,unique:true},
  clinicName:{type:String,require:true},
  patientName: {type:String,require:true},
  age:{type:Number,require:false},
  weight:{type:Number,require:false},
  cardNo:{type:String,require:true},
  region:{type:String,require:false},
  town:{type:String,require:false},
  gender:{type:String,require:false},
  woreda:{type:String,require:false},
  kebele:{type:String,require:false},
  tel:{type:Number,require:false},
  dx:{type:Number,require:false},
  prscriberName:{type:String,require:false},
  prescriberQualification:{type:String,require:false},
  dispenserName:{type:String,require:false},
  price:{type:Number,require:false},
  totalPrice:{type:Number,require:false},
patientId:{type:Mongoose.Schema.Types.ObjectId,ref:"Patient",required:true},
  dynamicFields:{
    type:[
      {
        name:String,
        value:String,
      }
    ],
    default:null
  }
},
  {
    timestamps:true,
    toJSON:true,
    toObject:true
  }
);
Prescription.pre("save",async function(next){
  if(!this.code)
    this.code=await generateNextId(mongoose.model("Prescription"),("PR-"))
})
module.exports=Prescription;