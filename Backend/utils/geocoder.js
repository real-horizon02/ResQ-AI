import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE = path.join(__dirname, '../data/geocode_cache.json');

// Ensure data folder exists
const dataDir = path.dirname(CACHE_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Persistent disk cache
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (err) {
    console.error('[GEOCODE] Error reading geocode cache:', err.message);
  }
}

function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error('[GEOCODE] Error writing geocode cache:', err.message);
  }
}

// ── In-flight deduplication map ──────────────────────────────────────────────
// Maps cache key → Promise<string> so that N simultaneous requests for the
// same coordinate share ONE pending HTTP call instead of making N calls.
const inFlight = new Map();

// ── Strict 1 req/sec rate-limiter ────────────────────────────────────────────
let lastRequestTime = 0;
async function rateLimitedFetch(url) {
  const now = Date.now();
  const wait = Math.max(0, 1100 - (now - lastRequestTime)); // 1.1s gap to be safe
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestTime = Date.now();
  return axios.get(url, {
    headers: { 'User-Agent': 'ResQ-AI-Disaster-App', 'Accept-Language': 'en' },
    timeout: 6000,
  });
}

export const getDetailedAddress = async (lat, lng) => {
  // Key rounded to 3 decimal places (~100m precision)
  const key = `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}`;

  // 1. Disk cache hit
  if (cache[key]) return cache[key];

  // 2. In-flight deduplication — return the same promise if already fetching
  if (inFlight.has(key)) return inFlight.get(key);

  // 3. Start a new fetch and register it in the in-flight map
  const promise = (async () => {
    try {
      console.log(`[GEOCODE] Fetching address for ${key}...`);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`;
      const res = await rateLimitedFetch(url);

      if (res.data && res.data.display_name) {
        const address = res.data.display_name;
        cache[key] = address;
        saveCache();
        return address;
      }
    } catch (err) {
      console.error(`[GEOCODE] Error geocoding ${key}:`, err.message);
    } finally {
      inFlight.delete(key); // Always clean up the in-flight entry
    }
    return `Coords: ${Number(lat).toFixed(3)}, ${Number(lng).toFixed(3)}`;
  })();

  inFlight.set(key, promise);
  return promise;
};
