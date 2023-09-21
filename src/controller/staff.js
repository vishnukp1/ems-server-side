const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");
const validate = require("../validation/schemaValidation");
const Department = require("../models/dpartmentSchema");

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

const loginStaff = async (req, res) => {
  const { error, value } = validate.staffValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = value;

  const user = await staffSchema.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid username" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = jwt.sign({ username: user.username }, "user");

  res.json({ message: "Login successful", token, id: user._id });
};


const getAllStaff = async (req,res) =>{
  const allStaff = await staffSchema.find()
  res.json(allStaff)
}

const getStaff = async (req, res) => {
  try {
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const department = await Department.findOne({ _id: staff.department[0] });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    console.log('Department:', department);

    await department.save()
    res.json({staff: staff,
      department: department.title,});
  } catch (error) {
    console.error('Error fetching staff data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



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

const getTaskById = async (req, res) => {
  const { staffId } = req.params;

  try {
    const staff = await staffSchema.findById(staffId);
    
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const tasks = staff.tasks; // Assuming "tasks" is the array containing tasks for a staff member

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
    getStaffsTasks,
    loginStaff,
    getTaskById
}