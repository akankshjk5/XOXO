const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/upload.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/", protect, upload.single("file"), ctrl.uploadImage);
router.get("/status", ctrl.uploadStatus);

module.exports = router;
