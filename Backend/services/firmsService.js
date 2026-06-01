import axios from "axios";
import { parseCSV } from "../utils/csvParser.js";
import dotenv from "dotenv";
import { isLocationInIndia } from "../utils/geoUtils.js";
import { fetchWithRetry } from "../utils/apiRetry.js";
import { mockDisasterData } from "../data/mockDisasters.js";

const INDIA_AREA = "68,6,97,37";

dotenv.config();

const MAP_KEY = process.env.NASA_API_KEY;

// NASA FIRMS endpoint (CSV)
const FIRMS_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/VIIRS_SNPP_NRT/${INDIA_AREA}/1`;

export const getFireData = async () => {
  try {
    const response = await fetchWithRetry(FIRMS_URL, {
      maxRetries: 2,
      baseDelay: 500,
    });

    const csvData = response.data;
    const parsed = parseCSV(csvData);

    // Filter using centralised isLocationInIndia
    const filteredFires = parsed.filter((fire) => {
      if (!fire.latitude || !fire.longitude) return false;
      const latNum = Number(fire.latitude);
      const lngNum = Number(fire.longitude);
      return isLocationInIndia(latNum, lngNum);
    });

    const mapped = filteredFires.map((fire) => {
      let confNum = 50;
      if (fire.confidence) {
        const confStr = fire.confidence.toLowerCase().trim();
        if (confStr === 'h') confNum = 85;
        else if (confStr === 'n') confNum = 60;
        else if (confStr === 'l') confNum = 30;
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

    if (mapped.length > 0) {
      console.log(`[FIRMS] Found ${mapped.length} India fires in the last 24 hours.`);
    } else {
      console.log(`[FIRMS] No fires detected in India currently. Using mock data for display.`);
      return mockDisasterData.fires;
    }

    return mapped;
  } catch (err) {
    console.warn(`[FIRMS] API failed (${err.message}). Using mock fire data.`);
    return mockDisasterData.fires;
  }
};