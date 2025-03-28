const express = require('express');
const router = express.Router();
const { validateAdminLogin } = require('../middleware/adminValidation');
const { login } = require('../controllers/adminController');

// Admin login route
router.post('/login', validateAdminLogin, login);

module.exports = router; 