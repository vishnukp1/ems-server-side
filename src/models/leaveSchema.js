
const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: String,
  description: String,
  applyOn: Date
});

const Leave = mongoose.model("Leave", LeaveSchema);

module.exports = Leave;
