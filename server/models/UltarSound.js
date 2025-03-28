const mongoose = require('mongoose');
const generateNextId = require('../services/generateNextId.js');
const { model, Schema, Mongoose } = require('mongoose');

const UltarSound= new Schema({
        cod:{type:String,required: true,unique:true},
        patientId:{type:Schema.Types.ObjectId,ref:"Patient",required:true},
        imageUrl:{type:String,required:false},
        description:{type:String,required:false},
        remark:{type:String,required:false},
},
  {timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}}
);
UltarSound.pre("save",async function(next){
        if(!this.code){
                this.code=await generateNextId(Mongoose.Model("UltarSound"),"ULS-");
        }
        next();
})

module.exports= model("Ultrasound",UltarSound);