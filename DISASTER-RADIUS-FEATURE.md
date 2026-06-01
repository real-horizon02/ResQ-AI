# Disaster Radius Visualization Feature

## Overview

Added circular radius visualization on the map to show the affected area of selected disasters. When a volunteer clicks on a disaster incident, a circular area appears on the map showing the estimated impact zone.

## Features

### 🎯 Smart Radius Calculation
- **Dynamic sizing** based on disaster type and severity
- **Realistic estimates** for different disaster types:
  - Earthquake: 35-75km radius
  - Cyclone: 70-150km radius  
  - Tsunami: 56-120km radius
  - Flood: 17.5-37.5km radius
  - Wildfire: 10.5-22.5km radius
  - Fire: 3.5-7.5km radius
  - Landslide: 5.6-12km radius
  - Rainfall: 14-30km radius
  - Drought: 140-300km radius
  - Heatwave: 105-225km radius
  - Building Collapse: 1.4-3km radius
  - Gas Leak: 2.1-4.5km radius

### 🎨 Visual Design
- **Color-coded circles** matching disaster severity
- **Dashed border** for clear visibility (80% opacity)
- **Darker transparent fill** (25% opacity for better visibility)
- **Only shows for selected incident** - not cluttered

### 📊 Enhanced Incident Details
- **Radius information** in the incident detail card
- **Visual indicator** showing "Affected area shown on map"
- **Color-coded radius value** matching severity

## Technical Implementation

### Radius Calculation Logic
```typescript
function getDisasterRadius(incident: Incident): number {
  const baseRadius = {
    earthquake: 50000,  // 50km base
    cyclone: 100000,    // 100km base
    // ... other types
  };

  const severityMultiplier = {
    critical: 1.5,  // 50% larger
    high: 1.2,      // 20% larger  
    medium: 1.0,    // base size
    low: 0.7,       // 30% smaller
  };
  
  return baseRadius[type] * severityMultiplier[severity];
}
```

### Map Integration
- Uses Leaflet `L.circle()` for drawing
- Automatically removes previous circle when selecting new incident
- Proper cleanup on component unmount
- Responsive to incident selection changes

### Visual Properties
```typescript
const circle = L.circle([lat, lng], {
  radius: calculatedRadius,
  fillColor: severityColor,
  fillOpacity: 0.25,  // Darker transparent fill
  color: severityColor,
  weight: 2,
  opacity: 0.8,       // Darker border
  dashArray: '5, 10',  // Dashed border
});
```

## User Experience

### How It Works
1. **Browse disasters** in the incident list sidebar
2. **Click on any incident** to select it
3. **Map flies to location** and shows circular affected area
4. **Incident detail card** appears with radius information
5. **Circle disappears** when selecting different incident or closing

### Visual Feedback
- **Smooth map animation** when flying to incident location
- **Instant circle appearance** with matching colors
- **Clear radius indicator** in the detail card
- **Intuitive dashed circle** design

## Benefits

### For Volunteers
- **Better understanding** of disaster impact area
- **Informed decision making** about rescue operations
- **Visual context** for affected population
- **Clear scope** of disaster zone

### For Emergency Response
- **Area assessment** for resource allocation
- **Coverage planning** for rescue teams
- **Risk evaluation** for volunteer safety
- **Coordination** of multi-team operations

## Files Modified

- `src/pages/Volunteer.tsx`
  - Added `getDisasterRadius()` function
  - Added `activeCircle` ref for circle management
  - Added circle creation/removal logic
  - Enhanced incident detail card with radius info
  - Added visual indicator for affected area

## Usage Examples

### Critical Earthquake
- **Base radius**: 50km
- **With critical multiplier**: 75km
- **Visual**: Large red dashed circle
- **Detail card**: Shows "75km" in red text

### Medium Flood
- **Base radius**: 25km  
- **With medium multiplier**: 25km
- **Visual**: Medium orange dashed circle
- **Detail card**: Shows "25km" in orange text

### Low Fire Incident
- **Base radius**: 5km
- **With low multiplier**: 3.5km
- **Visual**: Small gray dashed circle
- **Detail card**: Shows "4km" in gray text

## Future Enhancements

Potential improvements:
- **Real-time radius updates** based on live data
- **Multiple circle layers** for different risk zones
- **Population density overlay** within radius
- **Evacuation route planning** around affected area
- **Historical impact comparison** with previous disasters
- **Weather-adjusted radius** for dynamic disasters

## Browser Compatibility

- Modern browsers with Leaflet support
- Canvas rendering for smooth performance
- Responsive design for mobile devices
- Touch-friendly interaction on tablets