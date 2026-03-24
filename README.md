# ResQ AI: Disaster Management & Coordination Platform 🚒🚨

ResQ AI is a grid-resilient, AI-powered emergency response coordination platform designed to save lives in disaster-prone regions like India. It combines real-time data ingestion, predictive modeling, and decentralized volunteer coordination.

![ResQ AI Banner](https://images.unsplash.com/photo-1524813685617-3ee61ebb775d?auto=format&fit=crop&q=80&w=2000)

## 🚀 Key Features

### 📡 Real-Time Monitoring
- **Live Ingestion**: USGS Earthquake data and global weather alerts polled every 5 minutes via Supabase Edge Functions.
- **Interactive Map**: Pulse markers for live incidents with severity-based clustering.
- **Safe Zone Geofencing**: Automatically find nearby hospitals, shelters, and relief camps.

### 🚨 SOS & Emergency Logic
- **Critical SOS**: Sub-second signaling to all active admins and nearby volunteers.
- **Admin Command Center**: Real-time incident verification, prioritization, and resolution workflow.

### 🤖 AI Prediction (MVP)
- **Risk Heatmaps**: Visualizes pulsing danger zones based on meteorological trends (e.g., predicted flash floods or seismic risk).

### 📵 Grid-Resilient Architecture
- **Offline Outbox**: Reports are saved to IndexedDB when the network is cut and synced automatically when back online.
- **PWA Ready**: Install as a native mobile app for critical offline access.
- **Low-Bandwidth Mode**: Automatically detects slow networks (2G/3G) and optimizes data transfer.

---

## 🛠️ Tech Stack

- **Frontend**: Vite + React + Tailwind + Lucide Icons
- **Maps**: Leaflet + OpenStreetMap + PostGIS
- **Backend/Auth**: Supabase (Auth, Storage, Realtime, Edge Functions)
- **Offline Logic**: Service Workers (Workbox) + IndexedDB (IDB)
- **Infrastructure**: Vercel (CI/CD)

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- Supabase CLI
- A Supabase Project (for DB & Edge Functions)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd resq-ai
npm install
```

### 2. Environment Variables
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Migration
Deploy the schema to your Supabase instance:
```bash
supabase db push
```

### 4. Start Development
```bash
npm run dev
```

### 5. Build for Production (with PWA)
```bash
npm run build
```

---

## 🏛️ Project Structure

```text
resq-ai/
├── .planning/           # Phase-by-phase R&D documentation
├── supabase/
│   ├── functions/       # Data ingestion & notification edge functions
│   └── migrations/      # PostGIS schema & RLS policies
├── src/
│   ├── components/      # UI components (atoms, layout, map, reports)
│   ├── hooks/           # Custom auth, connection & SOS hooks
│   ├── lib/             # Supabase client & Offline outbox
│   ├── pages/           # Page containers (Home, Map, Admin, Volunteer)
│   └── store/           # Zustand state management
└── vite.config.ts       # PWA & Build configuration
```

---

## 🤝 Contributing

1. **Check the Roadmap**: Refer to `.planning/ROADMAP.md` for upcoming features.
2. **Issue Tracker**: Review `.planning/STATE.md` for pending tasks.
3. **Draft Plans**: Always create a `PLAN.md` before significant feature additions.

---

## 📄 License
MIT License - Developed by Antigravity AI & Team.

---
**ResQ AI: When seconds matter, data saves lives.**
