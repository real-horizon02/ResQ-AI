import express from "express";
const router = express.Router();

import {
  getDisasters,
  getFires,
  geocodeCoordinates
} from "../controllers/disasterController.js";

/**
 * 🌍 Combined disasters (fires + earthquakes + cyclones + heatwaves)
 */
router.get("/disasters", getDisasters);

/**
 * 🔥 Fires endpoint (alias of /disasters)
 */
router.get("/disasters/fires", getFires);

/**
 * 📍 Reverse geocoding utility
 */
router.get("/geocode", geocodeCoordinates);

export default router;