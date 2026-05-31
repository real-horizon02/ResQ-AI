import express from "express";
import { getHeavyRainfallData, getRainfallData, getAllCitiesRainData } from "../services/rainfallService.js";

const router = express.Router();

router.get("/rainfall", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    let data;
    if (lat && lon) {
      data = await getHeavyRainfallData(Number(lat), Number(lon));
    } else {
      data = await getRainfallData();
    }

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * 🌧️ Rain Alerts Map — returns ALL 50 Indian cities with real-time rain status
 * Used by the frontend Map to render city-level rain markers
 */
router.get("/rain-alerts", async (req, res) => {
  try {
    const data = await getAllCitiesRainData();
    const rainingCities = data.filter(c => c.isRaining);
    res.json({
      success: true,
      totalCities: data.length,
      rainingCount: rainingCities.length,
      updatedAt: new Date().toISOString(),
      cities: data,
    });
  } catch (error) {
    console.error("[RAIN-ALERTS ROUTE] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;