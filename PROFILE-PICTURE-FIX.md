# Profile Picture Upload Fix

## What Was Wrong

The profile picture upload feature was failing because:
1. **Missing Storage Bucket**: The `avatars` Supabase storage bucket didn't exist
2. **Poor Error Handling**: The upload handler didn't provide clear error messages
3. **No Validation**: File size and type weren't validated before upload

## What Was Fixed

### 1. Enhanced Upload Handler (`src/pages/Volunteer.tsx`)
- ✅ Added file size validation (max 2MB)
- ✅ Added file type validation (JPG, PNG, WebP, GIF only)
- ✅ Improved error messages with specific feedback
- ✅ Added timestamp to file paths to prevent conflicts
- ✅ Better error logging for debugging
- ✅ Proper error handling with try-catch

### 2. Storage Bucket Setup Guide
- Created `.planning/AVATAR-SETUP.md` with step-by-step instructions
- Includes both dashboard and SQL setup methods
- Documents all required storage policies

### 3. SQL Migration File
- Created `.planning/phases/01-foundation-supabase-infrastructure-setup/create-avatars-bucket.sql`
- Contains complete bucket and policy setup

## How to Fix It

### Quick Setup (Dashboard)

1. Go to https://app.supabase.com → Your Project → Storage
2. Click **Create a new bucket**
3. Name: `avatars`, Public: ON, Size limit: 2MB
4. Add these policies:
   - `avatars_authenticated_upload` (INSERT for authenticated)
   - `avatars_public_read` (SELECT for anon, authenticated)
   - `avatars_authenticated_update` (UPDATE for authenticated)
   - `avatars_authenticated_delete` (DELETE for authenticated)

### SQL Setup

Run this in Supabase SQL editor:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars');
```

## Testing

After setup:
1. Go to Volunteer Dashboard
2. Click the camera icon on your profile avatar
3. Select an image (JPG, PNG, WebP, or GIF, max 2MB)
4. Image should upload and display immediately

## Error Messages

The improved handler now shows:
- ❌ File too large. Max 2MB.
- ❌ Only JPG, PNG, WebP, GIF allowed.
- ❌ Upload failed. Check Supabase storage bucket permissions.
- ✅ Photo updated! (on success)

## Files Modified

- `src/pages/Volunteer.tsx` - Enhanced upload handler with validation
- `.planning/AVATAR-SETUP.md` - Setup guide (new)
- `.planning/phases/01-foundation-supabase-infrastructure-setup/create-avatars-bucket.sql` - SQL migration (new)
