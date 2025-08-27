const express = require('express');
const router = express.Router();
<<<<<<< Updated upstream
const {  createmeta, getmetaList } = require('../controllers/metaController');
=======
const {  createmeta, getmetaList, getTemplatesList, fetchAllMetaList, updateMeta, upload, deleteMeta, addMetaAsset } = require('../controllers/metaController');
const authenticateToken = require('../middleware/authN');
const authorizeRoles = require('../middleware/authZ');
>>>>>>> Stashed changes

// Public routes
router.post('/getmeta_List', getmetaList);

// Protected routes (require admin authentication)
router.post('/create', createmeta);
router.post('/fetch', authenticateToken, authorizeRoles(["Admin"]), fetchAllMetaList)
router.post('/updateMeta', authenticateToken, authorizeRoles(["Admin"]), upload.single('file'), updateMeta)
router.post('/deleteMeta', authenticateToken, authorizeRoles(["Admin"]), deleteMeta)
router.post('/addMetaAsset', authenticateToken, authorizeRoles(["Admin"]), upload.single('file'), addMetaAsset)

module.exports = router; 