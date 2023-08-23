const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");

  const createUser = async (req, res) => {

    const { name, password, email, phone, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = new staffSchema({
      name: name,
      password: hashedPassword,
      phone: phone,
      email: email,
      address: address,
    });

    await staff.save();
    res.json({ message: "User a 432 ccount registered successfully", staff });

};

const getAllStaff = async (req,res) =>{
  const allStaff = await staffSchema.find()
  res.json(allStaff)
}

const getStaff = async (req,res) =>{
  const staff = await staffSchema.findById(req.params.id)
  res.json(staff)
}



const getEmployeeDetails = async (req, res) => {
 
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json({ staff });
 
};

const getEmployeeTasks = async (req, res) => {
 
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const tasks = staff.tasks;
    res.json({ tasks });

};

const getStaffsTasks = async (req, res) => {
 
    const allStaffs = await Staff.find();
     res.json({allStaffs})
    const allTasks = allStaffs.map(staff => staff.tasks);

  
    const flattenedTasks = allTasks.reduce((acc, tasks) => acc.concat(tasks), []);

    res.json({ tasks: flattenedTasks });
 
};

const getEmployeePerformances = async (req, res) => {
  
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const performances = staff.performances;
    res.json({ performances });

};

const getEmployeeAttendance = async (req, res) => {
  
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const attendance = staff.attendance;
    res.json({ attendance });

};

const getEmployeeLeaves = async (req, res) => {
  
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const leaves = staff.leaves;
    res.json({ leaves });

};

module.exports = {
    createUser,
    getStaff,
    getAllStaff,
    getEmployeeDetails,
    getEmployeeTasks,
    getEmployeePerformances,
    getEmployeeAttendance,
    getEmployeeLeaves,
    getStaffsTasks
}