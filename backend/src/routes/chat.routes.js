const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/conversations", ctrl.conversations);
router.get("/:peerId", ctrl.thread);
router.post("/:peerId", ctrl.send);

module.exports = router;
