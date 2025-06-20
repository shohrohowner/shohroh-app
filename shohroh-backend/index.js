console.log('=== Shohroh Backend: Starting index.js ===');
require('dotenv').config();
console.log('dotenv loaded');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Admin, Station, Route } = require('./db/models');
const { sequelize } = require('./db/config');
const jwt = require('jsonwebtoken');
const { runImport } = require('./osmImporter');
const http = require('http');
const { Server } = require('socket.io');

// --- Constants ---
const ROOT_DIR = path.resolve(__dirname);
const FRONTEND_BUILD = path.join(ROOT_DIR, '..', 'shohroh-frontend', 'build');
const JWT_SECRET = process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-env';

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Production security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Enable CORS for frontend
const allowedOrigins = [
  'http://localhost:3000',                // Development
  'https://shohroh.vercel.app',          // Production frontend (example)
  'https://www.shohroh.com'              // Production domain (example)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the React app
console.log('Serving frontend from:', FRONTEND_BUILD);
app.use(express.static(FRONTEND_BUILD));

// --- Auth Middleware ---
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.error('JWT verification failed:', err);
                return res.status(403).json({ message: "Token is not valid", error: err.message });
            }
            req.user = user;
            next();
        });
    } else {
        console.error('Missing authorization header');
        res.status(401).json({ message: "Authorization header is missing" });
    }
};

// --- API Endpoints ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);
        
        if (!username || !password) {
            console.error('Missing credentials');
            return res.status(400).json({ message: 'Username and password required' });
        }

        const admin = await Admin.findOne({ where: { username } });
        if (!admin) {
            console.error('Admin not found:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = admin.validPassword(password);
        if (!isValidPassword) {
            console.error('Invalid password for:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log('Login successful for:', username);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login.', error: error.message });
    }
});

app.post('/api/admin/import-stations', authenticateJWT, (req, res) => {
    console.log('Received request to import stations from OSM.');
    res.status(202).json({ message: 'Station import process initiated. Check server logs for progress.' });

    // Run the import in the background
    runImport().catch(error => {
        console.error('[OSM Import] A critical error occurred during the background import process:', error);
    });
});

// GET all stations
app.get('/api/stations', async (req, res) => {
    try {
        console.log('Fetching all stations...');
        const stations = await Station.findAll({ order: [['name', 'ASC']] });
        console.log(`Found ${stations.length} stations`);
        res.json(stations);
    } catch (err) {
        console.error('Error fetching stations:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST a new station
app.post('/api/stations', authenticateJWT, async (req, res) => {
    try {
        const station = await Station.create(req.body);
        // Emit the new station to all connected clients
        emitUpdate('station:created', station);
        res.status(201).json(station);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a station
app.put('/api/stations/:id', authenticateJWT, async (req, res) => {
    try {
        const station = await Station.findByPk(req.params.id);
        if (station) {
            await station.update(req.body);
            // Emit the updated station to all connected clients
            emitUpdate('station:updated', station);
            res.json(station);
        } else {
            res.status(404).json({ message: 'Station not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a station
app.delete('/api/stations/:id', authenticateJWT, async (req, res) => {
    try {
        const station = await Station.findByPk(req.params.id);
        if (station) {
            await station.destroy();
            // Emit the deleted station ID to all connected clients
            emitUpdate('station:deleted', req.params.id);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Station not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all routes
app.get('/api/routes', async (req, res) => {
    try {
        console.log('Fetching all routes...');
        const routes = await Route.findAll({
            include: [{ model: Station, as: 'stations', through: { attributes: [] } }],
            order: [['name', 'ASC']]
        });
        console.log(`Found ${routes.length} routes`);
        res.json(routes.map(route => ({
            id: route.id,
            name: route.name,
            color: route.color,
            stationIds: route.stations.map(station => station.id)
        })));
    } catch (err) {
        console.error('Error fetching routes:', err);
        res.status(500).json({ message: err.message });
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Helper function to emit updates to all connected clients
const emitUpdate = (event, data) => {
  io.emit(event, data);
};

// Route routes
app.post('/api/routes', async (req, res) => {
  try {
    const route = await Route.create(req.body);
    if (req.body.stationIds) {
      await route.setStations(req.body.stationIds);
    }
    const routeWithStations = await Route.findByPk(route.id, {
      include: [Station]
    });
    // Emit the new route to all connected clients
    emitUpdate('route:created', routeWithStations);
    res.status(201).json(routeWithStations);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

app.put('/api/routes/:id', async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    await route.update(req.body);
    if (req.body.stationIds) {
      await route.setStations(req.body.stationIds);
    }
    const updatedRoute = await Route.findByPk(route.id, {
      include: [Station]
    });
    // Emit the updated route to all connected clients
    emitUpdate('route:updated', updatedRoute);
    res.json(updatedRoute);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    await route.destroy();
    // Emit the deleted route ID to all connected clients
    emitUpdate('route:deleted', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

// --- Serve Frontend ---
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(FRONTEND_BUILD, 'index.html'));
});

// --- Database Initialization ---
async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');
        
        // Create default admin if it doesn't exist
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            await Admin.create({
                username: 'saycoko',
                password: 'R6r25ey38t_'
            });
            console.log('Default admin created');
        }

        // Create sample stations if none exist
        const stationCount = await Station.count();
        if (stationCount === 0) {
            const stations = await Station.bulkCreate([
                {
                    name: 'Central Station',
                    lat: 38.5598,
                    lng: 68.7870
                },
                {
                    name: 'North Terminal',
                    lat: 38.5898,
                    lng: 68.7870
                },
                {
                    name: 'South Terminal',
                    lat: 38.5298,
                    lng: 68.7870
                }
            ]);
            console.log('Sample stations created:', stations.length);

            // Create a sample route
            const route = await Route.create({
                name: 'Route 1',
                color: '#FF0000'
            });
            await route.setStations(stations);
            console.log('Sample route created');
        }

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

// --- Database Connection and Server Start ---
sequelize.authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
        return sequelize.sync(); // Sync models with the database
    })
    .then(() => initializeDatabase())
    .then(() => {
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`\n=== Shohroh Transport App ===`);
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`Access the app at: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database or sync models:', err);
        process.exit(1);
    });
