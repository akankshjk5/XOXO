const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", ctrl.getMy);
router.put("/read-all", ctrl.markAllRead);
router.delete("/", ctrl.clearAll);
router.put("/:id/read", ctrl.markRead);
router.delete("/:id", ctrl.deleteOne);

module.exports = router;
