const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");
const cloudinary = require("../uploadImg");
require("dotenv").config();
const companySchema = require("../models/companySchema");
const DepartmentSchema = require("../models/dpartmentSchema");
const nodemailer = require("nodemailer"); // Import the nodemailer library
const randomstring = require("randomstring");
const validate = require("../validation/schemaValidation");
const Leave = require("../models/leaveSchema");
const salarySchema = require("../models/salarySchema");
const { log } = require("console");

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
    data: user,
    token: token,
    companyId: user._id,
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

  res.json({ message: "Login successful", token, companyId: user._id });
};

const createstaff = async (req, res) => {
  const { name, email, phone, address, salary, gender, department } = req.body;

  const password = randomstring.generate(8);

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: `${name.replace(/\s+/g, "_").toLowerCase()}_profile`,
  });

  fs.unlinkSync(req.file.path);

  let departmentObj = null;
  if (department) {
    departmentObj = await DepartmentSchema.findOne({ title: department });
    if (!departmentObj) {
      departmentObj = new DepartmentSchema({ title: department });
      await departmentObj.save();
    }
  }

  console.log("dptobj", departmentObj);

  const staff = new staffSchema({
    name: name,
    password: hashedPassword,
    phone: phone,
    email: email,
    address: address,
    company: req.company._id,
    imagepath: result.secure_url,
    salary: salary,
    gender: gender,
    department: departmentObj ? departmentObj._id : null,
  });

  await staff.save();

  res.json({ staff });

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
};

const createdepartment = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is not added" });
  }

  const department = new DepartmentSchema({
    title: title,
    company: req.company._id,
    full: true,
  });

  await department.save();

  res.status(200).json({
    message: "Department created successfully",
    data: department,
    status: "success",
  });
};

const updateDepartment = async (req, res) => {
  console.log(req.body);
  const updatedDepartment = await DepartmentSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (updatedDepartment) {
    console.log("supdatedstaff updated:", updatedDepartment);
    res.json(updatedDepartment);
  } else {
    res.status(404).json({ error: "Staff not found" });
  }
};

const getDepartment = async (req, res) => {
  const department = await DepartmentSchema.find({ company: req.company._id });

  res.status(200).json({
    message: "Department got successfully",
    data: department,
    status: "success",
  });
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await DepartmentSchema.findOne({
      company: req.company._id,
      _id: req.params.id,
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    console.log(department);

    res.status(200).json({
      department,
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
  try {
    const allStaff = await staffSchema
      .find({ company: req.company._id })
      .populate("department");
    res.status(200).json({
      message: "Got all staffs successfully",
      data: allStaff,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getStaff = async (req, res) => {
  const staff = await staffSchema.findById(req.params.id);
  res.status(200).json({
    message: "Got all staffs successfully",
    data: staff,
    status: "success",
  });
};

const getAllStaffPage = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = 5;
  try {
    const totalStaffCount = await staffSchema.countDocuments({
      company: req.company._id,
    });

    const allStaff = await staffSchema
      .find({ company: req.company._id })
      .populate("department")
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Got all staffs successfully",
      data: allStaff,
      status: "success",
      currentPage: page,
      totalPages: Math.ceil(totalStaffCount / perPage),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchStaffByName = async (req, res) => {
  const { name } = req.query;
  console.log(name);
  const search = await staffSchema
    .find({
      $and: [
        { company: req.company._id },
        { name: { $regex: new RegExp(name, "i") } },
      ],
    })
    .populate("department");
  console.log(search);
  res.json(search);
};

const searchDepartment = async (req, res) => {
  const { department } = req.query;

  const search = await staffSchema
    .find({ department: department })
    .populate("department");

  console.log(search.department);
  res.status(200).json({
    data: search,
    status: "success",
  });
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

  try {
    const staff = await staffSchema.findById(staffId);

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const task = staff.tasks.find((task) => task._id.toString() === taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllTasks = async (req, res) => {
  const allStaffsTasks = await staffSchema.aggregate([
    {
      $match: {
        company: req.company._id,
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
};

const markattendance = async (req, res) => {
  const attendanceData = req.body;

  if (!Array.isArray(attendanceData)) {
    return res.status(400).json({ error: "Invalid attendance data format" });
  }

  const insertedAttendanceRecords = [];

  for (const record of attendanceData) {
    const { staffId, TimeIn, TimeOut, status, date } = record;
    const attendanceDate = new Date(date);

    const staff = await staffSchema.findById(staffId).populate("department");

    if (!staff) {
      return res
        .status(404)
        .json({ error: `Staff member with ID ${staffId} not found` });
    }

    const existingAttendanceRecord = staff.attendance.find((record) => {
      return record.date.toDateString() === attendanceDate.toDateString();
    });

    console.log(existingAttendanceRecord);
    if (existingAttendanceRecord) {
      existingAttendanceRecord.status = status;
      existingAttendanceRecord.TimeIn = new Date(TimeIn);
      existingAttendanceRecord.TimeOut = new Date(TimeOut);
    } else {
      const newAttendanceRecord = {
        date: attendanceDate,
        TimeIn: new Date(TimeIn),
        TimeOut: new Date(TimeOut),
        status: status,
      };

      staff.attendance.push(newAttendanceRecord);
    }

    await staff.save();

    console.log(staffId);

    insertedAttendanceRecords.push({
      staffId: staff._id,
      date: attendanceDate,
      status: status,
    });
  }

  res
    .status(201)
    .json({
      message: "Attendance registered successfully",
      data: insertedAttendanceRecords,
    });
};

const updateAttendance = async (req, res) => {
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
};

const deleteAttendance = async (req, res) => {
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
};

const getleaveRequest = async (req, res) => {
  const date = req.params.date;

  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  try {
    const staffMembersWithLeaveData = await staffSchema
      .find({
        $and: [{ company: req.company._id }],
      })
      .populate({
        path: "leaves",
        match: { applyOn: date },
        model: "Leave",
      })
      .select("name leaves");

    if (!staffMembersWithLeaveData || staffMembersWithLeaveData.length === 0) {
      return res
        .status(404)
        .json({
          error:
            "No staff members found with leave data for the specified date",
        });
    }

    const leaveDataForStaff = staffMembersWithLeaveData.reduce(
      (result, staff) => {
        const leaveData = staff.leaves.map((leave) => ({
          _id: leave._id,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          reason: leave.reason,
          status: leave.status,
          description: leave.description,
          applyOn: leave.applyOn,
          staffName: staff.name,
        }));

        return result.concat(leaveData);
      },
      []
    );

    console.log(leaveDataForStaff);

    res.status(200).json({
      message: "Successfully leave Got",
      data: leaveDataForStaff,
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching leave requests" });
  }
};

const approveleave = async (req, res) => {
  const leaveId = req.params.leaveId;
  const status = req.body.status;

  const leaveRequest = await Leave.findByIdAndUpdate(
    leaveId,
    { status },
    { new: true }
  );

  if (!leaveRequest) {
    return res.status(404).json({ error: "Leave request not found" });
  }

  res.status(200).json({
    message: "Leave request updated successfully",
    data: leaveRequest,
  });
};

const deleteLeave = async (req, res) => {
  try {
    const leaveId = req.params.leaveId;

    const deletedLeave = await Leave.findByIdAndDelete(leaveId);

    if (!deletedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res
      .status(200)
      .json({ message: "Leave request deleted successfully", deletedLeave });
  } catch (error) {
    console.error("Error deleting leave request:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the leave request" });
  }
};

const getAttendanceByDate = async (req, res) => {
  try {
    const currentDate = new Date(req.params.date);
    currentDate.setHours(0, 0, 0, 0);

    console.log("date ", currentDate);

    const attendanceRecords = await staffSchema.aggregate([
      {
        $match: {
          company: req.company._id,
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $project: {
          _id: 1,
          name: "$name",
          department: { $arrayElemAt: ["$departmentInfo.title", 0] },
          attendance: {
            $filter: {
              input: "$attendance",
              as: "att",
              cond: {
                $and: [
                  {
                    $gte: ["$$att.date", currentDate],
                  },
                  {
                    $lt: [
                      "$$att.date",
                      new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      message: "Attendance retrieved successfully",
      status: "success",
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAttendance = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceRecords = await staffSchema.aggregate([
    {
      $match: {
        company: req.company._id,
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $unwind: {
        path: "$attendance",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        staffId: "$_id",
        staffName: "$name",
        department: { $arrayElemAt: ["$departmentInfo.title", 0] },
        attendance: "$attendance",
      },
    },
  ]);

  res.status(200).json({
    message: "Attendance retrieved successfully",
    status: "success",
    data: attendanceRecords,
  });
};

const getAttendancebyDepartment = async (req, res) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const departments = req.query.department;

  console.log("date ", departments);

  const attendanceRecords = await staffSchema.aggregate([
    {
      $match: {
        company: req.company._id,
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $project: {
        _id: 1,
        name: "$name",
        department: { $arrayElemAt: ["$departmentInfo.title", 0] },
        attendance: {
          $filter: {
            input: "$attendance",
            as: "att",
            cond: {
              $and: [
                {
                  $gte: ["$$att.date", currentDate],
                },
                {
                  $lt: [
                    "$$att.date",
                    new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ]);

  const newDepartment = attendanceRecords.filter(
    (record) => record.department === departments
  );

  console.log("Attendance records: ", newDepartment);

  res.status(200).json({
    success: true,
    data: newDepartment,
  });
};

const getAttendancebyName = async (req, res) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const names = req.query.name;

  console.log("date ", names);

  const attendanceRecords = await staffSchema.aggregate([
    {
      $match: {
        $and: [
          { company: req.company._id },
          { name: { $regex: new RegExp(names, "i") } },
        ],
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $project: {
        _id: 1,
        name: "$name",
        department: { $arrayElemAt: ["$departmentInfo.title", 0] },
        attendance: {
          $filter: {
            input: "$attendance",
            as: "att",
            cond: {
              $and: [
                {
                  $gte: ["$$att.date", currentDate],
                },
                {
                  $lt: [
                    "$$att.date",
                    new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ]);

  console.log("Attendance records: ", attendanceRecords);

  res.status(200).json({
    success: true,
    data: attendanceRecords,
  });
};

const paySalary = async (req, res) => {
  const salaryData = req.body;

  const staffMember = await staffSchema.findById(req.params.id);

  staffMember.salaries.push(salaryData);

  await staffMember.save();

  const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
  });

  const options = {
    amount: req.body.salary * 100,
    currency: "INR",
    receipt: crypto.randomBytes(10).toString("hex"),
  };

  instance.orders.create(options, (error, order) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Something Went Wrong!" });
    }
    res.status(200).json({ message: "Salary data added successfully." });
  });
};

const paymentVerify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
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
  getAttendancebyName,
  approveleave,
  getleaveRequest,
  getAttendanceByDate,
  getAttendance,
  getAttendancebyDepartment,
  updateDepartment,
  getDepartmentById,
  deleteLeave,
  getAllStaffPage,
  paySalary,
  paymentVerify,
};
