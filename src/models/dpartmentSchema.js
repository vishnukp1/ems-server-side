const mongoose = require("mongoose")

const DepartmentSchema = new mongoose.Schema({
    title:{
        type:String,
        require:false
       },


})

const Department = mongoose.model("department",DepartmentSchema)

module.exports = Department