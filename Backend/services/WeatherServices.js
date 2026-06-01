import axios from "axios";

// 🇮🇳 50 cities covering all Indian states for comprehensive rain monitoring
export const cities = [
  // North India
  { name: "Delhi", lat: 28.61, lng: 77.20 },
  { name: "Jaipur", lat: 26.91, lng: 75.78 },
  { name: "Lucknow", lat: 26.85, lng: 80.94 },
  { name: "Srinagar", lat: 34.08, lng: 74.79 },
  { name: "Chandigarh", lat: 30.73, lng: 76.77 },
  { name: "Amritsar", lat: 31.63, lng: 74.87 },
  { name: "Dehradun", lat: 30.32, lng: 78.03 },
  { name: "Agra", lat: 27.18, lng: 78.01 },
  { name: "Varanasi", lat: 25.32, lng: 83.00 },
  { name: "Shimla", lat: 31.10, lng: 77.17 },
  { name: "Jammu", lat: 32.73, lng: 74.87 },
  // Central India
  { name: "Bhopal", lat: 23.25, lng: 77.41 },
  { name: "Nagpur", lat: 21.15, lng: 79.08 },
  { name: "Raipur", lat: 21.25, lng: 81.63 },
  { name: "Indore", lat: 22.71, lng: 75.85 },
  { name: "Jabalpur", lat: 23.18, lng: 79.94 },
  // East India
  { name: "Kolkata", lat: 22.57, lng: 88.36 },
  { name: "Patna", lat: 25.59, lng: 85.13 },
  { name: "Bhubaneswar", lat: 20.30, lng: 85.82 },
  { name: "Ranchi", lat: 23.34, lng: 85.31 },
  { name: "Gaya", lat: 24.79, lng: 84.99 },
  { name: "Cuttack", lat: 20.46, lng: 85.88 },
  // West India
  { name: "Mumbai", lat: 19.07, lng: 72.87 },
  { name: "Ahmedabad", lat: 23.02, lng: 72.57 },
  { name: "Pune", lat: 18.52, lng: 73.85 },
  { name: "Panaji", lat: 15.49, lng: 73.82 },
  { name: "Surat", lat: 21.17, lng: 72.83 },
  { name: "Vadodara", lat: 22.31, lng: 73.18 },
  { name: "Nashik", lat: 19.99, lng: 73.79 },
  { name: "Aurangabad", lat: 19.87, lng: 75.34 },
  // South India
  { name: "Chennai", lat: 13.08, lng: 80.27 },
  { name: "Bengaluru", lat: 12.97, lng: 77.59 },
  { name: "Hyderabad", lat: 17.38, lng: 78.48 },
  { name: "Thiruvananthapuram", lat: 8.52, lng: 76.93 },
  { name: "Visakhapatnam", lat: 17.68, lng: 83.21 },
  { name: "Kochi", lat: 9.93, lng: 76.26 },
  { name: "Madurai", lat: 9.93, lng: 78.12 },
  { name: "Coimbatore", lat: 11.01, lng: 76.96 },
  { name: "Vijayawada", lat: 16.51, lng: 80.62 },
  { name: "Mangaluru", lat: 12.87, lng: 74.84 },
  { name: "Mysuru", lat: 12.29, lng: 76.64 },
  { name: "Kozhikode", lat: 11.25, lng: 75.78 },
  // Northeast India
  { name: "Guwahati", lat: 26.14, lng: 91.73 },
  { name: "Imphal", lat: 24.81, lng: 93.93 },
  { name: "Shillong", lat: 25.57, lng: 91.88 },
  { name: "Agartala", lat: 23.83, lng: 91.27 },
  { name: "Aizawl", lat: 23.73, lng: 92.72 },
  { name: "Itanagar", lat: 27.08, lng: 93.60 },
  { name: "Kohima", lat: 25.67, lng: 94.11 },
  { name: "Dibrugarh", lat: 27.47, lng: 94.91 },
];

export const getHeatwaveData = async () => {
  try {
    const lats = cities.map(c => c.lat).join(",");
    const lngs = cities.map(c => c.lng).join(",");

    // Batch query all 24 locations in a single high-performance request!
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m`;

    const res = await axios.get(url, { timeout: 8000 });
    const dataArray = Array.isArray(res.data) ? res.data : [res.data];

    const results = dataArray.map((locWeather, index) => {
      const city = cities[index];
      let temp = 30;
      let humidity = 50;

      if (locWeather && locWeather.current) {
        temp = locWeather.current.temperature_2m;
        humidity = locWeather.current.relative_humidity_2m || 50;
      }

      // 🔥 HEATWAVE LOGIC
      let isHeatwave = false;
      let severity = "low";

      if (temp >= 45) {
        isHeatwave = true;
        severity = "critical";
      } else if (temp >= 42) {
        isHeatwave = true;
        severity = "high";
      } else if (temp >= 38) {
        isHeatwave = true;
        severity = "medium";
      }

      if (!isHeatwave) return null;

      return {
        id: `heat-${city.name}-${Date.now()}`,
        title: "Heatwave",
        type: "heatwave",
        lat: city.lat,
        lng: city.lng,
        temperature: temp,
        humidity,
        severity,
        description: `Heatwave Alert in ${city.name}: Real-time temperature is ${temp}°C with ${humidity}% humidity.`,
        reportedAt: new Date().toISOString(),
        peopleAffected: Math.floor(temp * 120),
        source: "Open-Meteo"
      };
    });

    return results.filter(Boolean);

  } catch (err) {
    console.error("[HEATWAVE] Error:", err.message);
    return [];
  }
};