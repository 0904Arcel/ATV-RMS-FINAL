const express = require('express');
const router = express.Router();
const custReservationsI = require('./src/models/Reservation');

router.post("/saveReservation", async (req, res) => {
    try {
      const custReservations = await custReservationsI.create({
        customer: req.session.customerData._id,
        FName: req.body.Cust1Name,
        MName: req.body.Cust2Name,
        Sname: req.body.Cust3Name,
        tourName: req.body.TourName,
        tourPrice: req.body.TourPrice,
        duration: req.body.Duration,
        reservDate: req.body.ReserveDate,
        totalPerson: req.body.TotalPerson,
        timeSlot: req.body.TimeSlot,
        status: "" // You can set the default status here
      });
  
      console.log('Recorded Booking for', req.body.Cust1Name, req.body.Cust2Name, req.body.Cust3Name);
      return res.redirect('userDashboard');
    } catch (error) {
      console.error('Error saving reservation:', error);
      return res.status(500).send('Error saving reservation: ' + error.message);
    }
  });

module.exports = router;
