const express = require('express');

// Middleware to handle raw body for Stripe webhooks
const webhookMiddleware = (req, res, next) => {
    if (req.path === '/api/payment/webhook') {
        express.raw({ type: 'application/json' })(req, res, next);
    } else {
        next();
    }
};

module.exports = webhookMiddleware; 