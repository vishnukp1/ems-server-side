const express = require("express");

const {
  loginUser,
  createstaff,
  getStaff,
  getAllStaff,
  searchStaffByName,
  deleteStaff,
  updateStaff,
  addTask,
  deleteTask,
  updateTask,
  getTaskById,
  getAllTasks,
  searchTaskByName,
  registerCompany,
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
} = require("../controller/company");
const tryCatch = require("../middleware/tryCatchp");
const upload = require("../middleware/multer.js");
const userAuth = require("../middleware/userAuth");
const verifyCompany = require("../middleware/verifyCompany");

const router = express.Router();

router.post("/company/login", tryCatch(loginUser));
router.post("/company/register", tryCatch(registerCompany));
router.post("/company/createdprt", verifyCompany, tryCatch(createdepartment));
router.get("/company/department", verifyCompany, tryCatch(getDepartment));
router.delete(
  "/company/department/:id",
  verifyCompany,
  tryCatch(deleteDepartment)
);
router.post(
  "/company/createstaff",
  upload.single("imagepath"),
  verifyCompany,
  tryCatch(createstaff)
);
router.get("/company/staff", verifyCompany, userAuth, tryCatch(getAllStaff));
router.get("/company/search", verifyCompany, tryCatch(searchStaffByName));
router.get("/company/searchTask", verifyCompany, tryCatch(searchTaskByName));
router.get("/company/searchdepartment", tryCatch(searchDepartment));
router.get("/company/staff/:id", tryCatch(getStaff));
router.put("/company/staff/:id", tryCatch(updateStaff));
router.delete("/company/staff/:id", tryCatch(deleteStaff));
router.post("/company/task/:id", tryCatch(addTask));
router.delete("/:id/tasks/:taskId", tryCatch(deleteTask));
router.put("/company/:id/task/:taskId", tryCatch(updateTask));
router.get("/company/:staffId/task/:taskId", tryCatch(getTaskById));
router.get("/company/alltasks", tryCatch(getAllTasks));
router.get(
  "/company/department/:id",
  verifyCompany,
  tryCatch(getDepartmentById)
);
router.put("/company/department/:id", tryCatch(updateDepartment));
router.post("/company/mark", tryCatch(markattendance));
router.get(
  "/company/attendance/:date",
  verifyCompany,
  tryCatch(getAttendanceByDate)
);
router.get("/company/attendance", verifyCompany, tryCatch(getAttendance));
router.put("/updateAttendance/:staffId", tryCatch(updateAttendance));
router.delete("/deleteAttendance/:staffId", tryCatch(deleteAttendance));
router.delete("/deleteleave/:leaveId", tryCatch(deleteLeave));
router.put("/leave/approve/:leaveId", tryCatch(approveleave));
router.get("/leaves/:date", verifyCompany, tryCatch(getleaveRequest));
router.get(
  "/company/searchdepartments",
  verifyCompany,
  tryCatch(getAttendancebyDepartment)
);
router.get("/attendance/name", verifyCompany, tryCatch(getAttendancebyName));
router.get("/company/staffPage", verifyCompany, getAllStaffPage);
router.post("/pay-salary/:id", tryCatch(paySalary));
router.post("/verify-pament", tryCatch(paymentVerify));

module.exports = router;
