const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');

// Submit contact form (public endpoint)
router.post('/submit', submitContact);

module.exports = router; 