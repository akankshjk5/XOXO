const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/group.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", ctrl.list);
router.get("/my", protect, ctrl.myGroups);
router.post("/", protect, ctrl.create);
router.get("/:id", ctrl.getById);
router.post("/:id/join", protect, ctrl.join);
router.post("/:id/leave", protect, ctrl.leave);
router.delete("/:id/members/:userId", protect, ctrl.removeMember);
router.get("/:id/messages", protect, ctrl.getMessages);
router.post("/:id/messages", protect, ctrl.sendMessage);

module.exports = router;
