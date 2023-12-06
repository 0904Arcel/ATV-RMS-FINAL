// models/Customer.js

const mongoose = require('mongoose');

const empResumeSchema = new mongoose.Schema({
  FName: String,
  MName: String,
  Sname: String,
  email: String,
  phone: String,
  address: String,
  resume:String,
  submissionDate:String,

});



const empResume = mongoose.model('empResume', empResumeSchema);

module.exports = empResume;
