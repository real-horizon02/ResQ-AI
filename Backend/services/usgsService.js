import axios from "axios";
import { isLocationInIndia } from "../utils/geoUtils.js";
import { fetchWithRetry } from "../utils/apiRetry.js";
import { mockDisasterData } from "../data/mockDisasters.js";

const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=6&maxlatitude=37&minlongitude=68&maxlongitude=97&orderby=time&limit=100";

export const getUsgsData = async () => {
  try {
    const response = await fetchWithRetry(USGS_URL, {
      maxRetries: 2,
      baseDelay: 500,
    });

    const mapped = response.data.features.map(eq => {
      const [lng, lat] = eq.geometry.coordinates;

      if (!lat || !lng) return null;
      if (!isLocationInIndia(lat, lng)) return null;

      return {
        id: eq.id,
        title: "Earthquake",
        type: "earthquake",
        lat,
        lng,
        magnitude: eq.properties.mag,
        severity:
          eq.properties.mag > 6 ? "high" :
          eq.properties.mag > 4 ? "medium" :
          "low",
        description: eq.properties.place,
        reportedAt: eq.properties.time,
        peopleAffected: Math.floor(eq.properties.mag * 250),
      };
    }).filter(Boolean);

    if (mapped.length > 0) {
      console.log(`[USGS] Found ${mapped.length} earthquakes in India.`);
    } else {
      console.log(`[USGS] No recent earthquakes detected. Using mock earthquake data.`);
      return mockDisasterData.earthquakes;
    }

    return mapped;

  } catch (err) {
    console.warn(`[USGS] API failed (${err.message}). Using mock earthquake data.`);
    return mockDisasterData.earthquakes;
  }
};