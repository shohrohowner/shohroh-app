require('dotenv').config();
const sequelize = require('./config');
const { Admin, Station, Route, RouteStation } = require('./models');
const bcrypt = require('bcrypt');

async function migrate() {
  try {
    // Force sync all models (this will drop existing tables)
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Create default admin user
    const defaultAdmin = await Admin.create({
      username: 'saycoko',
      password: 'R6r25ey38t_'  // Will be hashed by the model hook
    });
    console.log('Default admin created:', defaultAdmin.username);

    // Import existing data from JSON files if needed
    const fs = require('fs');
    const path = require('path');

    // Import stations
    const stationsFile = path.join(__dirname, '..', 'stations.json');
    if (fs.existsSync(stationsFile)) {
      const stations = JSON.parse(fs.readFileSync(stationsFile, 'utf-8'));
      await Promise.all(stations.map(station => 
        Station.create({
          name: station.name,
          lat: station.lat,
          lng: station.lng
        })
      ));
      console.log('Imported existing stations');
    }

    // Import routes
    const routesFile = path.join(__dirname, '..', 'routes.json');
    if (fs.existsSync(routesFile)) {
      const routes = JSON.parse(fs.readFileSync(routesFile, 'utf-8'));
      for (const route of routes) {
        const newRoute = await Route.create({
          name: route.name,
          color: route.color
        });

        // Add stations to route
        if (route.stationIds && route.stationIds.length > 0) {
          const stations = await Station.findAll({
            where: {
              id: route.stationIds
            }
          });

          await Promise.all(stations.map((station, index) => 
            RouteStation.create({
              RouteId: newRoute.id,
              StationId: station.id,
              order: index
            })
          ));
        }
      }
      console.log('Imported existing routes');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 