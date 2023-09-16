const express = require("express")

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
    
} = require("../controller/company");
const tryCatch = require("../middleware/tryCatchp");
const upload = require('../middleware/multer.js')
const router = express.Router() 

router.post("/company/login",tryCatch(loginUser))
router.post("/company/register",tryCatch(registerCompany))
router.post("/company/createdprt",tryCatch(createdepartment))
router.get("/company/department",tryCatch(getDepartment))
router.delete("/company/department/:id",tryCatch(deleteDepartment))
router.post("/company/createstaff",upload.single('imagepath'),tryCatch(createstaff))
router.get("/company/staff",tryCatch(getAllStaff))
router.get("/company/search",tryCatch(searchStaffByName))
router.get("/company/searchTask",tryCatch(searchTaskByName))
router.get("/company/searchdepartment",tryCatch(searchDepartment))
router.get("/company/staff/:id",tryCatch(getStaff))
router.put("/company/staff/:id",tryCatch(updateStaff))
router.delete("/company/staff/:id",tryCatch(deleteStaff))
router.post("/company/task/:id",tryCatch(addTask))
router.delete('/:id/tasks/:taskId',tryCatch(deleteTask))
router.put('/company/:id/task/:taskId',tryCatch(updateTask))
router.get('/company/:staffId/task/:taskId', getTaskById); 
router.get("/company/alltasks",tryCatch(getAllTasks))
router.post("/company/mark",tryCatch(markattendance))
router.put('/updateAttendance/:staffId', tryCatch(updateAttendance));
router.delete('/deleteAttendance/:staffId', tryCatch(deleteAttendance));

module.exports = router;