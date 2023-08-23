const mongoose = require("mongoose")

const DepartmentSchema = new mongoose.Schema({
    title:{
        type:String,
        require:false
       },
    description:{
         type:String,
         required:false,
         
     },
    salary:{
         type:Number,
         required:false
     },

})

const Department = mongoose.model("department",DepartmentSchema)

module.exports = Department