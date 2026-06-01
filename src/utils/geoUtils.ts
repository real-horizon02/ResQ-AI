/**
 * Geographical utility functions for India disaster response system
 */

/**
 * Check if a location is within India's boundaries
 * Uses simplified bounding box check for India
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns true if location is within India
 */
export function isLocationInIndia(latitude: number, longitude: number): boolean {
  // India approximate boundaries (simplified)
  // North: ~35.5° N, South: ~8° N, East: ~97.4° E, West: ~68.7° W
  const INDIA_BOUNDS = {
    north: 35.5,
    south: 8.0,
    east: 97.4,
    west: 68.7,
  };

  return (
    latitude >= INDIA_BOUNDS.south &&
    latitude <= INDIA_BOUNDS.north &&
    longitude >= INDIA_BOUNDS.west &&
    longitude <= INDIA_BOUNDS.east
  );
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Get state from coordinates (approximate)
 * Returns nearest state based on common coordinates
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns State name or 'Unknown'
 */
export function getStateFromCoordinates(latitude: number, longitude: number): string {
  // Approximate state centers (can be expanded)
  const stateCenters: Record<string, [number, number]> = {
    'Andhra Pradesh': [15.8, 78.0],
    'Arunachal Pradesh': [28.5, 93.5],
    'Assam': [26.0, 92.0],
    'Bihar': [25.5, 85.5],
    'Chhattisgarh': [21.5, 81.5],
    'Goa': [15.3, 73.8],
    'Gujarat': [22.0, 72.0],
    'Haryana': [29.0, 77.0],
    'Himachal Pradesh': [31.5, 77.0],
    'Jharkhand': [23.5, 85.0],
    'Karnataka': [15.0, 76.0],
    'Kerala': [10.5, 76.5],
    'Madhya Pradesh': [22.5, 78.5],
    'Maharashtra': [19.5, 75.5],
    'Manipur': [24.5, 94.5],
    'Meghalaya': [25.5, 92.0],
    'Mizoram': [23.5, 92.5],
    'Nagaland': [26.0, 94.5],
    'Odisha': [19.5, 85.0],
    'Punjab': [30.5, 75.0],
    'Rajasthan': [27.0, 75.0],
    'Sikkim': [27.5, 88.5],
    'Tamil Nadu': [11.0, 78.5],
    'Telangana': [17.0, 78.5],
    'Tripura': [23.5, 91.5],
    'Uttar Pradesh': [27.0, 79.0],
    'Uttarakhand': [30.0, 79.0],
    'West Bengal': [24.5, 87.5],
  };

  let closestState = 'Unknown';
  let closestDistance = Infinity;

  for (const [state, [stateLat, stateLon]] of Object.entries(stateCenters)) {
    const distance = calculateDistance(latitude, longitude, stateLat, stateLon);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestState = state;
    }
  }

  return closestState;
}

/**
 * Validate coordinates are within valid ranges
 * @param latitude - Latitude (-90 to 90)
 * @param longitude - Longitude (-180 to 180)
 * @returns true if valid
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
