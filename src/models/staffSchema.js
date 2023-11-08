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
     company:
      {
        ref: "company",
        type: mongoose.Schema.Types.ObjectId,
      },
    email:{
         type:String,
         required:false
     },
     password:{
         type:String,
         required:false
     },
     department:
      {
        ref: "department",
        type: mongoose.Schema.Types.ObjectId,
      },
    
     imagepath:{
        type:Array,
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
          TimeIn:Date,
          TimeOut:Date,
          status: String ,
    
        }
      ],
      
      leaves: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Leave",
        }
      ]
      ,
    
      tasks: [
        {
          title: String,
          startTime: Date,
          endTime: Date,
          status: String
        }
      ],
     
      salaries: [
        {
          name: String,
          salary: Number,
          allowances: {
            housingAllowance: Number,
            transportAllowance: Number,
            mealAllowance: Number,
            // Add more allowance options as needed
          },
          deductions: {
            taxDeduction: Number,
            insuranceDeduction: Number,
            loanDeduction: Number,
            // Add more deduction options as needed
          },
          netSalary: Number,
          month: String,
          datePaid: Date,
      }
      ]

})

const Staff = mongoose.model("staff",StaffSchema)

module.exports = Staff;