const express = require("express");
const {
  createUser,
  getStaff,
  getAllStaff,
  getEmployeeDetails,
  getEmployeeTasks,
  getStaffsTasks,

  getEmployeeAttendance,
  getApprovedleave,
  loginStaff,
  getTaskById,
  applyLeave
} = require("../controller/staff");
const tryCatch = require("../middleware/tryCatchp");
const verifyCompany= require("../middleware/verifyCompany")
const router = express.Router();


router.post("/staff/login",tryCatch(loginStaff))
router.post("/staff/createuser", tryCatch(createUser));
router.get("/staff/users",verifyCompany, tryCatch(getAllStaff));
router.get("/staff/users/:id",tryCatch(getStaff));
router.get("/staff/employee/:id",tryCatch(getEmployeeDetails)); 
router.get("/staff/employee/tasks", verifyCompany,verifyCompany,tryCatch(getStaffsTasks));
router.get('/employee/task/:staffId', tryCatch(getTaskById)); 
router.get("/staff/employee/:id/tasks", tryCatch(getEmployeeTasks)); 
router.get("/staff/employee/:id/attendance", tryCatch(getEmployeeAttendance)); 
router.post("/applyleave/:id",verifyCompany,tryCatch(applyLeave))
router.get("/approvedleave/:id",verifyCompany,tryCatch(getApprovedleave))

module.exports = router;
