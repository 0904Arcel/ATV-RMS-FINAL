const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const Customer = require('./src/models/Customer');
const empResume = require('./src/models/empResume');
const custReservationsI = require('./src/models/Reservation');
const empTourGuide = require('./src/models/Tourguide');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const crypto = require('crypto');
const { Binary } = require('mongodb'); // Import Binary from mongodb
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const app = express();
const { ObjectId } = require('mongodb');

// Generate a random secret of a specific length (e.g., 32 characters)
const randomSecret = crypto.randomBytes(32).toString('hex');
console.log(randomSecret);

/* Middleware */
app.use((req, res, next) => {
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.static('./'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




// Create a new MongoDB session store
const dbConfig = 'mongodb+srv://atvrms:atvrms@atvrms.nwojtse.mongodb.net/ATVRMS';

const store = new MongoDBStore({
  uri: dbConfig, // MongoDB connection URI
  collection: 'sessions', // Name of the sessions collection
});

// Handle session-related middleware
app.use(
  session({
    secret: randomSecret, // Use the generated randomSecret as the session secret
    resave: false,
    saveUninitialized: true,
    store: store, // Use the configured session store
    cookie: { secure: false }, // Set secure to true in production if using HTTPS
  })
);

/* Routes */
const CustomersRoutes = require('./src/routes/Customers');
app.use('/Customers', CustomersRoutes);

/* Connection to MongoDB */
mongoose
  .connect(`${dbConfig}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
const db = mongoose.connection;
const port = 3001;

app.get("/Customers", function(req, res) {
  const filePath = path.join(__dirname, "index.html");
  res.sendFile(filePath);
});

/*Customer Signup*//*Customer Signup*//*Customer Signup*//*Customer Signup*//*Customer Signup*//*Customer Signup*//*Customer Signup*/

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'arceljann0904@gmail.com', // Enter your Gmail email address
    pass: 'luhi vcih fooz pgty' // Enter your Gmail password
  }
});
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number
  return otp.toString(); // Convert to string for consistency
};

app.post("/CustomerSignup", (req, res) => {
  var firstName = req.body.firstName.toUpperCase();
  var middleName = req.body.middleName.toUpperCase();
  var sureName = req.body.sureName.toUpperCase();
  var gender = req.body.gender;
  var cellphone = req.body.cellphone;
  var gmailAddress = req.body.gmailAddress;
  var Street = req.body.Street;
  var Barangay = req.body.Barangay;
  var Province = req.body.Province;
  var age = req.body.ages;
  var Country = req.body.Country;
  var MonicipalityCity = req.body.MonicipalityCity;
  var username = req.body.username;
  var password = req.body.password;
  const accountCreationDate = new Date().toISOString();
// Generate a random OTP
const otp = generateOTP();
  

  var data = {
  
    "FName": firstName,
    "MName": middleName,
    "Sname": sureName,
    "Gender": gender,
    "age":age,
    "Address": {
      "Street": Street,
      "Barangay": Barangay,
      "Province": Province,
      "Country": Country,
      "MuniCity": MonicipalityCity,
    },
    "Phone": cellphone,
    "Email": gmailAddress,
    "Username": username,
    "Password": password,
    "otp": otp,
    "accountCreationDate": accountCreationDate,
  };
  req.session.CustomerDATA = data;
  console.log('CustomerDATA from signup:', data);
  req.session.otp = otp;

  // Setup email data
  const mailOptions = {
    from: 'arceljann0904@gmail.com', // Replace with your actual Gmail email address
    to: gmailAddress,
    subject: 'One Time Password (OTP)',
    text: `
    Thank You ${firstName} For Joining to our Group!
    What are you waiting for? Open Your Account Now! and book your favorite Trails, dont Forget to bring your family and Friends!
    Your OTP is: ${otp}
    `
  };

  // Send the email with the OTP
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      // Store the OTP in the database or a temporary storage for validation later
    }
  });

  db.collection('Customer').insertOne(data, (err, collection) => {
    if (err) {
      throw err;
    }
    console.log("Record Inserted Successfully");
  });
  return res.redirect('VerificationPage');
});


/* Verify Gmail*//* Verify Gmail*//* Verify Gmail*//* Verify Gmail*//* Verify Gmail*//* Verify Gmail*//* Verify Gmail*//* Verify Gmail*/
app.get('/VerificationPage', (req, res) => {
  // Check if the user is authenticated and has a valid session
  if (req.session.CustomerDATA && req.session.CustomerDATA._id) {
    try {
      const CustomerDATA = req.session.CustomerDATA;
      let errorMessage = null;

      // Check for an error message in the URL parameters
      const errorParam = req.query.error;
      if (errorParam === 'invalidOTP') {
        errorMessage = 'Invalid OTP. Please try again.';
      }

      // Render the VerificationPage using the CustomerDATA and errorMessage
      res.render('VerificationPage', { Customer: CustomerDATA, errorMessage });
    } catch (error) {
      console.error('Error rendering VerificationPage:', error);
      res.status(500).send('Error rendering VerificationPage');
    }
  } else {
    // Handle the case where there is no valid customer data in session
    res.status(500).send('Error: No customer data found in session');
  }
});


app.post('/VerifyOTP', async (req, res) => {
  try {
    // Retrieve the OTP entered by the user
    const otpEnteredByUser = req.body.VA1 +
      req.body.VA2 +
      req.body.VA3 +
      req.body.VA4 +
      req.body.VA5 +
      req.body.VA6;

    // Retrieve the stored OTP from the session
    const storedOTP = req.session.otp;

    // Check if the entered OTP matches the stored OTP
    if (otpEnteredByUser === storedOTP) {
      // Redirect to the WelcomePage upon successful verification
      return res.redirect('/WelcomePage');
    } else {
      // Redirect to the VerificationPage with an error parameter
      return res.redirect('/VerificationPage?error=invalidOTP');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).send('An error occurred while verifying OTP.');
  }
});

app.get('/WelcomePage', (req, res) => {
  // Check if the user is authenticated and has a valid session
  if (req.session.CustomerDATA) {
    // Render the WelcomePage using a template engine
    res.render('WelcomePage', { Customer: req.session.CustomerDATA });
  } else {
    res.status(500).send('Error: No customer data found in session');
  }
});



/* Customer Login *//* Customer Login *//* Customer Login *//* Customer Login *//* Customer Login *//* Customer Login *//* Customer Login */
app.post('/login', async (request, response) => {
  try {
    const { Username, Password } = request.body;
    const Customer = db.collection('Customer');

    Customer.findOne({ Username: Username }, async (err, customer) => {
      if (!customer) {
        return response.redirect("/LoginPage.html?error=invalid");
      }

      if (customer.Password === Password) {
        console.log("Login successfully");

        const CustomerData = {
          _id: customer._id,
          Fname: customer.FName,
          Mname: customer.MName,
          Lname: customer.Sname,
          name: customer.FName + " " + customer.MName + " " + customer.Sname,
          email: customer.Email,
          gender: customer.Gender,
          age: customer.age,
          STREET: customer.Address.Street,
          BARANGAY: customer.Address.Barangay,
          PROVINCE: customer.Address.Province,
          MUNICITY: customer.Address.MuniCity,
          COUNTRY: customer.Address.Country,
          Address: customer.Address.Street + " " + customer.Address.Barangay + " " + customer.Address.Province + " " + customer.Address.MuniCity + " " + customer.Address.Country,
          Phone: customer.Phone,
          Email: customer.Email,
          Username: customer.Username,
          Password: customer.Password,
        };

        // Find custReservation for the logged-in customer
        let custReservation = await db.collection('custReservations').findOne({ customer: customer._id });

        // If no reservation found, set to an empty object
        if (!custReservation) {
          custReservation = {};
        }

        // Set custReservationData in the session
        request.session.custReservationData = custReservation || null;

        // Set CustomerData in the session
        request.session.customerData = CustomerData;
        console.log('CustomerData:', CustomerData);

        // Set Customer_id in the session as well
        request.session.Customer_id = customer._id; 
        console.log('Customer ID:', customer._id);

        response.render('userDashboard', { Customer: CustomerData, custReservationsI: custReservation });
      } else {
        return response.redirect("/LoginPage.html?error=invalid");
      }
    });
  } catch (error) {
    console.log("Error:", error);
    response.status(500).send("An error occurred: " + error.message);
  }
});




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up a static directory to serve other static assets (CSS, JavaScript, etc.)
app.use(express.static(path.join(__dirname, 'public')));    



/* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT *//* Customer LOGOUT */

app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/LoginPage.html');
  });
});



/* Make A Reservation*//* Make A Reservation*//* Make A Reservation*//* Make A Reservation*//* Make A Reservation*//* Make A Reservation*/
app.get('/MakeAreservation', async (req, res) => {
  // Check if the user is authenticated and has a valid session
  if (req.session.customerData && req.session.customerData._id) {
    try {
      const customerData = req.session.customerData;

      // Render the MakeAreservation page using the customerData
      res.render('MakeAreservation', { Customer: customerData });
    } catch (error) {
      console.error('Error rendering MakeAreservation page:', error);
      res.status(500).send('Error rendering MakeAreservation page');
    }
  } else {
    // Handle the case where there is no valid customer data in session
    res.status(500).send('Error: No customer data found in session');
  }
});

/* PayingPage*//* PayingPage*//* PayingPage*//* PayingPage*//* PayingPage*//* PayingPage*//* PayingPage*//* PayingPage*//* Saving info of Pax*/
app.get('/PayingPage', async (req, res) => {
  // Check if the user is authenticated and has a valid session
  if (req.session.customerData && req.session.customerData._id && req.session.custReservationData && req.session.custReservationData._id ) {
    try {
      const customerData = req.session.customerData;
      const custReservationData = req.session.custReservationData;  
      // Render the PayingPage page using the customerData
      res.render('PayingPage', { Customer: customerData, custReservationsI: custReservationData});
    } catch (error) {
      console.error('Error rendering PayingPage page:', error);
      res.status(500).send('Error rendering PayingPage page');
    }
  } else {
    // Handle the case where there is no valid customer data in session
    res.status(500).send('Error: No customer data found in session');
  }
});
/* Saving info of Pax*//* Saving info of Pax*//* Saving info of Pax*//* Saving info of Pax*//* Saving info of Pax*//* Saving info of Pax*/

app.post('/PayingPage', async (req, res) => {
  try {
    // Check the presence of TotalAmounta in req.body and ensure it's a string
    const totalAmountString = req.body.TotalAmounta?.toString();

    if (!totalAmountString) {
      console.error('Error: TotalAmounta is missing or not a string.');
      return res.status(400).send('TotalAmounta is missing or not a string.');
    }

    const custReservationData = req.session.custReservationData;

    // Get arrays of Pax details
    const paxFnames = req.body.PaxFnamea || [];
    const paxMnames = req.body.PaxMnamea || [];
    const paxSnames = req.body.PaxSnamea || [];
    const paxPhoneNos = req.body.PaxPhoneNoa || [];
    const paxAges = req.body.PaxAgea || [];
    const paxEmails = req.body.PaxEmaila || [];

    const paxDetails = [];

    // Combine Pax details into an array
    for (let i = 0; i < paxFnames.length; i++) {
      paxDetails.push({
        PaxFname: paxFnames[i],
        PaxMname: paxMnames[i],
        PaxSname: paxSnames[i],
        PaxPhoneNo: paxPhoneNos[i],
        PaxAge: paxAges[i],
        PaxEmail: paxEmails[i],
      });
    }

    const updateData = {
      $set: {
        customerRese: custReservationData,
        custID: custReservationData.customer,
        PaxInfo: paxDetails,
        InitialPayment: totalAmountString,
        Balance: req.body.Balancea,
        TotalPayment: req.body.TotalPaymenta,
        // Add other fields if needed
      }
    };
    req.session.updateData = updateData;
    console.log('custReservationsData:', updateData);
    // Update the customer reservation data
    const result = await custReservationsI.updateOne(
      { _id: custReservationData },
      updateData
    );

    // Check if the update was successful
    if (result.modifiedCount > 0) {
      res.redirect('/PayingPage2');
    } else {
      console.error('Error updating customer data.');
      res.status(500).send('Error updating customer data.');
    }
  } catch (error) {
    console.error('Error updating customer Reservation data:', error.message);
    res.status(500).send('Error updating customer data');
  }
});





// Add this route to handle cancel button click
app.get('/cancelReservation', async (req, res) => {
  try {
    const custReservationData = req.session.custReservationData;

    // Check if custReservationData is available
    if (!custReservationData || !custReservationData._id) {
      console.error('Error: No reservation data found in session');
      return res.status(500).send('Error: No reservation data found in session');
    }

    // Delete the reservation data from the database
    const result = await custReservationsI.deleteOne({ _id: custReservationData._id });

    // Check if the deletion was successful
    if (result.deletedCount > 0) {
      // Redirect to the user dashboard or any other page after cancellation
      res.redirect('/userDashboard');
    } else {
      console.error('Error deleting reservation data.');
      res.status(500).send('Error deleting reservation data.');
    }
  } catch (error) {
    console.error('Error canceling reservation:', error.message);
    res.status(500).send('Error canceling reservation');
  }
});














/* PayingPage2*//* PayingPage2*//* PayingPage2*//* PayingPage2*//* PayingPage2*//* PayingPage2*//* PayingPage2*//* PayingPage2*/
app.get('/PayingPage2', async (req, res) => {
  // Check if the user is authenticated and has a valid session
  if (req.session.customerData && req.session.customerData._id && req.session.custReservationData && req.session.custReservationData._id && req.session.updateData) {
    try {
      const customerData = req.session.customerData;
      const custReservationData = req.session.custReservationData;
      const amount = req.session.updateData;
      console.log('Render Data:', { Customer: customerData, custReservationsI: custReservationData, custReservationsI: amount });

      // Render the PayingPage2 page using the customerData
      res.render('PayingPage2', { Customer: customerData, custReservationsI: custReservationData, custReservationsI:amount });
    } catch (error) {
      console.error('Error rendering PayingPage2 page:', error);
      res.status(500).send('Error rendering PayingPage2 page');
    }
  } else {
    // Handle the case where there is no valid customer data in session
    res.status(500).send('Error: No customer data found in session');
  }
});



/* PayingPage2 Sending email*//* PayingPage2 Sending email*//* PayingPage2 Sending email*//* PayingPage2 Sending email*//* PayingPage2 Sending email*/


app.post('/processPayment', async (req, res) => {
  try {
    // Extract email and initial payment from the form data
    const userEmail = req.body.Email;

    // Get reservation details from session
    const custReservationData = req.session.custReservationData;
    const amount = req.session.updateData;
    // Check if custReservationData is available
    if (!custReservationData || !custReservationData._id) {
      console.error('Error: No reservation data found in session');
      return res.status(500).send('Error: No reservation data found in session');
    }

    // Create a transporter using your email service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'arceljann0904@gmail.com',
        pass: 'luhi vcih fooz pgty'
      }
    });

    // Reservation details to be displayed in the email
    const reservationDetails = `
      <p style="color: white;"><b style="color: yellow;">Tour Name:</b> ${custReservationData.tourName}</p>
      <p style="color: white;"><b style="color: yellow;">Tour Price:</b> ${custReservationData.tourPrice}</p>
      <p style="color: white;"><b style="color: yellow;">Duration:</b> ${custReservationData.duration}</p>
      <p style="color: white;"><b style="color: yellow;">Number of Guests:</b> ${custReservationData.totalPerson}</p>
      <p style="color: white;"><b style="color: yellow;">Time Slot:</b> ${custReservationData.timeSlot}</p>
      <p style="color: white;"><b style="color: yellow;">Your Booking Date:</b> ${custReservationData.reservDate ? new Date(custReservationData.reservDate).toISOString().split('T')[0] : ''}</p>
    `;
    const InitialPayments = `
    <p style="color: yellow; font-weight: bold; font-size:  19px;"> ₱ ${amount.$set.InitialPayment}</p>
    `;

    // Email options
    const mailOptions = {
      from: 'arceljann0904@gmail.com',
      to: userEmail,
      subject: 'ATV Rental Gcash Payment Details',
      html: `

      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="LOGOATV.png" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Aclonica&family=Baloo+Tamma+2&family=Black+Ops+One&family=Bungee+Inline&family=Fredericka+the+Great&family=Fredoka&family=Rubik+Moonrocks&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Aclonica&family=Baloo+Tamma+2&family=Black+Ops+One&family=Bungee+Inline&family=Fredericka+the+Great&family=Fredoka&family=Rubik+Moonrocks&display=swap" rel="stylesheet">
<style>

</style>

    </head>
<body>
      <div style=" border-bottom-left-radius: 100px;border-bottom-right-radius: 100px; width: 100%; padding:20px; height: 100%; display: flex; flex-direction: column; align-items: center; background-color: rgb(34, 34, 34); color: yellow;">
        <div style="width: 100%; height: 50%; position: relative; color: yellow;">
          <div style="display: flex; align-items: center; justify-content: space-between; color: yellow;">
          <img src="https://scontent.fmnl4-5.fna.fbcdn.net/v/t39.30808-6/405385006_1789283898169909_1162103510276833055_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=EwkEpPktfF4AX_1_ZpP&_nc_oc=AQn4ZNGHHrfPljw96NgcQDJV7B-r0rfrBqpP3AQQ_ZfHfTrdhxprHU3uf0WYy4ydWss&_nc_ht=scontent.fmnl4-5.fna&oh=00_AfBTKEdI-6uNaAzshT1iwzl3C4NWWU_GlFJBxowr4BwKfg&oe=656B94BB" style="width: 20%; height: auto; border-radius:100px; margin-right:10px;">
            <h1 style="font-family: 'Fredoka', sans-serif; color: yellow;">ATV RENTAL</h1>
          </div>
          <p style="font-family: 'Fredoka', sans-serif; color: white;">This is the Verified Gcash Number of ATV Rental: <b style="color: yellow;">09354233449</b>.</p>
          <p style="font-family: 'Fredoka', sans-serif; color: white;">Kindly install the Gcash App for the payment method so you can pay.</p>
          <p style="font-family: 'Fredoka', sans-serif; color: white;">Initial Payment: ${InitialPayments}</p>
          <p style="font-family: 'Fredoka', sans-serif; color: white;"> If it's more convenient, you can simply scan this QR code for the payment of your slot. Thank you very much for your patronage.</p>
          <img src="https://scontent-hkg4-2.xx.fbcdn.net/v/t39.30808-6/405322386_1789305601501072_6255451396847173057_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=dd5e9f&_nc_ohc=98xONfyHSdgAX9nbP0R&_nc_ht=scontent-hkg4-2.xx&oh=00_AfB1Xb7PlvltOZJPN8XSEEWRPlRxm7BlQD_Z9B7k_zMqGw&oe=656B4F5B" style="width:50%; Height:auto; margin-left:50px; border-radius:20px;">
        </div>
        <div style="background-color: rgb(34, 34, 34); padding: 10px; width: 100%; height: 50%; position: relative; color: yellow;">
          <h2 style="font-family: 'Fredoka', sans-serif; color: yellow;">Reservation Details:</h2>
          ${reservationDetails}
        <p style="margin-top:50px; font-family: 'Fredoka', sans-serif; color: white;"><b style="color: yellow;"> Note:</b> You can use it to pay for your reserved slot at ATV Rental. Copy the Gcash number of ATV Rental or scan the Qr code on left side and proceed to make the payment for your slot. Please wait for our response; the status will initially be pending. Once we have identified your Gcash number and confirmed your payment in our system, only then will it be marked as done or paid.</p>
        <ul style="display: flex; text-align: left; list-style-type: none; ">
          <li style=" list-style-type: none;" >+63 923 456 7891 | +63 943 545 4653</li>
          <li style=" list-style-type: none;" >atvrental04@gmail.com</li>
        </ul>
        <ul style="display: flex; background-color: transparent; text-align: left;">
          <li style=" list-style-type: none; background-color: transparent; text-align: left;"><a href="facebook.com" style=" text-decoration: none;"> <h5 style="color: blue; font-weight: bold; font-size:  19px;">Facebook</h5></a></li>
          <li style=" list-style-type: none; background-color: transparent; text-align: left;"><a href="outube.com" style=" text-decoration: none;"> <h5 style="color: red; font-weight: bold; font-size:  19px;">Youtube</h5></a></li>
          <li style=" list-style-type: none; background-color: transparent; text-align: left;"><a href="instagram.com" style=" text-decoration: none;"> <h5 style="color: pink; font-weight: bold; font-size:  19px;">Instagram</h5></a></li>
          <li style=" list-style-type: none; background-color: transparent; text-align: left;"><a href="tiktok.com" style=" text-decoration: none;"> <h5 style="color: white; font-weight: bold; font-size:  19px;">Tiktok</h5></a></li>
          
          </ul>
        </div>

      </div>
      </body>
      </html> 
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ' + info.response);

    // Redirect to PayingPage3.ejs after the email has been sent
    res.redirect('/PayingPage3');
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).send('Error sending email');
  }
});


/* Saving Gcash Num in custReservationsI*//* Saving Gcash Num in custReservationsI*//* Saving Gcash Num in custReservationsI*//* Saving Gcash Num in custReservationsI*/


app.post('/processPayment2', async (req, res) => {
  try {
    const gCashNum = req.body.gCashNum;

    // Assuming custReservationData is available in req.session
    const custReservationData = req.session.custReservationData;

    // Check if custReservationData is available
    if (!custReservationData || !custReservationData._id) {
      console.error('Error: No reservation data found in session');
      return res.status(500).send('Error: No reservation data found in session');
    }

    // Assuming you have a Mongoose model for custReservationsI
    await custReservationsI.findByIdAndUpdate(custReservationData._id, { gCashNum });

    // Redirect to userDashboard after the update
    res.redirect('/userDashboard');
  } catch (error) {
    console.error('Error processing payment:', error.message);
    res.status(500).send('Error processing payment');
  }
});








/* PayingPage3*//* PayingPage3*//* PayingPage3*//* PayingPage3*//* PayingPage3*//* PayingPage3*//* PayingPage3*//* PayingPage3*/
app.get('/PayingPage3', async (req, res) => {
  // Check if the user is authenticated and has a valid session
  if (req.session.customerData && req.session.customerData._id && req.session.custReservationData && req.session.custReservationData._id) {
    try {
      const customerData = req.session.customerData;
      const custReservationData = req.session.custReservationData;  
      // Render the PayingPage3 page using the customerData
      res.render('PayingPage3', { Customer: customerData, custReservationsI: custReservationData});
    } catch (error) {
      console.error('Error rendering PayingPage3 page:', error);
      res.status(500).send('Error rendering PayingPage3 page');
    }
  } else {
    // Handle the case where there is no valid customer data in session
    res.status(500).send('Error: No customer data found in session');
  }
});
/* Booking Process *//* Booking Process *//* Booking Process *//* Booking Process *//* Booking Process *//* Booking Process *//* Booking Process */


app.post("/saveReservation", async (req, res) => {
  try {
    // Check if the user has an existing reservation
    const existingReservation = await custReservationsI.findOne({
      customer: req.session.customerData._id,
      status: 'Pending',
      reservDate: req.body.ReserveDate,
      timeSlot: req.body.TimeSlot,
    });

    // If an existing reservation is found, show an alert
    if (existingReservation) {
      return res.send('<script>alert("You already have a reservation! Just 1 Reservation"); window.location.href = "/MakeAreservation";</script>');
    }

    // Check the number of existing reservations for the selected date and time slot
    const existingReservations = await custReservationsI.countDocuments({
      reservDate: req.body.ReserveDate,
      timeSlot: req.body.TimeSlot,
    });

    const maxGroupsPerSlot = 3;

    if (existingReservations >= maxGroupsPerSlot) {
      // If the limit is reached, show an alert
      return res.send('<script>alert("Sorry, fully booked for the selected date and time slot."); window.location.href = "/MakeAreservation";</script>');
    }

    // If no existing reservation is found and there's space, proceed to create a new reservation
    const custReservation = await custReservationsI.create({
      customer: req.session.customerData._id,
      FName: req.body.Cust1Name,
      MName: req.body.Cust2Name,
      Sname: req.body.Cust3Name,
      tourName: req.body.TourName,
      tourPrice: req.body.TourPrice,
      reservDate: req.body.ReserveDate,
      timeSlot: req.body.TimeSlot,
      status: req.body.Status,
      totalPerson: req.body.TotalPerson,
      duration: req.body.Duration,
      TotalAmount: req.body.TotalAmounta,
      Balance: req.body.Balancea,
      InitialPayment: req.body.totalAmountString,
      PaxInfo: {
        PaxFname: req.body.firstName,
        PaxMname: req.body.middleName,
        PaxSname: req.body.sureName,
        PaxPhoneNo: req.body.cellphone,
        PaxAge: req.body.age,
        PaxEmail: req.body.gmailAddress,
      }
    });

    // Store the reservation data in the session
    req.session.custReservationData._id = custReservation;
    req.session.custReservationData = custReservation;

    console.log('Recorded Booking for', req.body.Cust1Name, req.body.Cust2Name, req.body.Cust3Name);

    // If you want to display a success alert, you can add the following line:
    // return res.send('<script>alert("Booking successful!");</script>');

    return res.send('<script>alert("Booking successful!"); window.location.href = "/PayingPage";</script>');
  } catch (error) {
    console.error('Error saving reservation:', error);
    return res.status(500).send('Error saving reservation: ' + error.message);
  }
});








/* userDashboard *//* userDashboard *//* userDashboard *//* userDashboard *//* userDashboard *//* userDashboard *//* userDashboard *//* userDashboard */

app.get('/userDashboard', (req, res) => {
  // Check if the user is authenticated and has a valid session
  if (req.session.customerData && req.session.customerData._id && req.session.custReservationData   ) {
    try {
      const customerData = req.session.customerData; 
      const custReservationData = req.session.custReservationData;  
      
      // Render the userDashboard page using the customerData
      res.render('userDashboard', { Customer: customerData, custReservationsI: custReservationData  });
    } catch (error) {
      console.error('Error rendering userDashboard page:', error);
      res.status(500).send('Error rendering userDashboard page');
    }
  } else {
    // Handle the case where there is no valid customer data in session
    res.status(500).send('Error: No customer data found in session');
  }
});


/*Dashboard Edit Profile*//*Dashboard Edit Profile*//*Dashboard Edit Profile*//*Dashboard Edit Profile*//*Dashboard Edit Profile*/

const { Types } = require('mongoose');
const multer = require('multer');
const upload = multer();

app.post('/Customerprofile', upload.single('picture'), async (req, res) => {
  const Customer = db.collection('Customer');

  try {
    // Ensure _id is in the correct ObjectId format
    const customerId = new Types.ObjectId(req.session.Customer_id);

    // Check if a file was uploaded
    let profileData = null;
    if (req.file && req.file.buffer) {
      // Convert the file buffer to BinData
      profileData = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const updateData = {
      $set: {
        FName: req.body.Cust1Name,
        MName: req.body.Cust2Name,
        Sname: req.body.Cust3Name,
        Gender: req.body.gender,
        Address: {
          Street: req.body.Address1street,
          Barangay: req.body.Address2brgy,
          Province: req.body.Address3pro,
          Country: req.body.Address4country,
          MuniCity: req.body.Address5municity
        },
        Phone: req.body.CpNum,
        Email: req.body.Gmail,
        Username: req.body.username,
        Password: req.body.password,
        Picture: profileData
        // Add other user data you want to update
      }
    };

    await Customer.updateOne(
      { _id: customerId },
      updateData
    );

    console.log('Customer data updated:', updateData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating customer data:', error);
    res.status(500).send('Error updating customer data');
  }
});

/* reservationHistory *//* reservationHistory *//* reservationHistory *//* reservationHistory *//* reservationHistory *//* reservationHistory *//* reservationHistory */

app.get('/reservationHistory', (req, res) => {
 // Check if the user is authenticated and has a valid session
 if (req.session.customerData && req.session.customerData._id && req.session.custReservationData) {
  try {
    const customerData = req.session.customerData;
    const custReservationData = req.session.custReservationData;

    // Render the reservationHistory page using the customerData
    res.render('reservationHistory', { Customer: customerData, custReservationsI: custReservationData});
  } catch (error) {
    console.error('Error rendering reservationHistory page:', error);
    res.status(500).send('Error rendering reservationHistory page');
  }
} else {
  // Handle the case where there is no valid customer data in session
  res.status(500).send('Error: No customer data found in session');
}
});
/* DeletereservationHistory *//* DeletereservationHistory *//* DeletereservationHistory *//* DeletereservationHistory *//* DeletereservationHistory */

app.delete('/deleteReservation/:reservationId', async (req, res) => {
    const reservationId = req.params.reservationId;

    try {
        // Ensure reservationId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).send('Invalid reservation ID');
        }

        // Find and delete the reservation by its ID
        const deletedReservation = await custReservationsI.findByIdAndDelete(reservationId);

        if (!deletedReservation) {
            return res.status(404).send('Reservation not found');
        }

        res.status(200).send('Reservation deleted successfully');
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).send('Error deleting reservation');
    }
});




/* takenNoteUser *//* takenNoteUser *//* takenNoteUser *//* takenNoteUser *//* takenNoteUser *//* takenNoteUser *//* takenNoteUser *//* takenNoteUser */

app.get('/takenNoteUser', (req, res) => {
 // Check if the user is authenticated and has a valid session
 if (req.session.customerData && req.session.customerData._id) {
  try {
    const customerData = req.session.customerData;

    // Render the takenNoteUser page using the customerData
    res.render('takenNoteUser', { Customer: customerData });
  } catch (error) {
    console.error('Error rendering takenNoteUser page:', error);
    res.status(500).send('Error rendering takenNoteUser page');
  }
} else {
  // Handle the case where there is no valid customer data in session
  res.status(500).send('Error: No customer data found in session');
}
});

/* rulesAndRegulation *//* rulesAndRegulation *//* rulesAndRegulation *//* rulesAndRegulation *//* rulesAndRegulation *//* rulesAndRegulation *//* rulesAndRegulation */

app.get('/rulesAndRegulation', (req, res) => {
 // Check if the user is authenticated and has a valid session
 if (req.session.customerData && req.session.customerData._id) {
  try {
    const customerData = req.session.customerData;

    // Render the rulesAndRegulation page using the customerData
    res.render('rulesAndRegulation', { Customer: customerData });
  } catch (error) {
    console.error('Error rendering rulesAndRegulation page:', error);
    res.status(500).send('Error rendering rulesAndRegulation page');
  }
} else {
  // Handle the case where there is no valid customer data in session
  res.status(500).send('Error: No customer data found in session');
}
});


app.get('LoginPage.html', (req, res) => {
  // Clear the Customer_id from the session
  req.session.Customer_id = null;

  // Optionally, you can destroy the entire session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect the user to a login or home page
    res.redirect('/LoginPage.html'); // Redirect to your login page
  });
});








/*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*/


/*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*//*TourGuide Login*/
app.post("/TGlogin", async (request, response) => {
  try {
    const { TGname, TGpass } = request.body;

    const empTourGuide = db.collection('empTourGuide');

    empTourGuide.findOne({ email: TGname }, async (err, TG) => {
      if (err) {
        console.log("Error:", err);
        return response.status(500).send("An error occurred: " + err.message);
      }

      if (!TG) {
        return response.redirect("/TourguideLogin.html?error=invalid");
      }

      if (TG.password === TGpass) {
        console.log("Login successfully");
        const TourguideData = {
          _id: TG._id,
          Fname: TG.FName,
          Mname: TG.MName,
          Lname: TG.Sname,
          name: TG.FName + " " + TG.MName + " " + TG.Sname,
          Email: TG.email,
          Phone: TG.phone,
          address: TG.address,
          startDate: TG.startDate,
          submissionDate:TG.submissionDate,
          Username: TG.username,
          Password: TG.password,
        };
       
        // Fetch reservations and store in session
        const reservations = await db.collection('custReservations').find().toArray();
        request.session.ScheduleTour = reservations;
        
        request.session.tourguideData_id = TG._id;
        console.log('Tourguide ID:', TG._id);

        request.session.tourguideData = TourguideData;
        console.log('TourguideData:', TourguideData);

        response.redirect("/TourguideDashboard");
      } else {
        return response.redirect("/TourguideLogin.html?error=invalid");
      }
    });
  } catch (error) {
    console.log("Error:", error);
    response.status(500).send("An error occurred: " + error.message);
  }
});

/*TourGuide Dashboard*//*TourGuide Dashboard*//*TourGuide Dashboard*//*TourGuide Dashboard*//*TourGuide Dashboard*//*TourGuide Dashboard*/

app.get('/TourguideDashboard', (req, res) => {

  if (req.session.tourguideData && req.session.tourguideData_id) {
   try {
     const TourguideData = req.session.tourguideData;

     res.render('TourguideDashboard', { empTourGuide: TourguideData });
   } catch (error) {
     console.error('Error rendering TourguideDashboard page:', error);
     res.status(500).send('Error rendering TourguideDashboard page');
   }
 } else {
  
   res.status(500).send('Error: No Tourguide data found in session');
 }
 });
/*TourGuide Profile*//*TourGuide Profile*//*TourGuide Profile*//*TourGuide Profile*//*TourGuide Profile*//*TourGuide Profile*//*TourGuide Profile*/

app.get('/TourguideProfile', (req, res) => {

  if (req.session.tourguideData && req.session.tourguideData_id) {
   try {
     const TourguideData = req.session.tourguideData;
    
     res.render('TourguideProfile', { empTourGuide: TourguideData  });
   } catch (error) {
     console.error('Error rendering TourguideProfile page:', error);
     res.status(500).send('Error rendering TourguideProfile page');
   }
 } else {
  
   res.status(500).send('Error: No Tourguide data found in session');
 }
 });
  
/*TourGuide schedule of tour*//*TourGuide schedule of tour*//*TourGuide schedule of tour*//*TourGuide schedule of tour*//*TourGuide schedule of tour*//*TourGuide schedule of tour*/

app.get('/scheduleOfTour', async (req, res) => {
  try {
    if (req.session.tourguideData) {
      const customerReservations = await db.collection('custReservations').find({}).toArray();

      if (customerReservations.length === 0) {
        console.log('No customer reservations found.');
      } else {
        console.log('Fetched customer reservations:', customerReservations);
      }

      const tourguideData = req.session.tourguideData;
      console.log('TourguideData:', tourguideData);
      res.render('scheduleOfTour', { empTourGuide: tourguideData, custReservations: customerReservations });
    } else {
      res.status(500).send('Error: No Tourguide data found in session');
    }
  } catch (error) {
    console.error('Error rendering scheduleOfTour page:', error);
    res.status(500).send('Error rendering scheduleOfTour page');
  }
});







/*TourGuide ATV MAP*//*TourGuide ATV MAP*//*TourGuide ATV MAP*//*TourGuide ATV MAP*//*TourGuide ATV MAP*//*TourGuide ATV MAP*//*TourGuide ATV MAP*/

app.get('/HistoryOfTours', (req, res) => {

  if (req.session.tourguideData) {
   try {
     const TourguideData = req.session.tourguideData;
    
     res.render('HistoryOfTours', { empTourGuide: TourguideData  });
   } catch (error) {
     console.error('Error rendering HistoryOfTours page:', error);
     res.status(500).send('Error rendering HistoryOfTours page');
   }
 } else {
  
   res.status(500).send('Error: No Tourguide data found in session');
 }
 });

/*TourGuide list of demo*//*TourGuide list of demo*//*TourGuide list of demo*//*TourGuide list of demo*//*TourGuide list of demo*//*TourGuide list of demo*/

app.get('/ListOfDemo', (req, res) => {

  if (req.session.tourguideData) {
   try {
     const TourguideData = req.session.tourguideData;
    
     res.render('ListOfDemo', { empTourGuide: TourguideData  });
   } catch (error) {
     console.error('Error rendering ListOfDemo page:', error);
     res.status(500).send('Error rendering ListOfDemo page');
   }
 } else {
  
   res.status(500).send('Error: No Tourguide data found in session');
 }
 });

/*TourGuide Rules and regulation*//*TourGuide Rules and regulation*//*TourGuide Rules and regulation*//*TourGuide Rules and regulation*//*TourGuide Rules and regulation*/

app.get('/TGRulesAndRegulation', (req, res) => {

  if (req.session.tourguideData) {
   try {
     const TourguideData = req.session.tourguideData;
    
     res.render('TGRulesAndRegulation', { empTourGuide: TourguideData  });
   } catch (error) {
     console.error('Error rendering TGRulesAndRegulation page:', error);
     res.status(500).send('Error rendering TGRulesAndRegulation page');
   }
 } else {
  
   res.status(500).send('Error: No Tourguide data found in session');
 }
 });



/*Forgot Password*//*Forgot Password*//*Forgot Password*//*Forgot Password*//*Forgot Password*//*Forgot Password*//*Forgot Password*//*Forgot Password*/
/* Forgot Password */
app.get('/ForgotPass', (req, res) => {

  res.render('ForgotPass');
});

/* Change Password *//* Change Password *//* Change Password *//* Change Password *//* Change Password *//* Change Password */

const generateResetCode = () => {
  const resetCode = Math.floor(100000 + Math.random() * 900000);
  return resetCode.toString();
};

const sendResetCodeToEmail = async (email, resetCode) => {
  try {
    const mailOptions = {
      from: 'arceljann0904@gmail.com',
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
/* Save otp in database *//* Save otp in database *//* Save otp in database *//* Save otp in database *//* Save otp in database */
app.post('/forgotPassword', async (req, res) => {
  const email = req.body.email ? req.body.email.toLowerCase() : '';

  try {
    if (!email) {
      throw new Error('Email not provided.');
    }

    console.log('User entered email:', email);

    const resetCode = generateResetCode();

    console.log('Generated reset code:', resetCode);
    console.log('Customer OTP:', resetCode); // Log the reset code (otp)

    const emailSent = await sendResetCodeToEmail(email, resetCode);

    console.log('Email sent:', emailSent);

    if (!emailSent) {
      throw new Error('Failed to send reset code email.');
    }

    // Find the customer by email
    let customer = await db.collection('Customer').findOne({ Email: email });

    if (!customer) {
      throw new Error('Customer not found.'); // Customer not found, throw an error
    }

    // Update the OTP for the existing customer in the "Customer" collection
    await db.collection('Customer').updateOne(
      { _id: new ObjectId(customer._id) }, // Create an ObjectId instance
      { $set: { otp: resetCode } }
    );

    console.log('Customer OTP updated in the database.');

    console.log('Customer _Id:', customer._id); // Log the Customer _Id
    console.log('Customer data saved or updated in the database.');

    res.status(200).send('Reset code sent to your email.');
  } catch (error) {
    console.error('Error sending reset code email:', error.message);
    res.status(500).send('Failed to send reset code.');
  }
});


/* Verify OTP *//* Verify OTP *//* Verify OTP *//* Verify OTP *//* Verify OTP *//* Verify OTP */

app.post('/verifyCode', async (req, res) => {
  const enteredCode = req.body.enteredCode;

  try {
    const customer = await db.collection('Customer').findOne({ otp: enteredCode });

    if (customer) {
      // Code is valid, you can implement additional actions if needed
      res.status(200).json({ message: 'Code verified successfully.' });
    } else {
      res.status(400).json({ message: 'Invalid code. Please try again.' });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Failed to verify code.' });
  }
});

/* Change Password *//* Change Password *//* Change Password *//* Change Password *//* Change Password *//* Change Password */

app.post('/changePassword', async (req, res) => {
  const email = req.body.email; // Assuming email is sent in the request body
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  // Check if the passwords match
  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match. Please try again.' });
    return;
  }

  try {
    // Find the customer by email
    const customer = await db.collection('Customer').findOne({ Email: email });

    if (!customer) {
      console.log('Customer not found with email:', email);
      res.status(400).json({ message: 'Customer not found.' });
      return;
    }

    // Update the password for the existing customer in the "Customer" collection
    await db.collection('Customer').updateOne(
      { _id: customer._id },
      { $set: { Password: newPassword } }
    );

    console.log('Password changed successfully for user with email:', email);
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

/* Tourguide Submit Resume *//* Tourguide Submit Resume *//* Tourguide Submit Resume *//* Tourguide Submit Resume *//* Tourguide Submit Resume */

app.post("/SubmitResume", (req, res) => {

  var firstname = req.body.firstname;
  var middlename = req.body.middlename;
  var surename = req.body.surename;
  var email = req.body.email;
  var phone = req.body.phone;
  var Address = req.body.Address;
  var resume = req.body.resume;
  const accountCreationDate = new Date();

  
  var data = {
    "FName": firstname,
    "MName": middlename,
    "Sname": surename,
    "phone": phone,
    "email": email,
    "address": Address,
    "resume": resume,
    "submissionDate": accountCreationDate,
  };


  db.collection('empResume').insertOne(data, (err, collection) => {
    if (err) {
      throw err;
    }
    console.log("Application Success");

  });
  return res.redirect('Submited.html');
});


/* Tourguide Edit Profile *//* Tourguide Edit Profile *//* Tourguide Edit Profile *//* Tourguide Edit Profile *//* Tourguide Edit Profile *//* Tourguide Edit Profile */


app.post('/TourguideProfile', upload.single('picture'), async (req, res) => {
  const empTourGuide = db.collection('empTourGuide');

  try {
    // Ensure _id is in the correct ObjectId format
    const tourguideDataId = new ObjectId(req.session.tourguideData_id);

    const TGupdateData = {
      $set: {
        FName: req.body.Fname,
        MName: req.body.Mname,
        Sname: req.body.Lname,
        phone: req.body.Phone,
        email: req.body.Email,
        username: req.body.Username,
        password: req.body.Password,
        // Add other user data you want to update
      }
    };

    const result = await empTourGuide.updateOne(
      { _id: tourguideDataId },
      TGupdateData
    );

    if (result.matchedCount === 0) {
      console.log('Tour Guide not found for update');
      return res.status(404).json({ success: false, message: 'Tour Guide not found for update' });
    }

    console.log('Tour Guide data updated:', TGupdateData);

    // Redirect back to the profile page
    res.redirect('/TourguideProfile');
  } catch (error) {
    console.error('Error updating tour guide data:', error);
    res.status(500).send('Error updating tour guide data');
  }
});

/*Displaying Schedule of Tours*//*Displaying Schedule of Tours*//*Displaying Schedule of Tours*//*Displaying Schedule of Tours*//*Displaying Schedule of Tours*//*Displaying Schedule of Tours*/





/*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*//*Test*/

app.listen(port, () => {
  console.log('Listening on port:', port);
});

