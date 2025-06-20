const Admin = require('./Admin');
const Station = require('./Station');
const Route = require('./Route');
const RouteStation = require('./RouteStation');

// Define associations
Route.belongsToMany(Station, {
  through: RouteStation,
  as: 'stations'
});

Station.belongsToMany(Route, {
  through: RouteStation,
  as: 'routes'
});

module.exports = {
  Admin,
  Station,
  Route,
  RouteStation
}; 