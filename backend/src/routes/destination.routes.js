const express = require("express");
const ctrl = require("../controllers/destination.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/trending", ctrl.getTrending);
router.get("/adventure", ctrl.getAdventure);
router.get("/visa-free", ctrl.getVisaFree);
router.get("/search", ctrl.search);
router.get("/autocomplete", ctrl.autocomplete);
router.get("/slug/:slug", ctrl.getBySlug);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

router.post("/", protect, adminOnly, ctrl.create);
router.put("/:id", protect, adminOnly, ctrl.update);
router.delete("/:id", protect, adminOnly, ctrl.remove);

module.exports = router;
