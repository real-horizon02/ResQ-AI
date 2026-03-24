-----
plan: 06-citizen-reporting
phase: 6
wave: 1
depends_on: [02-auth-pages]
files_modified:
  - src/components/reports/ReportForm.tsx
  - src/pages/Report.tsx
requirements_addressed:
  - REPORT-01
  - REPORT-02
autonomous: true
-----

# Plan 6.1: Citizen Reporting Form

Implement a user-friendly form for citizens to report local emergencies.

## Tasks
1. Create `citizen_reports` table in Supabase.
2. Setup Supabase Storage bucket `report-images`.
3. Build `ReportForm` component with type selection and image upload.
4. Integrate GPS location capture.
5. Implement client-side image compression.
