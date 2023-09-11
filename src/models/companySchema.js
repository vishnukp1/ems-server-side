const mongoose =require("mongoose")
const CompanySchema = new mongoose.Schema({
    name:{
        type:String,
        require:false
       },
     email:{
         type:String,
         required:false,
         
     },
     password:{
         type:String,
         required:false
     },
     company:{
         type:String,
         required:false
     },
     phone:{
         type:Number,
         required:false
     },
     

})

const Company = mongoose.model("company",CompanySchema);

module.exports =  Company;