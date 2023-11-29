// multi-tenant or role-based system.

const CompanySchema=require("../models/companySchema")
const verifyCompany = async (req, res, next) => {
  
    const companyId = req.headers['x-company-id']; 
    const company = await CompanySchema.findById(companyId);
  
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    req.company = company;
    next();
  };

  module.exports = verifyCompany; 
  