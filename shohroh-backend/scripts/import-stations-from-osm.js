console.log('--- Script starting ---');
const axios = require('axios');

// --- Configuration ---
const API_BASE_URL = 'http://localhost:4000';
const ADMIN_USERNAME = 'saycoko';
const ADMIN_PASSWORD = 'R6r25ey38t_';

// Bounding box for Dushanbe, Tajikistan
// Found from: https://en-gb.topographic-map.com/map-krpb57/Dushanbe/
const DUSHANBE_BBOX = '38.46448,68.68883,38.70684,68.88710'; // S,W,N,E

/**
 * Logs in to the admin account to get an authentication token.
 */
async function getAuthToken() {
  console.log('Attempting to get auth token...');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    });
    if (response.data.token) {
      console.log('Successfully received token.');
      return response.data.token;
    } else {
      console.log('Login successful, but no token in response.');
      throw new Error('No token received.');
    }
  } catch (error) {
    console.error('Error during login:', error.response ? JSON.stringify(error.response.data) : error.message);
    throw new Error('Could not authenticate.');
  }
}

/**
 * Fetches bus stop data from OpenStreetMap's Overpass API.
 */
async function fetchBusStops() {
  console.log(`Constructing Overpass API query for bbox: ${DUSHANBE_BBOX}`);
  const overpassQuery = `
    [out:json];
    (
      node["highway"="bus_stop"](${DUSHANBE_BBOX});
      way["highway"="bus_stop"](${DUSHANBE_BBOX});
      relation["highway"="bus_stop"](${DUSHANBE_BBOX});
    );
    out body;
    >;
    out skel qt;
  `;
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
  console.log(`Fetching from URL: ${overpassUrl}`);

  try {
    const response = await axios.get(overpassUrl);
    console.log(`Received response from Overpass API. Status: ${response.status}`);
    const busStops = response.data.elements;
    if (busStops) {
        console.log(`Found ${busStops.length} elements.`);
    } else {
        console.log('Response from Overpass API did not contain elements.');
    }
    return busStops;
  } catch (error) {
    console.error('Error fetching data from Overpass API:', error.response ? JSON.stringify(error.response.data) : error.message);
    throw new Error('Could not fetch bus stops.');
  }
}

/**
 * Creates a single station in our application via the API.
 */
async function createStation(stationData, token) {
  console.log(`Attempting to create station: ${JSON.stringify(stationData)}`);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/stations`, stationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`Successfully created station: "${stationData.name}", Status: ${response.status}`);
  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`Failed to create station "${stationData.name}": ${errorMessage}`);
  }
}

/**
 * Main function to run the import process.
 */
async function importStations() {
  console.log('Starting station import process...');
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Could not get auth token. Aborting.');
      return;
    }

    const busStops = await fetchBusStops();

    if (!busStops || busStops.length === 0) {
      console.log('No bus stops found to import.');
      return;
    }
    
    console.log(`\\nStarting import of ${busStops.length} stations...\\n`);

    for (const stop of busStops) {
      const stationData = {
        name: stop.tags?.name || `Bus Stop #${stop.id}`,
        lat: stop.lat,
        lng: stop.lon,
      };
      
      // Some elements in OSM might be ways or relations without a specific center point
      if (typeof stationData.lat !== 'number' || typeof stationData.lng !== 'number') {
        console.warn(`Skipping stop #${stop.id} (name: ${stop.tags?.name}) because it has no direct coordinates.`);
        continue;
      }

      await createStation(stationData, token);
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\\nImport process finished!\\n');

  } catch (error) {
    console.error(`\\nAn unhandled error occurred during the import process: ${error.message}`);
    process.exit(1);
  }
}

importStations(); 