# Phase 6 Research: Citizen Reporting + Admin Dashboard

Empowering citizens to report ground-truth data and providing admins with a real-time command center.

## Citizen Reporting Strategy

1. **Lightweight Form**:
   - Designed for low-bandwidth environments.
   - Core fields: Type (Flood, Fire, etc.), Description, Severity.
   - Automatic Geolocation (GPS).

2. **Image Uploads (Supabase Storage)**:
   - Client-side compression before upload.
   - Progressive loading in the dashboard.
   - Storage bucket: `report-images` with RLS.

## Admin Dashboard (Command Center)

1. **Real-time Feed**:
   - List view of all incoming citizen reports and automated disaster events.
   - Real-time updates via Supabase broadcast.

2. **Verification Workflow**:
   - Statuses: `pending`, `verified`, `resolved`, `false_alarm`.
   - Verified reports automatically appear on the public map.

3. **SOS Monitor**:
   - High-priority section for critical SOS alerts from users.

## Database Additions
- `citizen_reports` table:
  - `user_id`, `type`, `description`, `severity`, `image_url`, `location` (PostGIS), `status`.
- Storage policies for images.
