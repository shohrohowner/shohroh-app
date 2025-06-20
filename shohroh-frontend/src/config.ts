const config = {
  // API URLs
  api: {
    development: 'http://localhost:4000',
    production: process.env.REACT_APP_API_URL || 'https://your-backend.onrender.com'
  },

  // Map configuration
  map: {
    center: {
      lat: 38.5737,
      lng: 68.7870
    },
    zoom: 13,
    bounds: {
      southwest: [38.4644, 68.6888], // Southwest corner of Dushanbe
      northeast: [38.7068, 68.8871]  // Northeast corner of Dushanbe
    }
  },

  // Feature flags
  features: {
    realTimeUpdates: true,
    routeManagement: true,
    stationManagement: true
  }
};

export default config; 