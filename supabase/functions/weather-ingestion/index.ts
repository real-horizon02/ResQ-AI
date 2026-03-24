/// <reference lib="deno.ns" />
import { createClient } from "@supabase/supabase-js"

interface Region {
  name: string;
  lat: number;
  lon: number;
}

interface OWMAlert {
  event: string;
  start: number;
  description: string;
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const OWM_API_KEY = Deno.env.get('OWM_API_KEY')
    if (!OWM_API_KEY) throw new Error("OWM_API_KEY secret missing")

    const regions: Region[] = [
      { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639 }
    ]

    const allEvents = []

    for (const region of regions) {
      const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${region.lat}&lon=${region.lon}&exclude=current,minutely,hourly,daily&appid=${OWM_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.alerts) {
        for (const alert of data.alerts as OWMAlert[]) {
          allEvents.push({
            source_id: `${alert.event}_${region.name}_${alert.start}`,
            source_type: 'owm',
            type: alert.event.toLowerCase().includes('flood') ? 'flood' : 'rainfall',
            severity: 'medium',
            location_name: region.name,
            description: alert.description,
            location: {
              type: 'Point',
              coordinates: [region.lon, region.lat]
            },
            status: 'active',
            created_at: new Date().toISOString()
          })
        }
      }
    }

    if (allEvents.length > 0) {
      const { error } = await supabase
        .from('disaster_events')
        .upsert(allEvents, { onConflict: 'source_id' })
      if (error) throw error
    }

    return new Response(JSON.stringify({ message: `Ingested ${allEvents.length} weather events` }), {
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
