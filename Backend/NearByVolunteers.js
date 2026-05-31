import { supabase } from './config/db.js';

export const findNearbyVolunteers = async (latitude, longitude, radius = 5000) => {
  try {
    const { data, error } = await supabase.rpc('find_nearby_volunteers', {
      lat: latitude,
      lng: longitude,
      radius_meters: radius
    });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching nearby volunteers:", err);
    return [];
  }
};

