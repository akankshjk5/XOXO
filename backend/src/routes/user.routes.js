const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/wishlist", ctrl.getWishlist);
router.post("/wishlist/:packageId", ctrl.toggleWishlist);
router.put("/profile", ctrl.updateProfile);

module.exports = router;
