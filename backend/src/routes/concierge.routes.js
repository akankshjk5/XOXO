const express = require("express");
const { optionalAuth } = require("../middleware/optionalAuth");
const { protect } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/concierge.controller");

const router = express.Router();

router.get("/prompts", ctrl.suggestedPrompts);
router.get("/share/:token", ctrl.getShared);

router.post("/sessions", optionalAuth, ctrl.createSession);
router.get("/sessions/:id", optionalAuth, ctrl.getSession);
router.post("/sessions/:id/message", optionalAuth, ctrl.sendMessage);
router.post("/sessions/:id/save", protect, ctrl.saveItinerary);

module.exports = router;
