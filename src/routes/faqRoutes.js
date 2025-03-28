const express = require('express');
const router = express.Router();
const { createFaq, getFaqList } = require('../controllers/faqController');

// Create FAQ (protected route - admin only)
router.post('/create', createFaq);

// Get FAQ List (open route - no authentication required)
router.get('/getFaq_List', getFaqList);

module.exports = router; 