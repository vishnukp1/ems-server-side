const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");
const cloudinary = require ("../uploadImg")
require("dotenv").config();

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const usernameenv = process.env.adminUserName;
  const passwordenv = process.env.adminPassword;

  if (username !== usernameenv || password !== passwordenv) {
    return res.send("Username and password do not match"); 
  }    

  const token = jwt.sign({ username: usernameenv }, "admin");
  res.json({
    status: "success",
    token: token, //TODO: standardize all response with {status, message, data (if available)}
  });
};


const createstaff = async (req, res) => {
  try {

  const { name, password, email, phone, address, salary, gender, position } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: `${staffSchema._id}_profile`,
    // width: 500,
    // height: 500,
    // crop: 'fill',
  });

  console.log("result",result);
    const staff = new staffSchema({
      name: name,
      password: hashedPassword,
      phone: phone,
      email: email,
      address: address,
      imagepath: result.secure_url, // Use the secure URL from Cloudinary result
      salary: salary,
      gender: gender,
      address: address,
      position: position,
      full: true
    });

    await staff.save();
    res.json({ message: "User account registered successfully", staff });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error during staff creation" });
  }
}



const getAllStaff = async (req,res) =>{
  const allStaff = await staffSchema.find()
  res.json(allStaff)
}

const getStaff = async (req,res) =>{
  const staff = await staffSchema.findById(req.params.id)
  res.json(staff)
}

const searchStaffByName = async (req, res) => {
    const { name } = req.query; 
    const search = await staffSchema.find({ name: { $regex: new RegExp(name, "i") } });
    res.json(search);
  }

const updateStaff = async (req,res) => {
const updatedstaff = await staffSchema.findByIdAndUpdate(
  req.params.id,
  req.body,
  {new:true} )
  if (updatedstaff) {
    console.log("supdatedstaff updated:", updatedstaff);
    res.json(updatedstaff);
  } else {
    res.status(404).json({ error: "Staff not found" });
  }
}

const deleteStaff = async (req,res) =>{
  const deleteStaff = await staffSchema.findByIdAndDelete(req.params.id)
  res.json(deleteStaff)
}


const addTask = async (req, res) => {

  const { title, startTime, endTime, status} = req.body;

  
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

  }

  const getAllTasks = async (req, res) => {
    
      const allStaffsTasks = await staffSchema.aggregate([
        {
          $unwind: "$tasks"
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
            status: "$tasks.status"
          }
        }
      ]);
  
      if (allStaffsTasks.length > 0) {
        res.json({ tasks: allStaffsTasks });
      } else {
        res.json({ tasks: [] });
      }
    }
  

 
    

  
//  TODO: Implement joi validation to all POST,PUT,,PATCH routes


const searchTaskByName = async (req, res) => {
  try {
    const { name } = req.query; // Assuming the search query is provided as a query parameter

    // Use a regular expression to perform a case-insensitive search by name
    const searchResults = await staffSchema.aggregate([
      {
        $match: {
          name: { $regex: new RegExp(name, "i") }, // Match staff by name
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};








  
const deleteTask = async (req, res) => {
  const { taskId } = req.params; // Assuming taskId is part of the route params

 
    const staff = await staffSchema.findById(req.params.id); 
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const taskIndex = staff.tasks.findIndex(task => task._id.toString() === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    staff.tasks.splice(taskIndex, 1);
    await staff.save();

    res.json({ message: "Task deleted successfully", staff });
  }

const updateTask = async (req, res) => {
  const { staffId, taskId } = req.params;
  const { title, startTime, endTime, status, name } = req.body;


    const updatedTask = await staffSchema.findOneAndUpdate(
      {
        _id: staffId,
        'tasks._id': taskId
      },
      {
        $set: {
          'tasks.$.title': title,
          'tasks.$.startTime': startTime,
          'tasks.$.endTime': endTime,
          'tasks.$.status': status,
        
        }
      },
      { new: true }
    );

    if (updatedTask) {
      console.log("Updated Task:", updatedTask);
      res.json(updatedTask);
    } else {
      res.status(404).json({ error: "Task or Staff not found" });
    }
  }

const addPerformance = async (req, res) => {
  const { date, rating } = req.body;

 
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    staff.performances.push({
      date: date,
      rating: rating,
    });

    await staff.save();
    res.json({ message: "Performance added to staff successfully", staff });

};

const getStaffsPerformance = async (req, res) => {

  const allPerformance = await staffSchema.aggregate([
    {
      $project: {   
        performance: "$performance"
      }
    },
    {
      $unwind: "$performance" 
    },
    {
      $group: {
        _id: null,
        performance: { $push: "$performance" }
      }
    }
  ]);

  if (allPerformance.length > 0) {
    res.json({ performance: allPerformance[0].performance });
  } else {
    res.json({ performance: [] });
  }

};

const addAttendance = async (req, res) => {
  try {
    // Find the staff member by ID
    const { date, status, timeIn, timeOut } = req.body;

    const employee = await staffSchema.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Check if attendance for the specified date already exists
    const existingAttendance = employee.attendance.find(
      (record) => record.date.toDateString() === new Date(date).toDateString()
    );

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance for this date already exists",
      });
    }

    // Create a new attendance record
    const attendanceRecord = {
      date: new Date(date),
      status: status,
      timeIn: new Date(date + ' ' + timeIn),
      timeOut: new Date(date + ' ' + timeOut),
    };

    // Calculate total working time in milliseconds
    const totalWorkingTimeMs = attendanceRecord.timeOut - attendanceRecord.timeIn;

    // Convert total working time to hours and minutes
    const totalWorkingHours = Math.floor(totalWorkingTimeMs / (1000 * 60 * 60));
    const totalWorkingMinutes = Math.floor((totalWorkingTimeMs % (1000 * 60 * 60)) / (1000 * 60));

    attendanceRecord.totalWorkingTime = `${totalWorkingHours} hours ${totalWorkingMinutes} minutes`;

    // Add the attendance record to the employee's attendance array
    employee.attendance.push(attendanceRecord);

    // Save the updated employee record
    await employee.save();

    return res.status(200).json({ success: true, message: "Attendance added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



  const getStaffsAttendance = async (req, res) => {

    const allAttendance = await staffSchema.aggregate([
      {
        $project: {
          attendance: "$attendance"
        }
      },
      {
        $unwind: "$attendance"
      },
      {
        $group: {
          _id: null,
          attendance: { $push: "$attendance" }
        }
      }
    ]);

    if (allAttendance.length > 0) {
      res.json({ attendance: allAttendance[0].attendance });
    } else {
      res.json({ attendance: [] });
    }
  
};

const addTimeInTimeOut = async (req, res) => {
  const { date, timeIn, timeOut } = req.body;
  const employeeId = req.params.id; // Assuming you have an employee ID parameter

  if (!date || !timeIn || !timeOut || !employeeId) {
    return res.status(400).json({ error: "Date, time in, time out, and employee ID are required" });
  }

  // Retrieve the employee record by ID (You should replace this with your actual employee retrieval logic)
  const employee = await staffSchema.findById(employeeId);

  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }

  // Convert date, timeIn, and timeOut to Date objects
  const dateObj = new Date(date);
  const timeInObj = new Date(date + ' ' + timeIn);
  const timeOutObj = new Date(date + ' ' + timeOut);

  if (isNaN(dateObj) || isNaN(timeInObj) || isNaN(timeOutObj)) {
    return res.status(400).json({ error: "Invalid date or time format" });
  }

  // Calculate total working time in milliseconds
  const totalWorkingTimeMs = timeOutObj - timeInObj;

  // Convert total working time to hours and minutes
  const totalWorkingHours = Math.floor(totalWorkingTimeMs / (1000 * 60 * 60));
  const totalWorkingMinutes = Math.floor((totalWorkingTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  // Add the time in and time out to the employee's record
  employee.timeIn = timeInObj;
  employee.timeOut = timeOutObj;

  // Save the updated employee record (You should replace this with your actual database update logic)
  await employee.save();

  res.json({
    date: dateObj.toISOString(),
    timeIn: timeInObj.toISOString(),
    timeOut: timeOutObj.toISOString(),
    totalWorkingTime: `${totalWorkingHours} hours ${totalWorkingMinutes} minutes`
  });
}



const addLeave = async (req, res) => {

  const { fromDate, toDate, reason, status } = req.body;

    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    staff.leaves.push({
      fromDate: fromDate,
      toDate: toDate,
      reason: reason,
      status: status,
    });

    await staff.save();
    res.json({ message: "Leave added to staff successfully", staff });
};

const getStaffsLeave = async (req, res) => {

  const allLeaves = await staffSchema.aggregate([
    {
      $project: {
        leaves: "$leaves"
      }
    },
    {
      $unwind: "$leaves"
    },
    {
      $group: {
        _id: null,
        leaves: { $push: "$leaves" }
      }
    }
  ]);

  if (allLeaves.length > 0) {
    res.json({ leaves: allLeaves[0].leaves });
  } else {
    res.json({ leaves: [] });
  }

};

// Function to calculate total working time based on time in and time out
function calculateTotalWorkingTime(timeIn, timeOut) {
  const timeInDate = new Date(timeIn);
  const timeOutDate = new Date(timeOut);

  if (isNaN(timeInDate) || isNaN(timeOutDate)) {
    return "Invalid time format";
  }

  const totalWorkingTimeMs = timeOutDate - timeInDate;
  const totalWorkingHours = Math.floor(totalWorkingTimeMs / (1000 * 60 * 60));
  const totalWorkingMinutes = Math.floor((totalWorkingTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${totalWorkingHours} hours ${totalWorkingMinutes} minutes`;
}

const markAttendance = async (req, res, next) => {
  try {
    const { date, status, timeIn, timeOut, staffId } = req.body;

    // Find the staff member by ID
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    // Create a new attendance record
    const attendanceRecord = {
      date: new Date(date),
      status: status,
      timeIn: new Date(date + ' ' + timeIn),
      timeOut: new Date(date + ' ' + timeOut),
      totalWorkingTime: calculateTotalWorkingTime(timeIn, timeOut)
    };

    // Add the attendance record to the staff member's attendance array
    staff.attendance.push(attendanceRecord);

    // Save the updated staff member record
    await staff.save();

    res.status(200).json({ success: true, message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


module.exports = {
  createstaff,
  getStaff,
  getAllStaff,
  searchStaffByName,
  updateStaff,
  deleteStaff,
  addTask,
  addPerformance,
  addAttendance ,
  addLeave,
  loginUser,
  getStaffsLeave,
  getStaffsAttendance,
  getStaffsPerformance,
  deleteTask, 
getTaskById,
updateTask,
getAllTasks,
searchTaskByName,
addTimeInTimeOut,
markAttendance

};
