import whichCountry from 'which-country';

// India strict bounding box (INDIA_AREA = "68,6,97,37")

export const LAT_MIN = 8.0;
export const LAT_MAX = 37.6;
export const LNG_MIN = 68.0;
export const LNG_MAX = 97.5;

export function isPointInIndiaBoundingBox(lat, lng) {
  return lat >= LAT_MIN && lat <= LAT_MAX && lng >= LNG_MIN && lng <= LNG_MAX;
}

export function isLocationInIndia(lat, lng, placeName = '') {
  // Must be strictly within the Indian coordinate bounding box
  if (!isPointInIndiaBoundingBox(lat, lng)) {
    return false;
  }

  try {
    const code = whichCountry([lng, lat]);
    return code === 'IND';
  } catch (err) {
    // If it throws, fallback to bounding box check
    return true;
  }
}
