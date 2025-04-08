const express = require('express');
const router = express.Router();
const { getFaqList, createFaq, updateFaq, deleteFaq } = require('../controllers/faqController');

// Public routes
router.get('/getFaq_List', getFaqList);

// Protected routes (require admin authentication)
router.post('/create', createFaq);
router.put('/update', updateFaq);
router.delete('/delete', deleteFaq);

module.exports = router; 