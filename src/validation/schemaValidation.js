const Joi = require("joi");

const adminValidate = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().optional(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  phone: Joi.string(),
});

const companyValidate = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  email: Joi.string().email().required(),
  phone: Joi.string(),
  company: Joi.string(),
});

const staffValidation = Joi.object({
  name: Joi.string().optional(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string(),
  department: Joi.string(),
  imagepath: Joi.array().items(Joi.string().default("Default Name")),
  address: Joi.string(),
  gender: Joi.string(),
  salary: Joi.number(),
  performances: Joi.array().items(
    Joi.object({
      date: Joi.date(),
      rating: Joi.number(),
    })
  ),
  attendance: Joi.array().items(
    Joi.object({
      date: Joi.date(),
      status: Joi.string(),
      timeIn: Joi.date(),
      timeOut: Joi.date(),
      totalWorkingTime: Joi.string(),
    })
  ),
  leaves: Joi.array().items(
    Joi.object({
      fromDate: Joi.date(),
      toDate: Joi.date(),
      reason: Joi.string(),
      status: Joi.string(),
      description: Joi.string(),
      applyOn: Joi.date(),
    })
  ),
  tasks: Joi.array().items(
    Joi.object({
      title: Joi.string(),
      startTime: Joi.date(),
      endTime: Joi.date(),
      status: Joi.string(),
    })
  ),
  salaries: Joi.array().items(
    Joi.object({
      month: Joi.number(),
      year: Joi.number(),
      amount: Joi.number(),
    })
  ),
});

module.exports = { companyValidate, adminValidate, staffValidation};
