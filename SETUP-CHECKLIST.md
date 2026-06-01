# Profile Picture Upload - Setup Checklist

## ✅ Code Changes (Already Done)
- [x] Enhanced upload handler with validation
- [x] Added file size check (max 2MB)
- [x] Added file type validation
- [x] Improved error messages
- [x] Better error logging

## 📋 Supabase Setup (You Need to Do This)

### Option A: Dashboard Setup (Recommended for beginners)

- [ ] Log in to https://app.supabase.com
- [ ] Select your ResQ AI project
- [ ] Go to **Storage** section
- [ ] Click **Create a new bucket**
- [ ] Fill in:
  - Name: `avatars`
  - Public bucket: **Toggle ON**
  - File size limit: `2` MB
- [ ] Click **Create bucket**
- [ ] Click on the `avatars` bucket
- [ ] Go to **Policies** tab
- [ ] Add Policy 1: `avatars_authenticated_upload`
  - [ ] Target roles: `authenticated`
  - [ ] Allowed operations: `INSERT`
  - [ ] Expression: `bucket_id = 'avatars'`
- [ ] Add Policy 2: `avatars_public_read`
  - [ ] Target roles: `anon, authenticated`
  - [ ] Allowed operations: `SELECT`
  - [ ] Expression: `bucket_id = 'avatars'`
- [ ] Add Policy 3: `avatars_authenticated_update`
  - [ ] Target roles: `authenticated`
  - [ ] Allowed operations: `UPDATE`
  - [ ] Expression: `bucket_id = 'avatars'`
- [ ] Add Policy 4: `avatars_authenticated_delete`
  - [ ] Target roles: `authenticated`
  - [ ] Allowed operations: `DELETE`
  - [ ] Expression: `bucket_id = 'avatars'`

### Option B: SQL Setup (For advanced users)

- [ ] Go to Supabase SQL Editor
- [ ] Copy the SQL from `.planning/phases/01-foundation-supabase-infrastructure-setup/create-avatars-bucket.sql`
- [ ] Paste and run
- [ ] Verify no errors

## 🧪 Testing

- [ ] Start your development server (`npm run dev`)
- [ ] Log in as a volunteer
- [ ] Go to Volunteer Dashboard
- [ ] Click the camera icon on your profile avatar
- [ ] Select a test image (JPG, PNG, WebP, or GIF)
- [ ] Verify image uploads successfully
- [ ] Verify image displays in the avatar circle
- [ ] Refresh page and verify image persists

## 🐛 Troubleshooting

If upload still fails:

- [ ] Check browser console (F12) for error messages
- [ ] Verify `avatars` bucket exists in Supabase Storage
- [ ] Verify bucket is set to **Public**
- [ ] Verify all 4 policies are created
- [ ] Check that you're logged in as authenticated user
- [ ] Try with a smaller image file
- [ ] Clear browser cache and try again

## 📚 Documentation

- Read: `PROFILE-PICTURE-FIX.md` - Overview of changes
- Read: `.planning/AVATAR-SETUP.md` - Detailed setup guide
- Reference: `.planning/phases/01-foundation-supabase-infrastructure-setup/create-avatars-bucket.sql` - SQL setup

## ✨ Success Indicators

You'll know it's working when:
- ✅ Camera icon is clickable
- ✅ File picker opens when clicked
- ✅ Image uploads without errors
- ✅ Avatar displays in the profile circle
- ✅ Avatar persists after page refresh
- ✅ Success message shows: "✅ Photo updated!"
