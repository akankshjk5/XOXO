const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/inventory.controller");

router.get("/status", ctrl.status);
router.get("/flights", ctrl.searchFlights);
router.get("/hotels", ctrl.searchHotels);
router.get("/activities", ctrl.searchActivities);
router.get("/places/autocomplete", ctrl.placesAutocomplete);
router.get("/places/geocode", ctrl.geocode);
router.get("/places/details", ctrl.placeDetails);
router.get("/visa", ctrl.listVisa);
router.get("/visa/:country", ctrl.getVisa);
router.post("/visa/inquiry", ctrl.visaInquiry);

module.exports = router;
