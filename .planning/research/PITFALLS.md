# ResQ AI: Pitfalls Research

## 1. Alert Rate Limits & Cost Spikes
- **Pitfall:** WhatsApp/Twilio RPS limits. Sending 100K alerts simultaneously triggers 429 errors and cost overruns.
- **Warning signs:** Increasing notification latency; 429 errors in logs
- **Prevention:** Pre-register "Utility" message templates with Meta early. Implement async queue (Supabase Edge Functions + queue) with exponential backoff. Negotiate higher throughput before monsoon season.
- **Phase:** Development / Pre-Launch

## 2. ML Class Imbalance
- **Pitfall:** Disasters are rare. Model predicts "no disaster" 99% of time and is technically highly accurate but useless.
- **Warning signs:** High accuracy but near-zero recall for actual disaster events
- **Prevention:** Use SMOTE for synthetic rare-event data. Weight recent data more (climate non-stationarity). Train regional models (Himalayan vs. Coastal vs. Plains) not one national model.
- **Phase:** ML Research / Training

## 3. Database Connection Exhaustion
- **Pitfall:** Traffic spikes 100x during disasters. Supabase/Postgres runs out of connections. Vercel cold starts cause timeouts.
- **Warning signs:** `504 Gateway Timeout`, `Too many clients already` from Postgres
- **Prevention:** Enable Supabase PgBouncer/Supavisor connection pooling. Use Edge Functions for landing page/alerts. Build "Lite Mode" UI auto-triggered during high traffic.
- **Phase:** Infrastructure Setup

## 4. External API Downtime During Crises
- **Pitfall:** Government APIs (IMD, INCOIS) go down exactly when needed most.
- **Warning signs:** Stale weather data on dashboard; fetch timeout errors
- **Prevention:** Stale-while-revalidate caching. Multi-source redundancy (IMD down → fallback to OWM → fallback to cached). Schema validation layer to prevent crashes when API changes field names.
- **Phase:** Integration

## 5. Crowdsourced Misinformation
- **Pitfall:** Bots / bad actors flood fake SOS reports, diverting rescue resources.
- **Warning signs:** Burst of reports from single IP/location; conflicting reports for same incident
- **Prevention:** User reputation system. Distance-based verification (reports must come from users physically near the event). Community upvote/verify layer before admin review.
- **Phase:** Post-MVP / Scaling

## 6. Stale Offline Evacuation Data (Critical Safety Risk!)
- **Pitfall:** PWA serves cached evacuation route from 2 hours ago when flood path has changed. Can be fatal.
- **Warning signs:** User reports that "safe route" is now submerged
- **Prevention:** Aggressive TTL for evacuation/SOS data (5 min max). Force service worker update when new alert received. Clear specific cache keys (not all cache) on push notification.
- **Phase:** Development

## 7. Map Performance With Many Markers
- **Pitfall:** Rendering 10,000 incident markers crashes mobile browsers.
- **Warning signs:** Choppy map zoom/pan on mobile
- **Prevention:** Use `Leaflet.markercluster`. Use distinct icons AND shapes (not just colors) for accessibility. Use Vector Tiles or TopoJSON for complex boundary layers.
- **Phase:** Frontend Development

## 8. PII / Privacy Exposure
- **Pitfall:** Publicly exposing exact GPS and phone of SOS reporter → harassment in evacuated areas.
- **Warning signs:** Location data accessible without auth from frontend
- **Prevention:** Apply location fuzzing (100m radius, not exact) for public map markers. Use Supabase RLS to restrict full PII to verified NGO/responders only.
- **Phase:** Development / Security Review

## 9. Supabase-Specific Gotchas
- **Realtime subscription limits:** Each Supabase project has channel limits. Use one channel per disaster type, not one per user.
- **RLS performance:** Complex RLS policies slow down all queries in high-traffic scenarios. Test with EXPLAIN ANALYZE with RLS enabled.
- **Storage CDN:** Supabase Storage CDN caching can serve stale media. Set proper cache-control headers for incident photos.
- **Phase:** All phases
