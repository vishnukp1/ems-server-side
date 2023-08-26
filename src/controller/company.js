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

  const { title, startTime, endTime, status,name } = req.body;

  
    const staff = await staffSchema.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    staff.tasks.push({
      title: title,
      startTime: startTime,
      endTime: endTime,
      status: status,
      name:name,
    });

    await staff.save();
    res.json({ message: "Task added to staff successfully", staff });

};

const getTaskById = async (req, res) => {
  const { staffId, taskId } = req.params;

  try {
    const staff = await staffSchema.findById(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const task = staff.tasks.id(taskId); 
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





  const getStaffsTasks = async (req, res) => {
    try {
      const staffsWithTasks = await staffSchema.aggregate([
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
  
      if (staffsWithTasks.length > 0) {
        res.json({ tasks: staffsWithTasks });
      } else {
        res.json({ tasks: [] });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
 
  
const deleteTask = async (req, res) => {
  const { taskId } = req.params; // Assuming taskId is part of the route params

  try {
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
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateTask = async (req, res) => {
  const { staffId, taskId } = req.params;
  const { title, startTime, endTime, status, name } = req.body;

  try {
    const updatedTask = await staffSchema.findOneAndUpdate(
      { _id: staffId, 'tasks._id': taskId },
      {
        $set: {
          'tasks.$.title': title,
          'tasks.$.startTime': startTime,
          'tasks.$.endTime': endTime,
          'tasks.$.status': status,
          'tasks.$.name': name,
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task or Staff not found" });
    }

    res.json({ message: "Task updated successfully", staff: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal server error" });
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
  getStaffsPerformance,
  deleteTask, 
getTaskById,
updateTask

};
