import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

import { getRainfallData } from '../../../Backend/services/rainfallService.js';

async function verify() {
  console.log("Starting rainfall integration verification...");
  console.log("Using API Key from environment:", (process.env.OPEN_WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY) ? "Present" : "Missing");
  
  const data = await getRainfallData();
  console.log("\nResults count:", data.length);
  console.log("Results sample:", JSON.stringify(data, null, 2));

  // Check if any low severity results are returned
  const lowSeverities = data.filter(d => d.severity === 'low');
  console.log("Low severity count (should be 0):", lowSeverities.length);

  // Check if any results are outside India
  console.log("Checking if all results are inside India bounds...");
  const outsideIndia = data.filter(d => {
    const lat = d.lat;
    const lng = d.lng;
    // Basic bounds check
    return lat < 8.0 || lat > 37.6 || lng < 68.0 || lng > 97.5;
  });
  console.log("Outside India count (should be 0):", outsideIndia.length);
}

verify();
