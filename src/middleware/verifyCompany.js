const CompanySchema=require("../models/companySchema")
const verifyCompany = async (req, res, next) => {
    // Assuming you have one specific company, you can find it by name or any other unique identifier
    const companyId = req.headers['x-company-id']; // Replace with your company's name
    const company = await CompanySchema.findById(companyId);
  
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
  
    req.company = company; // Attach the company to the request
    next();
  };

  module.exports = verifyCompany; 
  