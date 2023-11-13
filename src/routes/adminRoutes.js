const express = require("express");
const {
  createCompany,
  getCompany,
  getAllCompany,
  updateCompany,
  deleteCompany,
  loginAdmin,
  searchCompanyByName,
} = require("../controller/admin");
const tryCatch = require("../middleware/tryCatchp");

const router = express.Router();

router.post("/admin/login", tryCatch(loginAdmin));
router.post("/admin/createcompany", tryCatch(createCompany));
router.get("/admin/company", tryCatch(getAllCompany));
router.get("/admin/company/:id", tryCatch(getCompany));
router.put("/admin/company/:id", tryCatch(updateCompany));
router.delete("/admin/company/:id", tryCatch(deleteCompany));
router.get("/admin/searchcompany", tryCatch(searchCompanyByName));

module.exports = router;
