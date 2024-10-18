const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    require: false,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: Number,
    required: false,
  },
  phone: {
    type: Number,
    required: false,
  },
});

const Admin = mongoose.model("admin", AdminSchema);

module.exports = Admin;
