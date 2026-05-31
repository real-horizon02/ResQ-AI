import { createClient } from '@supabase/supabase-js';
import { sendSOSStatusUpdate } from './notificationService.js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const acceptSOS = async (req, res) => {
  try {
    const { sosId, volunteerId } = req.body;

    // 1️⃣ Check already taken?
    const { data: sos } = await supabase
      .from('sos_request')
      .select('*')
      .eq('id', sosId)
      .single();

    if (sos.responder_id) {
      return res.status(400).json({ message: "Already assigned" });
    }

    // 2️⃣ Assign volunteer
    await supabase
      .from('sos_request')
      .update({
        responder_id: volunteerId,
        status: 'in_progress'
      })
      .eq('id', sosId);

    // 3️⃣ User ko notify karo
    // (Assuming tumhare paas user ka fcm token hai)
    await sendSOSStatusUpdate(sos.user_fcm_token, {
      id: sosId,
      status: 'in_progress'
    });

    return res.json({ message: "SOS accepted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { acceptSOS };