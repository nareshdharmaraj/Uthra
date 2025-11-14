const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = require('../../Database/CompanySchema');
const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
