// models/Customer.js

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  FName: String,
  MName: String,
  Sname: String,
  Email: String,
  Gender: String,
  age: String,
  Address: {
    Street: String,
    Barangay: String,
    Province: String,
    MuniCity: String,
    Country: String,
  },
  Phone: String,
  Username: String,
  Password: String,
  otp: String,
  accountCreationDate:String,
  // Add other fields as needed
});



const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
