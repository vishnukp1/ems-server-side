const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
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
});

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;
