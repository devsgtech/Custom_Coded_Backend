const express = require('express');
const router = express.Router();
const { createcodeid, fetchCodeIds, deleteCodeId } = require('../controllers/codeidController');
const authenticateToken = require('../middleware/authN');


// Protected routes (require admin authentication)
router.post('/create', authenticateToken, createcodeid);
router.post('/fetchIds', authenticateToken, fetchCodeIds);
router.post('/delete', authenticateToken, deleteCodeId);

module.exports = router; 