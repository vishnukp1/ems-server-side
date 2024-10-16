const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: String,
  description: String,
  applyOn: Date,
  company: {
    ref: "Company",
    type: mongoose.Schema.Types.ObjectId,
  },
  staff: {
    ref: "Staff",
    type: mongoose.Schema.Types.ObjectId,
  },
});

const Leave = mongoose.model("Leave", LeaveSchema);

module.exports = Leave;
