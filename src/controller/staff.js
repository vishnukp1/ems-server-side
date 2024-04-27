const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");
const validate = require("../validation/schemaValidation");
const Department = require("../models/dpartmentSchema");
const Leave = require("../models/leaveSchema");

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
    console.log("User not found for email:", email);
    return res.status(401).json({ error: "User not found" });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = jwt.sign({ username: user.username }, "user");

  console.log(user);

  res.json({ message: "Login successful", token, id: user._id });
};

const getAllStaff = async (req, res) => {
  const allStaff = await staffSchema.find({ company: req.company._id });
  res.json(allStaff);
};

const getStaff = async (req, res) => {
  try {
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const department = await Department.findOne({ _id: staff.department });
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    console.log("Department:", department);

    await department.save();
    res.json({ staff: staff, department: department.title });
  } catch (error) {
    console.error("Error fetching staff data:", error);
    res.status(500).json({ error: "Internal server error" });
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
  const allStaffs = await staffSchema.find();
  res.json({ allStaffs });
  const allTasks = allStaffs.map((staff) => staff.tasks);

  const flattenedTasks = allTasks.reduce((acc, tasks) => acc.concat(tasks), []);

  res.json({ tasks: flattenedTasks });
};

const applyLeave = async (req, res) => {
  const staffId = req.params.id;

  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  console.log("req.body:", req.body);

  const leaveRequest = new Leave({
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    reason: req.body.reason,
    status: "Pending",
    description: req.body.description,
    applyOn: formattedDate,
    company: req.company._id,
    full: true,
  });

  console.log("ever okk");
  try {
    await leaveRequest.save();
  } catch (error) {
    console.error("Error saving leave request:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while processing the leave request",
      });
  }

  const staffMember = await staffSchema.findById(staffId);
  staffMember.leaves.push(leaveRequest._id);
  await staffMember.save();

  res.json({ message: "Leave request submitted successfully", staffMember });
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

  const staff = await staffSchema.findById(staffId);

  if (!staff) {
    return res.status(404).json({ error: "Staff not found" });
  }

  const tasks = staff.tasks;

  res.json({ tasks });
};

const getApprovedleave = async (req, res) => {
  const { id } = req.params;

  const staff = await staffSchema.findById(id).populate("leaves");

  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  const approvedLeaves = staff.leaves.filter(
    (leave) => leave.status === "approved"
  );

  res
    .status(200)
    .json({ message: "Got approved leave successfully", data: approvedLeaves });
};

module.exports = {
  createUser,
  getStaff,
  getAllStaff,
  getEmployeeDetails,
  getEmployeeTasks,

  getEmployeeAttendance,
  getEmployeeLeaves,
  getStaffsTasks,
  loginStaff,
  getTaskById,
  applyLeave,
  getApprovedleave,
};
