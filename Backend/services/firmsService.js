import axios from "axios";
import { parseCSV } from "../utils/csvParser.js";
import dotenv from "dotenv";
import { isLocationInIndia } from "../utils/geoUtils.js";

const INDIA_AREA = "68,6,97,37";

dotenv.config();

const MAP_KEY = process.env.NASA_API_KEY;

// NASA FIRMS endpoint (CSV)
const FIRMS_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/VIIRS_SNPP_NRT/${INDIA_AREA}/1`;

export const getFireData = async () => {
  try {
    const response = await axios.get(FIRMS_URL);
    const csvData = response.data;

    const parsed = parseCSV(csvData);

    // Filter using centralised isLocationInIndia
    const filteredFires = parsed.filter((fire) => {
      if (!fire.latitude || !fire.longitude) return false;
      const latNum = Number(fire.latitude);
      const lngNum = Number(fire.longitude);
      return isLocationInIndia(latNum, lngNum);
    });

    console.log(`[FIRMS] Found ${filteredFires.length} India fires in the last 24 hours.`);

    return filteredFires.map((fire) => {
      let confNum = 50;
      if (fire.confidence) {
        const confStr = fire.confidence.toLowerCase().trim();
        if (confStr === 'h') confNum = 85;      // High -> 85 (High severity)
        else if (confStr === 'n') confNum = 60; // Nominal -> 60 (Medium severity)
        else if (confStr === 'l') confNum = 30; // Low -> 30 (Low severity)
        else {
          const parsedConf = Number(confStr);
          if (!isNaN(parsedConf)) confNum = parsedConf;
        }
      }

      const latNum = Number(fire.latitude);
      const lngNum = Number(fire.longitude);

      return {
        id: `${fire.latitude}-${fire.longitude}-${fire.acq_date}`,
        title: "Fire",
        type: "fire",
        lat: latNum,
        lng: lngNum,
        confidence: confNum,
        severity:
          confNum > 85 ? "critical" :
          confNum > 60 ? "high" :
          confNum > 35 ? "medium" :
          "low",
        status: "verified",
        location: "Fire Alert (Click to geocode)",
        state: "Active Fire Alert",
        description: `Fire detected with ${confNum}% confidence.`,
        reportedAt: fire.acq_date,
        peopleAffected: 0,
      };
    });
  } catch (err) {
    console.error("[FIRMS] Error fetching fire data:", err.message);
    return [];
  }
};