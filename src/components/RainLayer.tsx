import { useEffect } from "react";
import L from "leaflet";

interface RainLayerProps {
  map: L.Map | null;
}

export default function RainLayer({ map }: RainLayerProps) {
  useEffect(() => {
    if (!map) return;

    let layer: L.TileLayer | null = null;

    const load = async () => {
      const res = await fetch(
        "https://api.rainviewer.com/public/weather-maps.json"
      );
      const data = await res.json();

      const latest = data.radar.past[data.radar.past.length - 1];

      const url = `https://tilecache.rainviewer.com/v2/radar/${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;

      if (layer) {
        map.removeLayer(layer);
      }

      layer = L.tileLayer(url, {
        opacity: 0.6,
      });

      layer.addTo(map);
    };

    load();
    const interval = setInterval(load, 300000);

    return () => {
      clearInterval(interval);
      if (layer) map.removeLayer(layer);
    };
  }, [map]);

  return null;
}