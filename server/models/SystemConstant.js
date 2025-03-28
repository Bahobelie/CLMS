const mongoose = require('mongoose');
const generateNextId = require('../services/generateNextId.js');
const { model, Schema } = require('mongoose');


// ============================ System Constant Modal ================================//

const SystemConstants = new Schema({
  code:{type: String, required: [true,"please Provide Code"]},
  name:{type: String, required:false,default:null},
  type:{type: String, required: true},
  description:{type: String, required: true},
  index:{type: Number,required: false, default:0},
  parentId:{type: Schema.Types.ObjectId, ref:'SystemConstant',required:false},
  referenceRange:{type:String,default:null},
  isActive:{type: Boolean, default: true},
  amount:{type: Number, default:0,required:false},
  remark:{type:String,required:false,default:null},
},
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);
SystemConstants.pre("save",async function (next) {
  if (!this.code) {
    this.code=await generateNextId(mongoose.Model("SystemConstant"),"SYC-");
  }
  next();
})
module.exports= mongoose.model("SystemConstant", SystemConstants);