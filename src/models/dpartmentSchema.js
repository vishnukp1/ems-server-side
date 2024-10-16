const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  title: {
    type: String,
    require: false,
  },

  company: {
    ref: "company",
    type: mongoose.Schema.Types.ObjectId,
  },
});

const Department = mongoose.model("department", DepartmentSchema);

module.exports = Department;
