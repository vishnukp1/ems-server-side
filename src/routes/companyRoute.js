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
    addPerformance,
    addAttendance ,
    addLeave,
    getStaffsLeave,
    getStaffsAttendance,
    getStaffsPerformance,
    deleteTask,
    updateTask,
    getTaskById,
    getAllTasks,
    searchTaskByName
} = require("../controller/company");
const tryCatch = require("../middleware/tryCatchp");
const upload = require('../middleware/multer.js')

const router = express.Router() 

router.post("/company/login",tryCatch(loginUser))
router.post("/company/createstaff",upload.single('imagepath'),tryCatch(createstaff))
router.get("/company/staff",tryCatch(getAllStaff))
router.get("/company/search",tryCatch(searchStaffByName))
router.get("/company/searchTask",tryCatch(searchTaskByName))
router.get("/company/staff/:id",tryCatch(getStaff))
router.put("/company/staff/:id",tryCatch(updateStaff))
router.delete("/company/staff/:id",tryCatch(deleteStaff))
router.post("/company/task/:id",tryCatch(addTask))
router.delete('/:id/tasks/:taskId',tryCatch(deleteTask))
router.put('/company/:id/task/:taskId',updateTask)
router.get('/company/:staffId/task/:taskId', getTaskById); 
router.post("/company/performance/:id",tryCatch(addPerformance))
router.post("/company/attendance/:id",tryCatch( addAttendance )) 
router.post("/company/leave/:id",tryCatch(addLeave))
router.post("/company/performance",tryCatch(getStaffsPerformance))
router.get("/company/attendance",tryCatch(getStaffsAttendance))
router.get("/company/leave",tryCatch(getStaffsLeave))
router.get("/company/alltasks",tryCatch(getAllTasks))


module.exports = router;