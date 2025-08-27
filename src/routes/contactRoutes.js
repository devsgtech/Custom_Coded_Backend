const express = require('express');
const router = express.Router();
const { submitContact, getMessages, changeStatus } = require('../controllers/contactController');
const authenticateToken = require('../middleware/authN');

// Submit contact form (public endpoint)
router.post('/submit', submitContact);

// Protected route to get all contact messages
router.post("/getMessages", authenticateToken, getMessages);

router.post("/changeStatus", authenticateToken, changeStatus);

module.exports = router;