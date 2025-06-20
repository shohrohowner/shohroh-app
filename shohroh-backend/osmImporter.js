const axios = require('axios');
const { Station } = require('./db/models'); // Use Sequelize model

// Dushanbe city boundaries
const DUSHANBE_BBOX = {
  south: 38.4644,
  west: 68.6888,
  north: 38.7068,
  east: 68.8871
};

// Transliteration map for Tajik to Latin
const translitMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ғ': 'gh', 'ӣ': 'i',
  'қ': 'q', 'ӯ': 'u', 'ҳ': 'h', 'ҷ': 'j'
};

function transliterate(text) {
  if (!text) return '';
  return text.toLowerCase().split('').map(char => translitMap[char] || char).join('');
}

async function fetchBusStops() {
  console.log('[OSM Import] Starting bus stop search in Dushanbe...');
  
  // More specific query for bus stops and stations in Dushanbe
  const overpassQuery = `
    [out:json][timeout:25];
    // Define Dushanbe area
    area["name:en"="Dushanbe"]["admin_level"="4"]->.dushanbe;
    (
      // Bus stops
      node["highway"="bus_stop"](area.dushanbe);
      node["public_transport"="platform"]["bus"="yes"](area.dushanbe);
      node["public_transport"="stop_position"]["bus"="yes"](area.dushanbe);
      
      // Bus stations
      node["amenity"="bus_station"](area.dushanbe);
      way["amenity"="bus_station"](area.dushanbe);
      
      // Trolleybus stops
      node["trolleybus"="yes"](area.dushanbe);
      node["public_transport"="platform"]["trolleybus"="yes"](area.dushanbe);
      
      // Include stops with local tags
      node["name:tg"](area.dushanbe)["highway"="bus_stop"];
      node["name:ru"](area.dushanbe)["highway"="bus_stop"];
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    console.log('[OSM Import] Sending query to Overpass API...');
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: { data: overpassQuery },
      timeout: 30000 // 30 second timeout
    });

    if (!response.data || !response.data.elements) {
      throw new Error('Invalid response from Overpass API');
    }

    const stops = response.data.elements.filter(el => el.type === 'node' && el.lat && el.lon);
    console.log(`[OSM Import] Found ${stops.length} bus stops/stations in Dushanbe`);
    
    // Group nearby stops (within 50 meters) to avoid duplicates
    const groupedStops = groupNearbyStops(stops, 50);
    console.log(`[OSM Import] After grouping nearby stops: ${groupedStops.length} unique locations`);
    
    return groupedStops;
  } catch (error) {
    console.error('[OSM Import] Error fetching data:', error.message);
    throw new Error('Failed to fetch bus stops from OpenStreetMap');
  }
}

// Function to group nearby stops to avoid duplicates
function groupNearbyStops(stops, maxDistance) {
  const grouped = [];
  const used = new Set();

  for (const stop of stops) {
    if (used.has(stop.id)) continue;

    const nearby = stops.filter(other => 
      !used.has(other.id) && 
      calculateDistance(stop.lat, stop.lon, other.lat, other.lon) <= maxDistance
    );

    // Mark all nearby stops as used
    nearby.forEach(s => used.add(s.id));

    // Use the stop with the most information as the main stop
    const mainStop = nearby.reduce((best, current) => {
      const bestScore = countTags(best);
      const currentScore = countTags(current);
      return currentScore > bestScore ? current : best;
    }, stop);

    grouped.push(mainStop);
  }

  return grouped;
}

// Count the number of useful tags a stop has
function countTags(stop) {
  const usefulTags = ['name', 'name:tg', 'name:ru', 'ref', 'shelter', 'bench', 'lit'];
  return usefulTags.filter(tag => stop.tags && stop.tags[tag]).length;
}

// Calculate distance between two points in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

async function createStation(stationData) {
  try {
    // Clean and prepare the name
    const name = stationData.tags?.name 
      || stationData.tags?.['name:tg']
      || stationData.tags?.['name:ru']
      || stationData.tags?.ref
      || `Bus Stop #${stationData.id}`;

    // Create the station
    const station = await Station.create({
      name,
      lat: stationData.lat,
      lng: stationData.lon,
      osm_id: stationData.id,
      osm_type: stationData.type,
      shelter: stationData.tags?.shelter === 'yes',
      bench: stationData.tags?.bench === 'yes',
      lit: stationData.tags?.lit === 'yes',
      network: stationData.tags?.network || null,
      operator: stationData.tags?.operator || null,
      ref: stationData.tags?.ref || null
    });

    console.log(`[OSM Import] Created station: "${name}" at ${stationData.lat}, ${stationData.lon}`);
    return station;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.warn(`[OSM Import] Station at ${stationData.lat}, ${stationData.lon} already exists. Skipping.`);
      return null;
    }
    throw error;
  }
}

async function runImport() {
  console.log('[OSM Import] Starting import of Dushanbe bus stops...');
  try {
    // Clear existing stations
    await Station.destroy({ where: {} });
    console.log('[OSM Import] Cleared existing stations');

    const busStops = await fetchBusStops();
    
    if (!busStops || busStops.length === 0) {
      console.log('[OSM Import] No bus stops found in Dushanbe');
      return { message: 'No bus stops found', count: 0 };
    }

    let importCount = 0;
    let errorCount = 0;

    for (const stop of busStops) {
      try {
        const station = await createStation(stop);
        if (station) importCount++;
        // Add small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`[OSM Import] Error importing stop #${stop.id}:`, error.message);
        errorCount++;
      }
    }

    const result = {
      message: `Import completed. Successfully imported ${importCount} stations. Failed: ${errorCount}`,
      count: importCount,
      errors: errorCount
    };

    console.log('[OSM Import]', result.message);
    return result;

  } catch (error) {
    console.error('[OSM Import] Critical error:', error);
    throw error;
  }
}

module.exports = { runImport }; 