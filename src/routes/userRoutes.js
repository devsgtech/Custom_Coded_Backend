const express = require("express");
const { userLogin } = require("../controllers/userController");

const router = express.Router();

// router.get("/", getUsers);
// router.post("/", createUser);
router.post("/login", userLogin);

module.exports = router;
