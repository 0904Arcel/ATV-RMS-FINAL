const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;

const custReservationsSchema = new mongoose.Schema({
  _Id: ObjectId,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  FName: String,
  MName: String,
  Sname: String,
  tourName: String,
  tourPrice: String,
  duration: String,
  reservDate: String,
  totalPerson: String,
  PaxInfo:{
    PaxFname: String,
    PaxMname: String,
    PaxSname: String,
    PaxPhoneNo: String,
    PaxAge: String,
    PaxEmail: String,
  },
  gCashNum: String,
  InitialPayment: String,
  Balance: String,
  TotalPayment:String,
  timeSlot: String,
  status: String,
},
{ versionKey: false, collection: 'custReservations' }
);

const custReservationsI = mongoose.model('custReservations', custReservationsSchema);

module.exports = custReservationsI;