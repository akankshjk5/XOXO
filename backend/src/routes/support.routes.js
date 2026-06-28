const express = require("express");
const ctrl = require("../controllers/contact.controller");
const optionalAuth = require("../middleware/optionalAuth").optionalAuth;
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/tickets", optionalAuth, ctrl.createTicket);
router.get("/tickets", protect, adminOnly, ctrl.listTickets);

module.exports = router;
