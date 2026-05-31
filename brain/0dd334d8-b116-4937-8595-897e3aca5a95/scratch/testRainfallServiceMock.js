import { cities } from '../../../Backend/services/WeatherServices.js';
import { isLocationInIndia } from '../../../Backend/utils/geoUtils.js';

// Let's test the logic we implemented in rainfallService.js:
// Severe rainfall parameter classification
// Low: < 2.5 mm/h (not included)
// Medium: 2.5 - 7.5 mm/h
// High: 7.6 - 15.0 mm/h
// Critical: >= 15.0 mm/h

const mockRainValues = [
  { name: "Delhi", rain1h: 1.2 },       // Should be low -> Excluded
  { name: "Mumbai", rain1h: 4.5 },      // Should be medium -> Included
  { name: "Kolkata", rain1h: 12.0 },    // Should be high -> Included
  { name: "Guwahati", rain1h: 25.0 },   // Should be critical -> Included
  { name: "Chennai", rain1h: 0 },       // Should be low -> Excluded
  { name: "Bhopal", rain3h: 9.0 },      // 3h is 9.0 -> 1h = 3.0 -> medium -> Included
  { name: "OutsideIndia", rain1h: 20.0, lat: 45.0, lng: -73.0 } // Critical rain but outside India -> Excluded
];

function processMockData() {
  console.log("Starting mock data processing test...");
  
  const results = mockRainValues.map(mockCity => {
    // Find city coordinates
    let lat = mockCity.lat;
    let lng = mockCity.lng;
    
    if (lat === undefined || lng === undefined) {
      const cityData = cities.find(c => c.name === mockCity.name);
      if (!cityData) return null;
      lat = cityData.lat;
      lng = cityData.lng;
    }

    let rainIntensity = 0;
    if (mockCity.rain1h !== undefined) {
      rainIntensity = mockCity.rain1h;
    } else if (mockCity.rain3h !== undefined) {
      rainIntensity = mockCity.rain3h / 3;
    }

    // Severity logic
    let severity = "low";
    if (rainIntensity >= 15.0) {
      severity = "critical";
    } else if (rainIntensity >= 7.6) {
      severity = "high";
    } else if (rainIntensity >= 2.5) {
      severity = "medium";
    }

    if (severity === "low") {
      console.log(`[EXCLUDED] ${mockCity.name}: Intensity ${rainIntensity} mm/h (Severity: low)`);
      return null;
    }

    // Location check
    if (!isLocationInIndia(lat, lng)) {
      console.log(`[EXCLUDED] ${mockCity.name}: Intensity ${rainIntensity} mm/h is outside India boundaries (lat: ${lat}, lng: ${lng})`);
      return null;
    }

    console.log(`[INCLUDED] ${mockCity.name}: Intensity ${rainIntensity} mm/h mapped to severity: ${severity}`);
    return {
      title: `Heavy Rainfall — ${mockCity.name}`,
      type: "rainfall",
      lat,
      lng,
      intensity_mm: rainIntensity,
      severity,
      location: `${mockCity.name}, India`,
    };
  }).filter(Boolean);

  console.log("\nTotal included disasters:", results.length);
  console.log("Results details:", JSON.stringify(results, null, 2));
}

processMockData();
