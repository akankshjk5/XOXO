const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/match.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/profile", ctrl.getMyProfile);
router.put("/profile", ctrl.upsertProfile);
router.get("/discover", ctrl.discover);
router.get("/requests", ctrl.getRequests);
router.post("/request", ctrl.sendRequest);
router.put("/requests/:id/respond", ctrl.respond);
router.delete("/requests/:id", ctrl.cancel);

module.exports = router;
