const axios = require('axios');
const { Station } = require('./db/models');
const { sequelize } = require('./db/config');

// Dushanbe city center coordinates
const DUSHANBE_CENTER = {
  lat: 38.5737,
  lng: 68.7870
};

async function findAndSaveStops() {
  console.log('Starting bus stop import...');
  
  try {
    // First clear existing stations
    console.log('Clearing existing stations...');
    await Station.destroy({ where: {} });
    
    // List of all stops we found
    const stops = [
      { lat: 38.5614748, lon: 68.779865, name: 'Unnamed' },
      { lat: 38.5616714, lon: 68.799592, name: 'Истгоҳи "Садбарг"' },
      { lat: 38.5832621, lon: 68.7830047, name: 'Unnamed' },
      { lat: 38.5180275, lon: 68.7610281, name: 'Unnamed' },
      { lat: 38.5670665, lon: 68.7927132, name: 'Unnamed' },
      { lat: 38.5748038, lon: 68.7866793, name: 'Истгоҳи "Парки Рӯдакӣ"' },
      { lat: 38.5829329, lon: 68.7835733, name: 'Unnamed' },
      { lat: 38.5183969, lon: 68.7623413, name: 'Unnamed' },
      { lat: 38.5247763, lon: 68.763706, name: 'Амонатбонк' },
      { lat: 38.5708211, lon: 68.7881274, name: 'Unnamed' },
      { lat: 38.557233, lon: 68.7617033, name: 'Цирк' },
      { lat: 38.5574679, lon: 68.7623728, name: 'Цирк' },
      { lat: 38.5584814, lon: 68.7634628, name: 'Цирк' },
      { lat: 38.5595486, lon: 68.7551973, name: 'Unnamed' },
      { lat: 38.5625754, lon: 68.7547596, name: 'Unnamed' },
      { lat: 38.5645486, lon: 68.7551115, name: 'Unnamed' },
      { lat: 38.5578113, lon: 68.8001208, name: 'Истгоҳи "Роҳи оҳан"' },
      { lat: 38.5631309, lon: 68.8009907, name: 'олами китоб' },
      { lat: 38.562805, lon: 68.7981584, name: 'Unnamed' },
      { lat: 38.5630332, lon: 68.7956597, name: 'Unnamed' },
      // ... adding more stops ...
      { lat: 38.6580847, lon: 68.7650079, name: '3A Bus to City Center' }
    ];

    console.log(`Found ${stops.length} bus stops to import`);

    // Save each stop to database
    for (const stop of stops) {
      await Station.create({
        name: stop.name,
        lat: stop.lat,
        lng: stop.lon // Note: our database uses 'lng' while OSM uses 'lon'
      });
      console.log(`Saved stop: ${stop.name} at ${stop.lat}, ${stop.lon}`);
    }

    console.log('All stops have been saved to database!');
    
    // Verify the import
    const count = await Station.count();
    console.log(`Total stations in database: ${count}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the import
findAndSaveStops(); 