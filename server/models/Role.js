const mongoose = require('mongoose');
const generateNextId = require('../services/generateNextId.js');
const { model, Schema } = require('mongoose');


const RoleSchema = new mongoose.Schema({
  name: {type: String, required: true,unique:[true,"please Provide Role"],trim: true},
  description: {type: String, required: true},
  code:{type: String, required: true,unique:[true,"please Provide Code"],trim: true},
},
  {
    timestamps: true,
    toObject:{virtuals: true},
    toJSON: {virtuals: true},
  }
);
//auto generating code before saving new role

RoleSchema.pre("save",async function (next) {
  if (!this.code) {
      this.code=await generateNextId(mongoose.Model("Role"),"RO-");
  }
  next();
})
module.exports= mongoose.model("Role",RoleSchema);