const express = require("express");
const ctrl = require("../controllers/admin.manage.controller");

const router = express.Router();

router.get("/", ctrl.getPublicSettings);

module.exports = router;
