const express = require('express');
const router = express.Router();
const { login } = require('../controllers/adminController');

// Admin login route
router.post('/login', login);

module.exports = router; 