import axios from "axios";
import { cities } from "./WeatherServices.js";
import { isLocationInIndia } from "../utils/geoUtils.js";
import { fetchWithRetry } from "../utils/apiRetry.js";
import { mockDisasterData } from "../data/mockDisasters.js";

// Cache in-memory to prevent rate-limiting and ensure fast response
let cachedRainData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const getRainfallData = async () => {
  const now = Date.now();
  if (cachedRainData && (now - lastFetchTime < CACHE_DURATION)) {
    console.log("[RAINFALL] Returning cached rainfall data.");
    return cachedRainData;
  }

  try {
    const apiKey = process.env.OPEN_WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn("[RAINFALL] No OpenWeather API Key found. Using mock rainfall data.");
      return mockDisasterData.rainfall;
    }

    console.log("[RAINFALL] Fetching real-time rainfall data for India...");

    // Fetch weather data for all cities in parallel
    const promises = cities.map(async (city) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url, { timeout: 6000 });
        const data = response.data;
        
        let rainIntensity = 0;
        if (data.rain) {
          if (data.rain["1h"] !== undefined) {
            rainIntensity = data.rain["1h"];
          } else if (data.rain["3h"] !== undefined) {
            rainIntensity = data.rain["3h"] / 3;
          }
        }

        // Severe rainfall parameter classification
        let severity = "clear";
        if (rainIntensity >= 15.0) {
          severity = "critical";
        } else if (rainIntensity >= 7.6) {
          severity = "high";
        } else if (rainIntensity >= 2.5) {
          severity = "medium";
        } else if (rainIntensity > 0.1) {
          severity = "low";
        }

        // Double check using geoUtils to ensure it's in India
        if (!isLocationInIndia(city.lat, city.lng)) {
          return null;
        }

        return {
          id: `rain-${city.name.toLowerCase()}-${Date.now()}`,
          title: severity === "clear" ? `Clear Weather — ${city.name}` : `Heavy Rainfall — ${city.name}`,
          type: "rainfall",
          lat: city.lat,
          lng: city.lng,
          intensity_mm: rainIntensity,
          severity,
          status: "verified",
          location: `${city.name}, India`,
          state: city.name,
          description: severity === "clear" ? `No significant rainfall in ${city.name}.` : `Active heavy rainfall detected in ${city.name}: ${rainIntensity.toFixed(1)} mm/hour.`,
          reportedAt: new Date().toISOString(),
          peopleAffected: Math.floor(rainIntensity * 120),
          source: "OpenWeatherMap"
        };
      } catch (err) {
        // Log individual city error, but don't fail the whole request
        console.error(`[RAINFALL] Error fetching for ${city.name}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const filtered = results.filter(Boolean);

    cachedRainData = filtered;
    lastFetchTime = now;

    console.log(`[RAINFALL] Successfully fetched rainfall data. Found ${filtered.length} active weather locations.`);
    return filtered.length > 0 ? filtered : mockDisasterData.rainfall;

  } catch (error) {
    console.warn(`[RAINFALL] API failed (${error.message}). Using cached or mock rainfall data.`);
    return cachedRainData || mockDisasterData.rainfall;
  }
};

// Kept for backward compatibility if called with specific lat/lon
export const getHeavyRainfallData = async (lat, lon) => {
  try {
    const apiKey = process.env.OPEN_WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return [];

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);
    const data = response.data;

    let rainIntensity = 0;
    if (data.rain) {
      if (data.rain["1h"] !== undefined) {
        rainIntensity = data.rain["1h"];
      } else if (data.rain["3h"] !== undefined) {
        rainIntensity = data.rain["3h"] / 3;
      }
    }

    if (rainIntensity < 0) return [];

    let severity = "low";
    if (rainIntensity >= 2.5 && rainIntensity < 7.6) severity = "medium";
    if (rainIntensity >= 15.0) severity = "critical";
    else if (rainIntensity >= 7.6) severity = "high";

    return [{
      type: "Heavy Rainfall",
      intensity_mm: rainIntensity,
      severity,
      time: new Date(),
      lat,
      lon,
    }];
  } catch (error) {
    console.error("Rainfall API Error for coords:", error.message);
    return [];
  }
};

// ─── All-cities rain status (for the Rain Alerts Map) ────────────────────────
// Returns EVERY city including clear-weather ones, so the frontend can
// display a full-country rain coverage map with colour-coded markers.
let cachedAllCities = null;
let lastAllFetchTime = 0;
const ALL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAllCitiesRainData = async () => {
  const now = Date.now();
  if (cachedAllCities && (now - lastAllFetchTime < ALL_CACHE_DURATION)) {
    console.log("[RAIN-ALERTS] Returning cached all-cities data.");
    return cachedAllCities;
  }

  try {
    const apiKey = process.env.OPEN_WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn("[RAIN-ALERTS] No OpenWeather API key found.");
      return [];
    }

    console.log(`[RAIN-ALERTS] Fetching weather for ${cities.length} Indian cities...`);

    const promises = cities.map(async (city) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url, { timeout: 5000 });
        const data = response.data;

        // Extract rain intensity
        let rainIntensity = 0;
        if (data.rain) {
          rainIntensity = data.rain["1h"] ?? (data.rain["3h"] ? data.rain["3h"] / 3 : 0);
        }

        // Classify severity
        let severity = "clear";
        if (rainIntensity >= 15.0)      severity = "critical";
        else if (rainIntensity >= 7.6)  severity = "high";
        else if (rainIntensity >= 2.5)  severity = "medium";
        else if (rainIntensity > 0.1)   severity = "low";

        const weather = data.weather?.[0] || {};
        const temp = data.main?.temp ?? null;
        const humidity = data.main?.humidity ?? null;
        const windSpeed = data.wind?.speed ?? null;
        const isRaining = rainIntensity > 0.1;

        return {
          name: city.name,
          lat: city.lat,
          lng: city.lng,
          rainIntensity: parseFloat(rainIntensity.toFixed(2)),
          severity,
          isRaining,
          weatherDescription: weather.description || "clear sky",
          weatherIcon: weather.icon || "01d",
          temp,
          humidity,
          windSpeed,
          updatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error(`[RAIN-ALERTS] Failed for ${city.name}:`, err.message);
        // Return a stub so the city still appears on the map
        return {
          name: city.name,
          lat: city.lat,
          lng: city.lng,
          rainIntensity: 0,
          severity: "unknown",
          isRaining: false,
          weatherDescription: "data unavailable",
          weatherIcon: "01d",
          temp: null,
          humidity: null,
          windSpeed: null,
          updatedAt: new Date().toISOString(),
        };
      }
    });

    const results = await Promise.all(promises);

    cachedAllCities = results;
    lastAllFetchTime = now;

    const rainingCount = results.filter(r => r.isRaining).length;
    console.log(`[RAIN-ALERTS] Done. ${rainingCount}/${results.length} cities currently experiencing rain.`);
    return results;

  } catch (error) {
    console.error("[RAIN-ALERTS] Fatal error:", error.message);
    return cachedAllCities || [];
  }
};