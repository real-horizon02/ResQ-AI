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

// In-memory store for rescue applications
let rescueApplications = [];

router.post("/rescue-applications", (req, res) => {
  const { volunteerId, incidentId, details } = req.body;
  const newApp = {
    id: `app-${Date.now()}`,
    volunteerId,
    incidentId,
    details,
    status: 'pending', // pending, approved, rejected
    createdAt: new Date().toISOString()
  };
  rescueApplications.push(newApp);
  res.json({ success: true, application: newApp });
});

router.get("/rescue-applications", (req, res) => {
  res.json(rescueApplications);
});

router.patch("/rescue-applications/:id", (req, res) => {
  const { status } = req.body;
  const app = rescueApplications.find(a => a.id === req.params.id);
  if (app) {
    app.status = status;
    res.json({ success: true, application: app });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;