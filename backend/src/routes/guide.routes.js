const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/guide.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", ctrl.getAll);
router.post("/", protect, ctrl.create);
router.put("/me", protect, ctrl.updateMine);
router.get("/:id", ctrl.getById);
router.post("/:id/book", protect, ctrl.book);

module.exports = router;
