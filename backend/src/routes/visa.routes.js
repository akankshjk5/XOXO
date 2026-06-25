const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/visa.controller");

router.get("/", ctrl.list);
router.post("/inquiry", ctrl.inquiry);
router.get("/:country", ctrl.getInfo);

module.exports = router;
