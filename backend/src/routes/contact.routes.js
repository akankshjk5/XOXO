const express = require("express");
const ctrl = require("../controllers/contact.controller");
const optionalAuth = require("../middleware/optionalAuth");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", ctrl.submitContact);
router.get("/messages", protect, adminOnly, ctrl.listContact);

module.exports = router;
