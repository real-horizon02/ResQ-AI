import type { GeoJSONPoint } from '../types'

/**
 * Parse a PostGIS WKT POINT string into lat/lng coordinates.
 * Handles formats: "POINT(lng lat)" and "SRID=4326;POINT(lng lat)"
 */
export function parseWKTPoint(wkt: string): { lat: number; lng: number } | null {
  if (!wkt) return null

  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/)
  if (!match) return null

  const lng = parseFloat(match[1])
  const lat = parseFloat(match[2])

  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

/**
 * Convert a GeoJSON Point to simple lat/lng object.
 */
export function geoJSONToLatLng(point: GeoJSONPoint | null): { lat: number; lng: number } | null {
  if (!point?.coordinates) return null
  const [lng, lat] = point.coordinates
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

/**
 * Format coordinates as a human-readable string.
 */
export function formatCoords(coords: { lat: number; lng: number } | null): string {
  if (!coords) return 'Unknown location'
  return `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`
}
