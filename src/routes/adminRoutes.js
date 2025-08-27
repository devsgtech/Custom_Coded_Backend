const express = require('express');
const router = express.Router();
const { login, securityQuestions, verifySecurityAnswer } = require('../controllers/adminController');
const authenticateToken = require('../middleware/authN');

// Admin login route
router.post('/login', login);
router.get('/fetchQuestions', authenticateToken, securityQuestions);
router.post('/verify-security-answer', authenticateToken, verifySecurityAnswer);

module.exports = router;