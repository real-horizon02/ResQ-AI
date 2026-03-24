# Phase 5 Research: Notification System

To save lives, ResQ AI must push alerts to users as soon as a disaster is detected in their region.

## Delivery Channels

1. **Web Push (FCM / VAPID)**:
   - Primary for PWA users.
   - Low latency, high engagement.
   - Use Firebase Cloud Messaging (FCM) or standard Web Push API.

2. **SMS (Twilio / MessageBird)**:
   - Critical for users with poor internet connectivity.
   - High cost, need selective triggers (Magnitude 6+ or high risk).

3. **In-App Alerts**:
   - Real-time popups/banners using Supabase Realtime broadcast.

## Triggering Engine

When a new row is inserted into `disaster_events`:
1. **Database Trigger**: Calls a Supabase Edge Function `notify-users`.
2. **Edge Function**:
   - Fetches users within a specific radius of the disaster (using PostGIS `ST_DWithin`).
   - Fetches user notification preferences.
   - Dispatches messages via configured providers.

## Tech Requirements
- **PostGIS**: `ST_DWithin(user_location, disaster_location, radius_meters)`.
- **FCM Server Key**: Needed for Web Push.
- **Service Role Key**: For administrative database access.

## Notification Hierarchy
- **Critical (Red)**: All channels (Push + SMS + In-App).
- **High (Orange)**: Push + In-App.
- **Moderate (Yellow)**: In-App only.
