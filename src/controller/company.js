const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");
const cloudinary = require("../uploadImg");
require("dotenv").config();
const companySchema = require("../models/companySchema");
const DepartmentSchema = require("../models/departmentShema");

const registerCompany = async (req, res) => {
  const { name, password, email, phone, company } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newcompany = new companySchema({
    name: name,
    email: email,
    password: hashedPassword,

    company: company,
    phone: phone,

    full: true,
  });

  await newcompany.save();

  res.json({ message: "company registered successfully", company });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await companySchema.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid username" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = jwt.sign({ username: user.username }, "user");

  res.json({ message: "Login successful", token, id: user._id });
};

const createstaff = async (req, res) => {
  const { name, password, email, phone, address, salary, gender, department } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: `${staffSchema._id}_profile`,
    // width: 500,
    // height: 500,
    // crop: 'fill',
  });

  console.log("result", result);
  const staff = new staffSchema({
    name: name,
    password: hashedPassword,
    phone: phone,
    email: email,
    address: address,
    imagepath: result.secure_url,
    salary: salary,
    gender: gender,
    address: address,
    department: department,
    full: true,
  });

  await staff.save();
  res.json({ message: "User account registered successfully", staff });
};

const createdepartment = async (req, res) => {
  const { title, description, salary } = req.body;

  const department = new DepartmentSchema({
    title: title,

    full: true,
  });

  await department.save();

  res.json({ message: "Department created successfully", user });
};

const getDepartment = async (req, res) => {
  const department = await DepartmentSchema.find();
  res.json(department);
};

const deleteDepartment = async (req, res) => {
  const department = await DepartmentSchema.findByIdAndDelete(req.params.id);
  res.json(department);
};

const getAllStaff = async (req, res) => {
  const allStaff = await staffSchema.find();
  res.json(allStaff);
};

const getStaff = async (req, res) => {
  const staff = await staffSchema.findById(req.params.id);
  res.json(staff);
};

const searchStaffByName = async (req, res) => {
  const { name } = req.query;
  const search = await staffSchema.find({
    name: { $regex: new RegExp(name, "i") },
  });
  res.json(search);
};

const searchDepartment = async (req, res) => {
  const { department } = req.query;
  const search = await staffSchema.find({
    department: { $regex: new RegExp(`^${department}$`, "i") },
  });
  res.json(search);
};

const updateStaff = async (req, res) => {
  const updatedstaff = await staffSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (updatedstaff) {
    console.log("supdatedstaff updated:", updatedstaff);
    res.json(updatedstaff);
  } else {
    res.status(404).json({ error: "Staff not found" });
  }
};

const deleteStaff = async (req, res) => {
  const deleteStaff = await staffSchema.findByIdAndDelete(req.params.id);
  res.json(deleteStaff);
};

const addTask = async (req, res) => {
  const { title, startTime, endTime, status } = req.body;

  const staff = await staffSchema.findById(req.params.id);
  if (!staff) {
    return res.status(404).json({ error: "Staff not found" });
  }

  staff.tasks.push({
    title: title,
    startTime: startTime,
    endTime: endTime,
    status: status,
  });

  await staff.save();
  res.json({ message: "Task added to staff successfully", staff });
};

const getTaskById = async (req, res) => {
  const { staffId, taskId } = req.params;

  const staff = await staffSchema.findById(staffId);
  if (!staff) {
    return res.status(404).json({ error: "Staff not found" });
  }

  const task = staff.tasks.id(taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json({ task });
};

const getAllTasks = async (req, res) => {
  const allStaffsTasks = await staffSchema.aggregate([
    {
      $unwind: "$tasks",
    },
    {
      $project: {
        _id: 0,
        staffId: "$_id",
        name: "$name",
        taskId: "$tasks._id",
        taskTitle: "$tasks.title",
        startTime: "$tasks.startTime",
        endTime: "$tasks.endTime",
        status: "$tasks.status",
      },
    },
  ]);

  if (allStaffsTasks.length > 0) {
    res.json({ tasks: allStaffsTasks });
  } else {
    res.json({ tasks: [] });
  }
};

//  TODO: Implement joi validation to all POST,PUT,,PATCH routes

const searchTaskByName = async (req, res) => {
  const { name } = req.query;
  const searchResults = await staffSchema.aggregate([
    {
      $match: {
        name: { $regex: new RegExp(name, "i") },
      },
    },
    {
      $unwind: "$tasks",
    },
    {
      $project: {
        _id: 0,
        staffId: "$_id",
        name: "$name",
        taskId: "$tasks._id",
        taskTitle: "$tasks.title",
        startTime: "$tasks.startTime",
        endTime: "$tasks.endTime",
        status: "$tasks.status",
      },
    },
  ]);

  res.json({ tasks: searchResults });
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  const staff = await staffSchema.findById(req.params.id);
  if (!staff) {
    return res.status(404).json({ error: "Staff not found" });
  }

  const taskIndex = staff.tasks.findIndex(
    (task) => task._id.toString() === taskId
  );

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  staff.tasks.splice(taskIndex, 1);
  await staff.save();

  res.json({ message: "Task deleted successfully", staff });
};

const updateTask = async (req, res) => {
  const { staffId, taskId } = req.params;
  const { title, startTime, endTime, status, name } = req.body;

  const updatedTask = await staffSchema.findOneAndUpdate(
    {
      _id: staffId,
      "tasks._id": taskId,
    },
    {
      $set: {
        "tasks.$.title": title,
        "tasks.$.startTime": startTime,
        "tasks.$.endTime": endTime,
        "tasks.$.status": status,
      },
    },
    { new: true }
  );

  if (updatedTask) {
    console.log("Updated Task:", updatedTask);
    res.json(updatedTask);
  } else {
    res.status(404).json({ error: "Task or Staff not found" });
  }
};

module.exports = {
  createstaff,
  registerCompany,
  getStaff,
  getAllStaff,
  searchStaffByName,
  updateStaff,
  deleteStaff,
  addTask,
  loginUser,
  deleteTask,
  getTaskById,
  updateTask,
  getAllTasks,
  searchTaskByName,
  createdepartment,
  getDepartment,
  deleteDepartment,
  searchDepartment,
};
