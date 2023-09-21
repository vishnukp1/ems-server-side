const fs = require("fs")
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
const Leave = require("../models/leaveSchema")

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
    companyId:user._id
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

    const { name, email, phone, address, salary, gender, department,companyId } = req.body;



 
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

   
 
console.log("dptobj",departmentObj);

    const staff = new staffSchema({
      name: name,
      password: hashedPassword,
      phone: phone,
      email: email,
      address: address,
      companyId:companyId,
      imagepath: result.secure_url,
      salary: salary,
      gender: gender,
      department: departmentObj ? departmentObj._id : null,
    });

    
    await staff.save();

   res.json({staff})

    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    // Define email content
    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Your New Password",
      text: `Your new password is: ${password}`,
    };

    // Send the email
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
  } 

//Single Database, Document-Based:

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
  try {
    const allStaff = await staffSchema.find().populate("department");
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

    const markedStaff = [];
    const unmatchedStaff = [];

    const allStaff = await staffSchema.find({}, '_id');


    const allStaffIds = allStaff.map(staff => staff._id.toString());

 
    for (const staffId of allStaffIds) {
      if (!selectedStaffIds.includes(staffId)) {
        unmatchedStaff.push(staffId);
      }
    }

 
    for (const staffId of selectedStaffIds) {
      const staff = await staffSchema.findById(staffId);

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
      markedStaff.push(staff);
    }

    
    for (const staffId of unmatchedStaff) {
      const notMatchedStaff = await staffSchema.findById(staffId);

      const newtAttendanceRecord = notMatchedStaff.attendance.find(
        (record) => record.date.toDateString() === attendanceDate.toDateString()
      );

      if (newtAttendanceRecord) {
        newtAttendanceRecord.status = "Leave";
      } else {
        const newtAttendanceRecord = {
          date: attendanceDate,
          status: "Leave",
        };

        notMatchedStaff.attendance.push(newtAttendanceRecord);
      }

      await notMatchedStaff.save();
    }

    res.status(200).json({
      message: "Attendance marked successfully",
      status: "success",
      markedStaff,
      unmatchedStaff,
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

// leave.js

const applyLeave =  async (req, res) => {
  try {

    const staffId = req.params.id; 
    
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;

   
    const leaveRequest = new Leave({
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      reason: req.body.reason,
      status: 'Pending', 
      description: req.body.description,
      applyOn: formattedDate,
    });

  
    await leaveRequest.save();

  
    const staffMember = await staffSchema.findById(staffId);
    staffMember.leaves.push(leaveRequest._id);
    await staffMember.save();

    res.json({ message: 'Leave request submitted successfully' ,staffMember});
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}


const getleaveRequest = async (req, res) => {
  try {
    const date = req.params.date
   
    if (date) {
      leaveRequests = await Leave.find({ applyOn : date });
     
    }


    if (!leaveRequests || leaveRequests.length === 0) {
      return res.status(404).json({ error: 'No leave requests found for the specified date' });
    }

    res.status(200).json({data:leaveRequests});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}




const approveleave =async (req, res) => {
  try {
    const leaveId = req.params.leaveId;
    const status = req.body.status; 

    const leaveRequest = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ message: 'Leave request updated successfully' ,leaveRequest});
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}


const getAttendanceByDate = async (req, res) => {
  try {
    // Get the current date without the time component (set to midnight)
    const currentDate = new Date(req.params.date);
    const currentHour = currentDate.setHours(0, 0, 0, 0);

    console.log(currentHour);

    

    const attendanceRecords = await staffSchema.aggregate([
      {
        $unwind: "$attendance",
      },
      {
        $match: {
         
        
              "attendance.date": {
                $gte: currentDate,
                $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
            
            },
           
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
          _id: 0,
          staffId: "$_id",
          staffName: "$name",
          department: { $arrayElemAt: ["$departmentInfo.title", 0] }, 
          attendance: "$attendance",
        },
      },
    ]);
    

    // const allStaff = await attendanceRecords.find().populate("department");

    // console.log(allStaff);

    res.status(200).json({
      message: "Attendance retrieved successfully",
      status: "success",
      data:attendanceRecords,
    });
  } catch (error) {
    console.error("Error retrieving attendance:", error);
    res.status(500).json({ message: "Error retrieving attendance" });
  }
}

const getAttendance = async (req, res) => {
  try {
    // Get the current date without the time component (set to midnight)
   
    const currentHour = currentDate.setHours(0, 0, 0, 0);

    console.log(currentHour);

    

    const attendanceRecords = await staffSchema.aggregate([
      {
        $unwind: "$attendance",
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
          _id: 0,
          staffId: "$_id",
          staffName: "$name",
          department: { $arrayElemAt: ["$departmentInfo.title", 0] }, 
          attendance: "$attendance",
        },
      },
    ]);
    

    // const allStaff = await attendanceRecords.find().populate("department");

    // console.log(allStaff);

    res.status(200).json({
      message: "Attendance retrieved successfully",
      status: "success",
      data:attendanceRecords,
    });
  } catch (error) {
    console.error("Error retrieving attendance:", error);
    res.status(500).json({ message: "Error retrieving attendance" });
  }
}


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
  applyLeave,
  approveleave,
  getleaveRequest,
  getAttendanceByDate,
  getAttendance

};
