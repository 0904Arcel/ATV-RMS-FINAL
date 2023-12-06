const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;
const TourguideSchema = new mongoose.Schema({
  _Id: ObjectId,
  FName: String,
  MName: String,
  Sname: String,
  email: String,
  phone: String,
  resume: String,
  address: String,
  startDate: String,
  submissionDate: String,
  username: String,
  password: String,
},
{ versionKey: false, collection: 'empTourGuide' }
);

const empTourGuide = mongoose.model('empTourGuide', TourguideSchema);

module.exports = empTourGuide;
