// Shared type definitions for ResQ AI

// ─── Database Row Types ──────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  role: 'citizen' | 'admin' | 'volunteer' | 'authority'
  location: GeoJSONPoint | null
  notification_preferences: NotificationPreferences | null
  fcm_token: string | null
  is_volunteer: boolean
  skills: string[]
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  earthquake: boolean
  flood: boolean
  fire: boolean
  rainfall: boolean
  tsunami: boolean
  landslide: boolean
  wildfire: boolean
}

export interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

export interface DisasterEventRow {
  id: string
  source_id: string
  source_type: string
  type: DisasterType
  severity: SeverityLevel
  location_name: string
  description: string
  location: GeoJSONPoint
  status: 'active' | 'resolved'
  created_at: string
}

export interface CitizenReportRow {
  id: string
  user_id: string
  type: string
  description: string
  severity: string
  status: 'pending' | 'verified' | 'false_alarm'
  location: string // WKT POINT format
  location_name?: string
  media_urls?: string[]
  created_at: string
}

export interface SOSAlertRow {
  id: string
  user_id: string
  location: string // WKT POINT format
  status: 'active' | 'resolved'
  battery_level: number | null
  emergency_type?: string
  family_size?: number
  medical_info?: string
  created_at: string
}

export interface SafeZoneRow {
  id: string
  name: string
  type: 'hospital' | 'shelter' | 'rescue_station' | 'relief_camp'
  status: 'active' | 'full' | 'closed'
  capacity: number
  current_occupancy: number
  contact_info: string
  location: GeoJSONPoint
  created_at: string
}

export interface VolunteerTaskRow {
  id: string
  title: string
  description: string
  severity: string
  status: 'open' | 'claimed' | 'completed'
  assigned_to?: string
  location_name?: string
  created_at: string
}

// ─── Report Data (for creation) ──────────────────────────────────

export interface ReportData {
  user_id: string
  type: string
  description: string
  severity: string
  location: string // WKT POINT format
  status: 'pending'
}

// ─── Utility Types ───────────────────────────────────────────────

export type DisasterType = 'flood' | 'earthquake' | 'landslide' | 'rainfall' | 'tsunami' | 'wildfire'
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

// ─── Network Information API ─────────────────────────────────────

export interface NetworkInformation extends EventTarget {
  effectiveType: string
  saveData: boolean
  addEventListener(type: 'change', listener: () => void): void
  removeEventListener(type: 'change', listener: () => void): void
}

declare global {
  interface Navigator {
    connection?: NetworkInformation
    getBattery?: () => Promise<BatteryManager>
  }
  
  interface BatteryManager {
    level: number
    charging: boolean
  }
}
