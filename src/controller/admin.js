const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const CompanySchema = require("../models/companySchema");
const cloudinary = require("../uploadImg");
require("dotenv").config();
const DepartmentSchema = require("../models/dpartmentSchema");
const nodemailer = require("nodemailer"); // Import the nodemailer library
const randomstring = require("randomstring");
const validate = require("../validation/schemaValidation");

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const user = await companySchema.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid username" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = jwt.sign({ username: user.username }, "user");

  res.status(200).json({
    message: "Login successful",
    status: "seccuss",
    token,
    companyId: user._id,
  });
};

const createCompany = async (req, res) => {
  const { name, email, phone, address, salary, gender, department, companyId } =
    req.body;

  const password = randomstring.generate(8);

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: `${name.replace(/\s+/g, "_").toLowerCase()}_profile`,
  });

  fs.unlinkSync(req.file.path);

  let departmentObj = null;
  if (department) {
    departmentObj = await DepartmentSchema.findOne({ title: department });
    if (!departmentObj) {
      departmentObj = new DepartmentSchema({ title: department });
      await departmentObj.save();
    }
  }

  console.log("dptobj", departmentObj);

  const Company = new CompanySchema({
    name: name,
    password: hashedPassword,
    phone: phone,
    email: email,
  });

  await Company.save();

  res.json({ Company });

  // Create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  // Define email content
  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: "Your New Password",
    text: `Your new password is: ${password}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({
        status: "error",
        message: "Email could not be sent",
        error: error.message,
      });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({
        status: "success",
        message: "Company created successfully",
        data: Company,
        generatedPassword: password,
      });
    }
  });
};

//Single Database, Document-Based:

const getAllCompany = async (req, res) => {
  const allCompany = await CompanySchema.find();
  res.status(200).json({
    message: "Got all Companys successfully",
    data: allCompany,
    status: "success",
  });
};

const getCompany = async (req, res) => {
  const Company = await CompanySchema.findById(req.params.id);
  res.status(200).json({
    message: "Got all Companys successfully",
    data: Company,
    status: "success",
  });
};

const searchCompanyByName = async (req, res) => {
  const { name } = req.query;
  const search = await CompanySchema.find({
    name: { $regex: new RegExp(name, "i") },
  });
  res.json(search);
};

const updateCompany = async (req, res) => {
  const updatedCompany = await CompanySchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (updatedCompany) {
    console.log("supdatedCompany updated:", updatedCompany);
    res.json(updatedCompany);
  } else {
    res.status(404).json({ error: "Company not found" });
  }
};

const deleteCompany = async (req, res) => {
  const deleteCompany = await CompanySchema.findByIdAndDelete(req.params.id);
  res.json(deleteCompany);
};

module.exports = {
  createCompany,
  getAllCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  loginAdmin,
  searchCompanyByName,
};
