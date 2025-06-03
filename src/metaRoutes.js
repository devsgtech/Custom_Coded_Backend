const express = require('express');
const router = express.Router();
const {  createmeta, getmetaList } = require('../controllers/metaController');

// Public routes
router.get('/getmeta_List', getmetaList);

// Protected routes (require admin authentication)
router.post('/create', createmeta);


module.exports = router; 