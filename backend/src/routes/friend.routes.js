const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/friend.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/status", ctrl.getStatuses);
router.get("/status/:userId", ctrl.getStatus);
router.get("/", ctrl.listFriends);
router.get("/requests", ctrl.listRequests);
router.post("/request", ctrl.sendRequest);
router.put("/:id/respond", ctrl.respond);
router.delete("/:id", ctrl.remove);

module.exports = router;
