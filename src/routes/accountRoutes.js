const express = require("express");
const router = express.Router();
const {fetchAdminUsers, createAdminUser, adminUserUpdate, fetchSecurityQuestions} = require("../controllers/accountController");
const authenticateToken = require("../middleware/authN");
const authorizeRoles = require("../middleware/authZ");
const fetchIPAddress = require("../middleware/fetchIP");

router.post("/fetch", authenticateToken, authorizeRoles(["Admin", "Editor", "Developer"]), fetchIPAddress, fetchAdminUsers);
router.post('/create', authenticateToken, authorizeRoles(["Admin", 'Editor']), createAdminUser);
router.post('/update', authenticateToken, authorizeRoles(["Admin"]), adminUserUpdate);
router.get('/security-questions', authenticateToken, fetchSecurityQuestions);

module.exports = router;