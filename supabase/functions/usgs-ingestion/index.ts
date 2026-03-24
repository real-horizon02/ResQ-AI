/// <reference lib="deno.ns" />
import { createClient } from "@supabase/supabase-js"

const USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    ids: string;
    type: string;
    title: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const response = await fetch(USGS_URL)
    const data = await response.json()

    const events = data.features.map((feature: USGSFeature) => {
      const { mag, place, time, title } = feature.properties
      const [lng, lat] = feature.geometry.coordinates

      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
      if (mag >= 7.0) severity = 'critical'
      else if (mag >= 6.0) severity = 'high'
      else if (mag >= 4.5) severity = 'medium'

      return {
        source_id: feature.id,
        source_type: 'usgs',
        type: 'earthquake',
        severity,
        location_name: place,
        description: title || `Earthquake of magnitude ${mag} at ${place}`,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        status: 'active',
        created_at: new Date(time).toISOString()
      }
    })

    const { error } = await supabase
      .from('disaster_events')
      .upsert(events, { onConflict: 'source_id' })

    if (error) throw error

    return new Response(JSON.stringify({ message: `Ingested ${events.length} events` }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: unknown) {
    const error = err as Error
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
