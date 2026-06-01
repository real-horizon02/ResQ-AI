# Avatar Storage Setup Guide

## Problem
The profile picture upload feature was failing because the `avatars` storage bucket didn't exist in Supabase.

## Solution

### Step 1: Create the Avatars Bucket via Supabase Dashboard

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure:
   - **Name**: `avatars`
   - **Public bucket**: Toggle ON (to allow public read access)
   - **File size limit**: 2 MB
5. Click **Create bucket**

### Step 2: Set Up Storage Policies

After creating the bucket, set up the following policies:

1. Click on the `avatars` bucket
2. Go to the **Policies** tab
3. Click **New Policy** and add these policies:

#### Policy 1: Allow authenticated users to upload
- **Policy name**: `avatars_authenticated_upload`
- **Target roles**: `authenticated`
- **Allowed operations**: `INSERT`
- **Policy expression**: `bucket_id = 'avatars'`

#### Policy 2: Allow public read access
- **Policy name**: `avatars_public_read`
- **Target roles**: `anon, authenticated`
- **Allowed operations**: `SELECT`
- **Policy expression**: `bucket_id = 'avatars'`

#### Policy 3: Allow authenticated users to update
- **Policy name**: `avatars_authenticated_update`
- **Target roles**: `authenticated`
- **Allowed operations**: `UPDATE`
- **Policy expression**: `bucket_id = 'avatars'`

#### Policy 4: Allow authenticated users to delete
- **Policy name**: `avatars_authenticated_delete`
- **Target roles**: `authenticated`
- **Allowed operations**: `DELETE`
- **Policy expression**: `bucket_id = 'avatars'`

### Step 3: Verify Setup

Test the upload by:
1. Navigate to the Volunteer Dashboard
2. Click the camera icon on the profile avatar
3. Select a JPG, PNG, WebP, or GIF image (max 2MB)
4. The image should upload successfully

## Troubleshooting

### "Upload failed" error
- Check that the `avatars` bucket exists and is public
- Verify storage policies are correctly configured
- Check browser console for detailed error messages
- Ensure you're logged in as an authenticated user

### Image not displaying after upload
- Verify the bucket is set to public
- Check that the public read policy is enabled
- Clear browser cache and reload

### File size errors
- Maximum file size is 2MB
- Compress images before uploading if needed

## Technical Details

- **Bucket**: `avatars`
- **File path format**: `avatars/{user-id}-{timestamp}.{extension}`
- **Allowed types**: JPG, PNG, WebP, GIF
- **Max size**: 2MB
- **Public access**: Yes (read-only for anonymous users)

## SQL Alternative

If you prefer to set up via SQL, run this in the Supabase SQL editor:

```sql
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "avatars_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');
```
