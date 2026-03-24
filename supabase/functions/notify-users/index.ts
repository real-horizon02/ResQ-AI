/// <reference lib="deno.ns" />
import { createClient } from "@supabase/supabase-js"

Deno.serve(async (req: Request) => {
  try {
    const { record } = await req.json()
    const { id, type, severity, location, location_name } = record

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Find users within radius (defualt 100km for critical, 50km for high)
    const radius = severity === 'critical' ? 100000 : 50000
    
    const { data: users, error: userError } = await supabase.rpc('get_users_in_radius', {
      disaster_lng: location.coordinates[0],
      disaster_lat: location.coordinates[1],
      radius_meters: radius
    })

    if (userError) throw userError

    // 2. Dispatch notifications (Mocking for now, will integrate FCM/WebPush in next step)
    console.log(`Alerting ${users?.length || 0} users for ${type} in ${location_name}`)
    
    // TODO: loop through users and send FCM tokens
    // users.forEach(u => sendPush(u.fcm_token, ...))

    return new Response(JSON.stringify({ 
      message: `Notification process started for ${users?.length || 0} users`,
      disaster_id: id 
    }), {
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
