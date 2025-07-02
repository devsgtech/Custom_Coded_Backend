const express = require('express');
const router = express.Router();
const {  createmeta, getmetaList, getTemplatesList } = require('../controllers/metaController');

// Public routes
router.post('/getmeta_List', getmetaList);
router.get('/templates', getTemplatesList);

// Protected routes (require admin authentication)
router.post('/create', createmeta);


module.exports = router; 