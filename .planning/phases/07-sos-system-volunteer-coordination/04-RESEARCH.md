# Phase 7 Research: SOS System + Volunteer Coordination

Implementing critical life-saving features for immediate distress signaling and community-led response.

## SOS System (Real-time Distress)

1. **One-Tap SOS**:
   - Floating action button (FAB) available on all screens.
   - Long-press to prevent accidental triggers.
   - Instantly captures GPS and device battery level.

2. **Broadcasting**:
   - Uses Supabase Realtime 'broadcast' for sub-second latency.
   - SOS alerts appear instantly on the Admin Dashboard with a loud sound.
   - Nearby volunteers (within 1-2km) get a high-priority push notification.

## Volunteer Coordination

1. **Volunteer Verification**:
   - Users can toggle 'I am a Volunteer' in their profile.
   - Fields: Skills (First Aid, Delivery, Rescue), Availability.

2. **Task Board**:
   - Admins can convert citizen reports into "Volunteer Tasks".
   - Tasks: `Requesting First Aid`, `Water Distribution`, `Road Clearance`.
   - Volunteers can "Accept" tasks, providing real-time status updates.

## Technical Requirements
- **Postgres Notify/Listen**: For high-concurrency SOS signals.
- **Supabase Realtime**: For active SOS location tracking.
- **Twilio SMS**: Backup for SOS when internet is unstable.
