const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const paymentAuth = require('../middleware/paymentAuth');

// Create payment intent
router.post('/create-payment-intent', paymentAuth.verifyTokenAndCode, paymentController.createPaymentIntent);

// Verify payment
router.post('/verify-payment', paymentAuth.verifyTokenOnly, paymentController.verifyPayment);

// Stripe webhook (raw body required for signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Get payment history for a code
router.get('/history/:code_id', paymentAuth.verifyTokenAndCode, paymentController.getPaymentHistory);

// Get user's purchased shop items (with code_id in URL)
router.get('/purchased-items/:code_id', paymentAuth.verifyTokenAndCode, paymentController.getUserPurchasedItems);

// Get user's purchased shop items (with code_id in JSON body)
router.post('/purchased-items', paymentAuth.verifyTokenAndCode, paymentController.getUserPurchasedItemsFromBody);

module.exports = router; 