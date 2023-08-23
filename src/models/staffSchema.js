const mongoose = require("mongoose")

const StaffSchema = new mongoose.Schema({
    name:{
        type:String,
        default: "Default Name",
       },
     phone:{
         type:String,
         required:false, 
         
     },
    email:{
         type:String,
         required:false
     },
     password:{
         type:String,
         required:false
     },
     position:{
         type:String,
         required:false
     },
     imagepath:{
        type:String,
        default: "Default Name",
       },
      address:{
        type:String,
        required:false
       },
       
     gender:{
         type:String,
         required:false,
         
     },
    salary:{
         type:Number,
         required:false
     },
  
     performances: [
        {
          date: Date,
          rating: Number,
        }
      ],
      attendance: [
        {
          date: Date,
          status: String,
        }
      ],
    
      leaves: [
        {
          fromDate: Date,
          toDate: Date,
          reason: String,
          status: String,
        }
      ],
    
      tasks: [
        {
          title: String,
          startTime: Date,
          endTime: Date,
          status: String, 
        }
      ],
     
      salaries: [
        {
          month: Number,
          year: Number,
          amount: Number,
        
        }
      ]

})

const Staff = mongoose.model("staff",StaffSchema)

module.exports = Staff;