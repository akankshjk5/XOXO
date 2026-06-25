const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/post.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", ctrl.feed);
router.post("/", protect, ctrl.create);
router.post("/:id/like", protect, ctrl.toggleLike);
router.post("/:id/share", protect, ctrl.share);
router.get("/:id/comments", ctrl.getComments);
router.post("/:id/comments", protect, ctrl.addComment);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
