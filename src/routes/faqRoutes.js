const express = require("express");
const router = express.Router();
const {
  getFaqList,
  createFaq,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqController");
const authenticateToken = require("../middleware/authN");

router.post("/getFaq_List", getFaqList);
router.post("/create", authenticateToken, createFaq);
router.put("/update", authenticateToken, updateFaq);
router.delete("/delete", authenticateToken, deleteFaq);

module.exports = router;