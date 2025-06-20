const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Define different areas of Dushanbe to search
const AREAS = [
  {
    name: 'City Center',
    bbox: {
      south: 38.5500,
      west: 68.7700,
      north: 38.5900,
      east: 68.8000
    }
  },
  {
    name: 'Shohmansur District',
    bbox: {
      south: 38.5700,
      west: 68.7400,
      north: 38.6100,
      east: 68.7800
    }
  },
  {
    name: 'Sino District',
    bbox: {
      south: 38.5200,
      west: 68.7600,
      north: 38.5600,
      east: 68.8000
    }
  },
  {
    name: 'Firdavsi District',
    bbox: {
      south: 38.5300,
      west: 68.7000,
      north: 38.5700,
      east: 68.7400
    }
  },
  {
    name: 'Ismoili Somoni District',
    bbox: {
      south: 38.5600,
      west: 68.7800,
      north: 38.6000,
      east: 68.8200
    }
  }
];

async function fetchStopsInArea(area) {
  console.log(`[Locator] Searching for bus stops in ${area.name}...`);
  
  const bbox = `${area.bbox.south},${area.bbox.west},${area.bbox.north},${area.bbox.east}`;
  console.log(`[Locator] Using bounding box: ${bbox}`);
  
  const overpassQuery = `
    [out:json][timeout:25];
    (
      // Bus stops
      node["highway"="bus_stop"](${bbox});
      node["public_transport"="platform"]["bus"="yes"](${bbox});
      node["public_transport"="stop_position"]["bus"="yes"](${bbox});
      
      // Bus stations
      node["amenity"="bus_station"](${bbox});
      
      // Trolleybus stops
      node["trolleybus"="yes"](${bbox});
      node["public_transport"="platform"]["trolleybus"="yes"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `;

  console.log('[Locator] Sending query to Overpass API...');
  console.log('[Locator] Query:', overpassQuery);

  try {
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: { data: overpassQuery },
      timeout: 30000
    });

    console.log('[Locator] Got response from Overpass API');

    if (!response.data || !response.data.elements) {
      console.error('[Locator] Invalid response:', response.data);
      throw new Error('Invalid response from Overpass API');
    }

    const stops = response.data.elements
      .filter(el => el.type === 'node' && el.lat && el.lon)
      .map(stop => ({
        id: stop.id,
        name: stop.tags?.name || stop.tags?.['name:tg'] || stop.tags?.['name:ru'] || `Bus Stop #${stop.id}`,
        lat: stop.lat,
        lon: stop.lon,
        area: area.name,
        amenities: {
          shelter: stop.tags?.shelter === 'yes',
          bench: stop.tags?.bench === 'yes',
          lit: stop.tags?.lit === 'yes'
        },
        tags: stop.tags || {}
      }));

    console.log(`[Locator] Found ${stops.length} stops in ${area.name}`);
    console.log('[Locator] First stop:', stops[0]);
    return stops;
  } catch (error) {
    console.error(`[Locator] Error fetching data for ${area.name}:`, error);
    console.error('[Locator] Error details:', error.response?.data || 'No response data');
    return [];
  }
}

async function locateAllStops() {
  console.log('[Locator] Starting bus stop location process...');
  
  const allStops = [];
  
  // Add delay between requests to avoid overwhelming the API
  for (const area of AREAS) {
    console.log(`\n[Locator] Processing area: ${area.name}`);
    const stops = await fetchStopsInArea(area);
    allStops.push(...stops);
    console.log(`[Locator] Added ${stops.length} stops from ${area.name}`);
    console.log('[Locator] Waiting 2 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  }

  // Remove duplicates based on OSM ID
  const uniqueStops = Array.from(
    new Map(allStops.map(stop => [stop.id, stop])).values()
  );

  console.log(`\n[Locator] Found total of ${uniqueStops.length} unique bus stops`);

  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    console.log(`[Locator] Ensured data directory exists: ${dataDir}`);

    // Save to JSON file
    const outputPath = path.join(dataDir, 'located-stations.json');
    await fs.writeFile(outputPath, JSON.stringify(uniqueStops, null, 2));
    console.log(`[Locator] Saved results to ${outputPath}`);

    // Generate statistics
    const statistics = AREAS.map(area => ({
      area: area.name,
      count: allStops.filter(stop => stop.area === area.name).length
    }));

    console.log('\nStatistics by area:');
    statistics.forEach(stat => {
      console.log(`${stat.area}: ${stat.count} stops`);
    });

    return {
      total: uniqueStops.length,
      statistics
    };
  } catch (error) {
    console.error('[Locator] Error saving results:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  console.log('[Locator] Script started');
  locateAllStops()
    .then(result => {
      console.log('\n[Locator] Location process completed successfully!');
      console.log('[Locator] Results:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('[Locator] Failed to locate bus stops:', error);
      process.exit(1);
    });
}

module.exports = { locateAllStops }; 