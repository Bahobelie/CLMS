const mongoose = require('mongoose');
const generateNextId = require('../services/generateNextId.js');
const { model, Schema } = require('mongoose');
const bcrypt = require('bcryptjs');

const AdministratorSchema = new Schema({
  code: {type: String, required: false},
  name: {type: String, required: [true,"please enter name"]},
  email: {type: String, required: [true,"please enter email"],unique:true},
  password: {type: String, required: [true,"please enter password"]},
  phoneNumber: {type: String, required: [true,"please enter phone"],unique:true},
  role:{type:Schema.Types.ObjectId, ref:'Role',required:[true,"please Provide Role"]},
},
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);
AdministratorSchema.pre("save", async function (next) {
 console.log("Before saving:", this);

  if (!this.code) {
    this.code = await generateNextId(this.constructor, "AD-");
  }
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
AdministratorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = model("Administrator", AdministratorSchema);