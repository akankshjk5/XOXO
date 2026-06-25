const express = require("express");
const ctrl = require("../controllers/ai.controller");

const router = express.Router();

router.post("/itinerary", ctrl.generateItinerary);
router.post("/chat", ctrl.chatExpert);
router.post("/chat-expert", ctrl.chatExpert); // alias used by frontend spec
router.post("/destination-tips", ctrl.destinationTips);

module.exports = router;
