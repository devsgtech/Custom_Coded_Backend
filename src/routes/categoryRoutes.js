const express = require('express');
const router = express.Router();
const { createCategory,getCategory } = require('../controllers/categoryController');


// router.get('/getFaq_List', getFaqList);

router.post('/create', createCategory);
router.get('/category_List', getCategory);

module.exports = router; 