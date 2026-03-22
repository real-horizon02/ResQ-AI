# Auth Configuration (Manual Steps Required)

After Supabase project is created, configure in Supabase Dashboard:

## Phone OTP (Twilio)
Dashboard → Authentication → Providers → Phone
- Enable: Yes
- SMS Provider: Twilio
- Account SID: [ADD FROM TWILIO]
- Auth Token: [ADD FROM TWILIO]
- Message Service SID or From: [ADD FROM TWILIO]

## Email Magic Link
Dashboard → Authentication → Providers → Email
- Enable Email: Yes
- Confirm Email: Yes
- Magic Link: Yes
- Minimum password length: N/A (magic link only)

## Auth Trigger (auto-create profile)
Run migration "create_auth_trigger" (done in Plan 1.2)
