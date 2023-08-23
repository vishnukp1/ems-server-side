const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");
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
    token: token,
  });
};

const createUser = async (req, res) => {

    const { name, password, email, phone, address, imagepath, salary, gender ,position} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = new staffSchema({
      name: name,
      password: hashedPassword,
      phone: phone,
      email: email,
      address: address,
      imagepath: imagepath,
      salary: salary,
      gender: gender,
      address:address,
      position:position,
      full: true
    });

    await staff.save();
    res.json({ message: "User account registered successfully", staff });
 
};



const getAllStaff = async (req,res) =>{
  const allStaff = await staffSchema.find()
  res.json(allStaff)
}

const getStaff = async (req,res) =>{
  const staff = await staffSchema.findById(req.params.id)
  res.json(staff)
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

const getStaffsTasks = async (req, res) => {

    const allTasks = await staffSchema.aggregate([
      {
        $project: {
          tasks: "$tasks"
        }
      },
      {
        $unwind: "$tasks"
      },
      {
        $group: {
          _id: null,
          tasks: { $push: "$tasks" }
        }
      }
    ]);

    if (allTasks.length > 0) {
      res.json({ tasks: allTasks[0].tasks });
    } else {
      res.json({ tasks: [] });
    }
  
};

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
  const { date, status } = req.body;

 
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    staff.attendance.push({
      date: date,
      status: status,
    });

    await staff.save();
    res.json({ message: "Attendance added to staff successfully", staff });
  }

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


module.exports = {
  createUser,
  getStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  addTask,
  addPerformance,
  addAttendance ,
  addLeave,
  getStaffsTasks,
  loginUser,
  getStaffsLeave,
  getStaffsAttendance,
  getStaffsPerformance

};
