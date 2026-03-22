# ResQ AI: Features Research

## 1. Table Stakes — Must Have

| Feature | Description | Complexity |
|---------|-------------|-----------|
| Real-time CAP Alerts | IMD/NDMA push/SMS/WhatsApp alerts based on geolocation | Medium |
| Live Disaster Map | Leaflet map with severity indicators and safe paths | Medium |
| Multilingual Support | English, Hindi, Hinglish (i18next) | Low |
| SOS Emergency Trigger | One-tap location broadcast to responders | Medium |
| Shelter & Resource Directory | Verified hospitals, shelters, relief camps | Low |
| Basic Safety Guidelines | Offline-accessible disaster response guides | Low |

## 2. Differentiating Features

| Feature | Description | Complexity |
|---------|-------------|-----------|
| Bidirectional WhatsApp Bot | Photo/location reporting + shelter info via Twilio WhatsApp | High |
| AI-Based Hyper-local Forecasts | Flood level predictions per district using IMD + ML | High |
| Volunteer Coordination Hub | Real-time task assignment for verified volunteers | Medium |
| Crowdsourced Hazard Mapping | Users mark road closures, waterlogging, landslides with photos | Medium |
| Battery Saver Mode | Auto low-power UI when device is critical | Medium |
| Community Safety Check | "Mark Safe" for family groups; authority summary reports | Medium |

## 3. Rural & Accessibility Features

- **Low-Bandwidth PWA** — Under 1MB, works on 2G/spotty 4G
- **SMS/USSD Integration** — Report "Need Help" via missed call or USSD for non-smartphones
- **Visual-First UI** — NDMA-standard universally recognized icons (for low-literacy users)
- **Screen Reader Support** — Full a11y compliance
- **Offline District Maps** — Pre-downloadable vector maps when in "Green Zone"

## 4. Competitive Gaps (vs Sachet / UMANG)

| Feature | Sachet / UMANG | ResQ AI |
|---------|--------------|---------|
| Crowdsourcing | ❌ None | ✅ Real-time user reporting |
| Volunteer Management | ❌ No hub | ✅ Real-time dispatch |
| Messaging Platform | ❌ App-only | ✅ WhatsApp + SMS |
| UX | ⚠️ Bureaucratic | ✅ Emergency-optimized |
| Bidirectional | ❌ | ✅ Report via WhatsApp |

## 5. Anti-Features (Do NOT Build)

- **Mandatory account creation** — Never block SOS or alert viewing behind login
- **Non-urgent notification spam** — Only send alerts for actionable risks
- **High-res graphics / heavy video** — Fails on low-speed data in rural areas
- **Commercial advertising** — Zero distractions during emergencies
- **Centralized-only data** — Use edge caching for shelter lists, never single-point-of-failure
