const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const staffSchema = require("../models/staffSchema");



  const createUser = async (req, res) => {

    const { name, password, email, phone, address ,} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new staffSchema({
      name: name,
      password: hashedPassword,
      phone: phone,
      email: email,
      address: address,
      full:true

    });

    await user.save();
 
    res.json({ message: "User registered successfully", user });

};

const getAllUser = async (req,res) =>{
  const allUser = await staffSchema.find()
  res.json(allUser)
}

const getUser = async (req,res) =>{
  const user = await staffSchema.findById(req.params.id)
  res.json(user)
}
const updateUser = async (req,res) => {
const updatedUser = await staffSchema.findByIdAndUpdate(
  req.params.id,
  req.body,
  {new:true} )
  if (updatedUser) {
    console.log("supdatedUser updated:", updatedUser);
    res.json(updatedUser);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
}

const deleteUser = async (req,res) =>{
  const deleteUser = await staffSchema.findByIdAndDelete(req.params.id)
  res.json(deleteUser)
}

module.exports = {
    createUser,
    getUser,
    getAllUser,
    updateUser,
   deleteUser,

 
  };