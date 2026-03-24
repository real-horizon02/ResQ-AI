# Phase 8 Research: AI Predictions + PWA Offline Mode

Finalizing the platform for extreme conditions.

## PWA Offline Resiliency
- **Service Worker Caching**: Pre-caching critical UI and some Leaflet map tiles.
- **IndexedDB Sync**: Local storage for citizen reports created without a connection.
- **Background Sync API**: Automatic upload to Supabase when back online.

## AI Risk Heatmaps
- **Proactive Warnings**: Visualizing predicted disaster zones based on real-time data trends.
- **Heuristic-based Modeling**: For MVP, using trend analysis (e.g., rising water levels + rain intensity).

## Implementation Path
1. Install `vite-plugin-pwa`.
2. Build `outbox.ts` for IndexedDB management.
3. Update `ReportForm.tsx` to handle `navigator.onLine === false`.
4. Create the heatmap layer in `MapPage.tsx`.
