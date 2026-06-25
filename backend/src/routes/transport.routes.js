const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transport.controller");

router.get("/status", ctrl.status);
router.get("/modes", ctrl.modes);
router.get("/search", ctrl.search);
router.get("/recommendations", ctrl.recommendations);

module.exports = router;
