import { findNearbyVolunteers } from './NearByVolunteers.js';
import { sendSOSAlertToVolunteers } from './notificationService.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const approveSOS = async (req, res) => {
  try {
    const { sosId } = req.body;

    // 1️⃣ SOS fetch karo
    const { data: sos, error } = await supabase
      .from('sos_request')
      .select('*')
      .eq('id', sosId)
      .single();

    if (error || !sos) {
      return res.status(404).json({ message: "SOS not found" });
    }

    // 2️⃣ Status update karo
    await supabase
      .from('sos_request')
      .update({ status: 'approved' })
      .eq('id', sosId);

    // 3️⃣ Location extract karo
    const { latitude, longitude } = sos.location; // assuming JSON {lat, lng}

    // 4️⃣ Nearby volunteers find karo
    const nearbyVolunteers = await findNearbyVolunteers(latitude, longitude);

    // 5️⃣ Volunteers ke tokens fetch karo (IMPORTANT 🔥)
    const volunteerIds = nearbyVolunteers.map(v => v.id);

    const { data: volunteersWithTokens } = await supabase
      .from('volunteers')
      .select('id, fcm_tokens')
      .in('id', volunteerIds);

    // Merge distance + tokens
    const finalVolunteers = volunteersWithTokens.map(v => {
      const match = nearbyVolunteers.find(nv => nv.id === v.id);
      return {
        id: v.id,
        fcmTokens: v.fcm_tokens || [],
        distance: match?.distance / 1000 // meters → km
      };
    });

    // 6️⃣ Send notification
    await sendSOSAlertToVolunteers(sos, finalVolunteers);

    return res.json({ message: "SOS approved & notifications sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export default { approveSOS };