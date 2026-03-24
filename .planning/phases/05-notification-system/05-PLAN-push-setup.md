-----
plan: 05-push-setup
phase: 5
wave: 1
depends_on: [04-usgs-poller]
files_modified:
  - supabase/functions/notify-users/index.ts
  - src/hooks/useNotifications.ts
requirements_addressed:
  - NOTIFY-01
  - NOTIFY-02
autonomous: true
-----

# Plan 5.1: Push Notification Setup

Implement the infrastructure for automated, location-based notifications.

## Tasks
1. Create Edge Function `notify-users`.
2. Implement SQL trigger `on_new_disaster` to call this function.
3. Write PostGIS query to find users within affected radius.
4. Integrate with FCM or Web Push library to send notifications.
5. Add device token collection to the frontend `ProfileSetup` flow.
