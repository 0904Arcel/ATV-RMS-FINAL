// routes/Customers.js

const express = require('express');
const router = express.Router();
const CreateService = require('../services/Create');
const RetrieveService = require('../services/Retrieve');
const UpdateService = require('../services/Update');
const DeleteService = require('../services/Delete');






// Create a new customer
router.post('/create', async (req, res) => {
  const { Username, Password } = req.body;
  
  try {
    const result = await CreateService(Username, Password);
    if (result) {
      res.status(200).send({
        status: result,
        message: 'Successfully Created!',
      });
    } else {
      res.status(500).send({
        status: result,
        message: 'Not Created!',
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

// Retrieve customer data
router.post('/retrieve', async (req, res) => {
  try {
    const results = await RetrieveService();
    if (results) {
      res.status(200).send(results);
    } else {
      res.status(500).send({
        status: results,
        message: 'Not Retrieved!',
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

// Update customer data
router.post('/update', async (req, res) => {
  const { _id, obj } = req.body;

  try {
    const results = await UpdateService(_id, obj);
    if (results) {
      res.status(200).send({
        status: results,
        message: 'Successfully Updated!',
      });
    } else {
      res.status(500).send({
        status: results,
        message: 'Not Updated!',
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

// Delete a customer
router.post('/delete', async (req, res) => {
  const { _id } = req.body;
  
  try {
    const results = await DeleteService(_id);
    if (results) {
      res.status(200).send({
        status: results,
        message: 'Successfully Deleted!',
      });
    } else {
      res.status(500).send({
        status: results,
        message: 'Not Deleted!',
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

module.exports = router;
