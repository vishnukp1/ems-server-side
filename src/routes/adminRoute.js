const express = require("express");
const {
  createUser,
  getUser,
  getAllUser,
  updateUser,
  deleteUser,
} = require("../controller/admin"); 
const tryCatch = require("../middleware/tryCatchp");

const router = express.Router();

router.post("/admin/createuser", tryCatch(createUser));
router.get("/admin/users", tryCatch(getAllUser));
router.get("/admin/users/:id", tryCatch(getUser));
router.put("/admin/users/:id", tryCatch(updateUser));
router.delete("/admin/users/:id", tryCatch(deleteUser));

module.exports = router;
