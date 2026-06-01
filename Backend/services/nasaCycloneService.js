import axios from "axios";
import { isLocationInIndia } from "../utils/geoUtils.js";
import { fetchWithRetry } from "../utils/apiRetry.js";
import { mockDisasterData } from "../data/mockDisasters.js";

// 🌍 NASA EONET API (all disasters)
const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?limit=500";

export const getGdacsData = async () => {
  try {
    const response = await fetchWithRetry(EONET_URL, {
      maxRetries: 2,
      baseDelay: 1000,
    });

    const events = response.data.events;

    const disasters = [];

    events.forEach(event => {
      const category = event.categories[0]?.id || "other";

      event.geometry.forEach(geo => {
        const coords = geo.coordinates;

        // ⚠️ Some events polygon hote hain → skip kar rahe
        if (!Array.isArray(coords) || coords.length < 2) return;

        const [lng, lat] = coords;

        // ❌ Invalid coords
        if (!lat || !lng) return;

        // 🇮🇳 India filter
        if (!isLocationInIndia(lat, lng)) return;

        // 🎯 Map category → type
        let type = "disaster";

        if (category === "floods") type = "flood";
        else if (category === "severeStorms") type = "cyclone";
        else if (category === "landslides") type = "landslide";
        else if (category === "wildfires") type = "fire";

        disasters.push({
          id: `${event.id}-${geo.date}`,
          title: event.title,
          type,
          lat,
          lng,
          severity: "medium", // NASA me direct severity nahi hoti
          description: event.description || event.title,
          reportedAt: geo.date,
          peopleAffected: Math.floor(Math.random() * 3000) + 150,
          source: "NASA EONET"
        });
      });
    });

    console.log(`[EONET] India disasters found: ${disasters.length}`);

    if (disasters.length === 0) {
      console.log(`[EONET] No disasters found. Using mock cyclone data.`);
      return mockDisasterData.cyclones;
    }

    return disasters;

  } catch (err) {
    console.warn(`[EONET] API failed (${err.message}). Using mock cyclone data.`);
    return mockDisasterData.cyclones;
  }
};