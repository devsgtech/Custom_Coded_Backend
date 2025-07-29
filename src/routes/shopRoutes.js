const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/shop', shopController.getAllShops);

module.exports = router; 