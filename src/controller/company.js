const fs = require("fs")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");
const cloudinary = require("../uploadImg");
require("dotenv").config();
const companySchema = require("../models/companySchema");
const DepartmentSchema = require("../models/departmentShema");
const nodemailer = require("nodemailer"); // Import the nodemailer library
const randomstring = require("randomstring");
const validate = require("../validation/schemaValidation");

const registerCompany = async (req, res) => {
  const { error, value } = validate.companyValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { name, password, email, phone, company } = value;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new companySchema({
    name: name,
    email: email,
    password: hashedPassword,

    company: company,
    phone: phone,

    full: true,
  });

  await user.save();
  const token = jwt.sign({ username: user.username }, "user");

  res.status(200).json({
    status: "success",
    message: "company created succesfully",
    data: company,
    token: token,
  });
};

const loginUser = async (req, res) => {
  const { error, value } = validate.staffValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = value;

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
  try {
    const { name, email, phone, address, salary, gender, department } = req.body;

   
    const password = randomstring.generate(8);

  
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `${staffSchema._id}_profile`,
    });

  
    fs.unlinkSync(req.file.path);

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
    });

    await staff.save();
console.log(process.env.email);
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    
   
    const mailOptions = {
      from: process.env.email,
      to: email, 
      subject: "Your New Password",
      text: `Your new password is: ${password}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({
          status: "error",
          message: "Email could not be sent",
          error: error.message,
        });
      } else {
        console.log("Email sent:", info.response);
        res.status(200).json({
          status: "success",
          message: "Staff created successfully",
          data: staff,
          generatedPassword: password,
        });
      }
    });
    
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


const createdepartment = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is not added" });
  }

  const department = new DepartmentSchema({
    title: title,
    full: true,
  });

  await department.save();

  res.status(200).json({
    message: "Department created successfully",
    data: department,
    status: "success",
  });
};

const getDepartment = async (req, res) => {
  const department = await DepartmentSchema.find();
  res.status(200).json({
    message: "Department got successfully",
    data: department,
    status: "success",
  });
};

const deleteDepartment = async (req, res) => {
  const department = await DepartmentSchema.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: "Department deleted successfully",
    data: department,
    status: "success",
  });
};

const getAllStaff = async (req, res) => {
  const allStaff = await staffSchema.find();
  res.status(200).json({
    message: "Got all staffs successfully",
    data: allStaff,
    status: "success",
  });
};

const getStaff = async (req, res) => {
  const staff = await staffSchema.findById(req.params.id);
  res.status(200).json({
    message: "Got all staffs successfully",
    data: staff,
    status: "success",
  });
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
  if (!title || !startTime || !endTime || !status) {
    return res.status(400).json({ error: "All fields are required" });
  }

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
  res.status(200).json({
    message: "Department created successfully",
    data: staff,
    status: "success",
  });
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
    res.status(200).json({
      massage: "Got all tasks",
      status: "success",
      tasks: allStaffsTasks,
    });
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
  const { id } = req.params;
  const { taskId } = req.params;
  const { title, startTime, endTime, status } = req.body;

  try {
    const updatedTask = await staffSchema.findOneAndUpdate(
      {
        _id: id,
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
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const markattendance = async (req, res) => {
  try {
    const selectedStaffIds = req.body.selectedStaff;
    const attendanceStatus = req.body.status;
    const attendanceDate = new Date();

    for (const staffId of selectedStaffIds) {
      const staff = await staffSchema.findById(staffId);

      if (!staff) {
        return res
          .status(404)
          .json({ message: `Staff with ID ${staffId} not found` });
      }

      const existingAttendanceRecord = staff.attendance.find(
        (record) => record.date.toDateString() === attendanceDate.toDateString()
      );

      if (existingAttendanceRecord) {
        existingAttendanceRecord.status = attendanceStatus;
      } else {
        const newAttendanceRecord = {
          date: attendanceDate,
          status: attendanceStatus,
        };

        staff.attendance.push(newAttendanceRecord);
      }

      await staff.save();
    }

    res.status(200).json({
      message: "Attendance marked successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Error marking attendance" });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const attendanceDate = new Date(req.body.date);
    const attendanceStatus = req.body.status;

    const staff = await staffSchema.findById(staffId);

    if (!staff) {
      return res
        .status(404)
        .json({ message: `Staff with ID ${staffId} not found` });
    }

    const attendanceRecord = staff.attendance.find(
      (record) => record.date.toDateString() === attendanceDate.toDateString()
    );

    if (attendanceRecord) {
      attendanceRecord.status = attendanceStatus;
      await staff.save();

      return res.status(200).json({
        message: "Attendance updated successfully",
        status: "success",
        data: staff,
      });
    } else {
      return res.status(404).json({
        message: `No attendance record found for date: ${attendanceDate}`,
      });
    }
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Error updating attendance" });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const attendanceDate = new Date(req.body.date);

    const staff = await staffSchema.findById(staffId);

    if (!staff) {
      return res
        .status(404)
        .json({ message: `Staff with ID ${staffId} not found` });
    }

    const attendanceIndex = staff.attendance.findIndex(
      (record) => record.date.toDateString() === attendanceDate.toDateString()
    );

    if (attendanceIndex !== -1) {
      staff.attendance.splice(attendanceIndex, 1);
      await staff.save();

      return res.status(200).json({
        message: "Attendance deleted successfully",
        status: "success",
        data: staff,
      });
    } else {
      return res.status(404).json({
        message: `No attendance record found for date: ${attendanceDate}`,
      });
    }
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ message: "Error deleting attendance" });
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
  markattendance,
  updateAttendance,
  deleteAttendance,
};
