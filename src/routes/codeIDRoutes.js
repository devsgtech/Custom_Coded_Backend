const express = require('express');
const router = express.Router();
const { createcodeid } = require('../controllers/codeidController');


// Protected routes (require admin authentication)
router.post('/create', createcodeid);


module.exports = router; 