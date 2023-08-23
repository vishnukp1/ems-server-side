const express = require("express");
const {
  createUser,
  getStaff,
  getAllStaff,
  getEmployeeDetails,
  getEmployeeTasks,
  getStaffsTasks,
  getEmployeePerformances,
  getEmployeeAttendance,
  getEmployeeLeaves,
} = require("../controller/staff");
const tryCatch = require("../middleware/tryCatchp");

const router = express.Router();

router.post("/staff/createuser", tryCatch(createUser));
router.get("/staff/users", tryCatch(getAllStaff));
router.get("/staff/users/:id", tryCatch(getStaff));
router.get("/staff/employee/:id", tryCatch(getEmployeeDetails)); 
router.get("/staff/employee/tasks", getStaffsTasks);
router.get("/staff/employee/:id/tasks", tryCatch(getEmployeeTasks)); 
router.get("/staff/employee/:id/performances", tryCatch(getEmployeePerformances)); 
router.get("/staff/employee/:id/attendance", tryCatch(getEmployeeAttendance)); 
router.get("/staff/employee/:id/leaves", tryCatch(getEmployeeLeaves)); 

module.exports = router;
