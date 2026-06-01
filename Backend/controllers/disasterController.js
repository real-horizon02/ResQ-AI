// 🔥 FIRE DATA (NASA FIRMS)
import express from "express";
const app = express();
import { getFireData } from "../services/firmsService.js";
import { getUsgsData } from "../services/usgsService.js";
import {getGdacsData} from "../services/nasaCycloneService.js";
import { getHeatwaveData } from "../services/WeatherServices.js";
import { getRainfallData } from "../services/rainfallService.js";
import { getDetailedAddress } from "../utils/geocoder.js";


// GET /api/disasters (Aggregates fires, floods, earthquakes, cyclones)
export const getDisasters = async (req, res) => {
  try {
    console.log("[API] Starting disaster data aggregation...");

    const results = await Promise.allSettled([
      getFireData(),
      getUsgsData(),
      getGdacsData(),
      getHeatwaveData(),
      getRainfallData()
    ]);

    const fireData = results[0].status === 'fulfilled' ? results[0].value : [];
    const usgsData = results[1].status === 'fulfilled' ? results[1].value : [];
    const gdacsData = results[2].status === 'fulfilled' ? results[2].value : [];
    const heatwaveData = results[3].status === 'fulfilled' ? results[3].value : [];
    const rainfallData = results[4].status === 'fulfilled' ? results[4].value : [];

    // Log aggregation status
    const status = {
      fires: results[0].status === 'fulfilled' ? `${fireData.length} records` : 'Failed - using fallback',
      earthquakes: results[1].status === 'fulfilled' ? `${usgsData.length} records` : 'Failed - using fallback',
      cyclones: results[2].status === 'fulfilled' ? `${gdacsData.length} records` : 'Failed - using fallback',
      heatwaves: results[3].status === 'fulfilled' ? `${heatwaveData.length} records` : 'Failed - using fallback',
      rainfall: results[4].status === 'fulfilled' ? `${rainfallData.length} records` : 'Failed - using fallback',
    };

    console.log("[API] Aggregation status:", status);

    if (results[0].status === 'rejected') {
      console.error("[API] Fire data fetch failed:", results[0].reason?.message);
    }
    if (results[1].status === 'rejected') {
      console.error("[API] USGS data fetch failed:", results[1].reason?.message);
    }
    if (results[2].status === 'rejected') {
      console.error("[API] GDACS data fetch failed:", results[2].reason?.message);
    }
    if (results[3].status === 'rejected') {
      console.error("[API] Heatwave data fetch failed:", results[3].reason?.message);
    }
    if (results[4].status === 'rejected') {
      console.error("[API] Rainfall data fetch failed:", results[4].reason?.message);
    }

    const combined = [...fireData, ...gdacsData, ...usgsData, ...heatwaveData, ...rainfallData];
    const filtered = combined.filter(d => d && (d.severity === 'critical' || d.severity === 'high' || d.severity === 'medium' || (d.type === 'rainfall' && d.severity === 'low')));

    console.log(`[API] Total incidents after filtering: ${filtered.length}`);

    res.json(filtered);
  } catch (err) {
    console.error("[API] Combined disaster fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch disaster data", details: err.message });
  }
};

// GET /api/geocode?lat=X&lng=Y (On-demand reverse geocoding on backend)
export const geocodeCoordinates = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }
    const address = await getDetailedAddress(lat, lng);
    res.json({ address });
  } catch (err) {
    console.error("Geocoding failed:", err);
    res.status(500).json({ error: "Geocoding failed" });
  }
};

// Keep getFires alias for backward compatibility
export const getFires = getDisasters;

export default { getDisasters, getFires, geocodeCoordinates };