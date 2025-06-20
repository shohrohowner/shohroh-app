import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { LatLng, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import * as api from './api';
import { AdminPanel } from './AdminPanel';
import { StatusBanner } from './StatusBanner';

// Interfaces for Station and Route
interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
}
interface Route {
  id: string;
  name: string;
  color: string;
  stationIds: string[];
}

// A simple Login Form component
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(username, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}


function App() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [editingMode, setEditingMode] = useState<'station' | 'route' | null>(null);
  const [newRouteStations, setNewRouteStations] = useState<Station[]>([]);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeColor, setRouteColor] = useState('#0000ff');

  // --- Data Fetching ---
  const fetchStations = async () => {
    const res = await api.getStations();
    setStations(res.data);
  };
  const fetchRoutes = async () => {
    const res = await api.getRoutes();
    setRoutes(res.data);
  };

  useEffect(() => {
    if (adminToken) {
      fetchStations();
      fetchRoutes();
    }
  }, [adminToken]);

  // --- Handlers ---
  const handleLogin = async (username, password) => {
    const res = await api.loginAdmin({ username, password });
    api.setAuthToken(res.data.token);
    setAdminToken(res.data.token);
  };

  const handleLogout = () => {
    api.setAuthToken(null);
    setAdminToken(null);
  };

  const handleAddStationClick = () => setEditingMode('station');
  const handleAddRouteClick = () => {
    setEditingMode('route');
    setIsDrawingRoute(true);
    setNewRouteStations([]);
  };

  const handleMapClick = (e: { latlng: LatLng }) => {
    if (editingMode === 'station') {
      const name = window.prompt('Enter station name:');
      if (name) {
        api.addStation({ name, lat: e.latlng.lat, lng: e.latlng.lng }).then(fetchStations);
        setEditingMode(null);
      }
    }
  };

  const handleStationClickForRoute = (station: Station) => {
    if (isDrawingRoute) {
      setNewRouteStations(prev => [...prev, station]);
    }
  };

  const handleSaveRoute = async () => {
    if (newRouteStations.length < 2 || !routeName) return;
    await api.addRoute({ name: routeName, color: routeColor, stationIds: newRouteStations.map(s => s.id) });
    fetchRoutes();
    setIsDrawingRoute(false);
    setNewRouteStations([]);
    setEditingMode(null);
  };

  const handleUpdateStation = async (id, newName) => {
    await api.updateStation(id, { name: newName });
    fetchStations();
  };

  const handleDeleteStation = async (id) => {
    if (!window.confirm('Delete this station?')) return;
    await api.deleteStation(id);
    fetchStations();
  };
  
  const handleUpdateRoute = async (id, name, color) => {
    await api.updateRoute(id, { name, color });
    fetchRoutes();
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    await api.deleteRoute(id);
    fetchRoutes();
  };

  // --- UI Logic ---
  let statusMessage = '';
  if (editingMode === 'station') statusMessage = 'Click on the map to add a new station.';
  if (editingMode === 'route') statusMessage = 'Click on stations to build your route.';

  if (!adminToken) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const getPathForRoute = (route: Route): [number, number][] => {
    return route.stationIds.map(stationId => {
      const station = stations.find(s => s.id === stationId);
      return station ? [station.lat, station.lng] : null;
    }).filter(p => p !== null) as [number, number][];
  };

  return (
    <div className="h-screen relative">
      <StatusBanner message={statusMessage} />
      <AdminPanel
        stations={stations}
        routes={routes}
        onLogout={handleLogout}
        onAddStation={handleAddStationClick}
        onUpdateStation={handleUpdateStation}
        onDeleteStation={handleDeleteStation}
        onAddRoute={handleAddRouteClick}
        onUpdateRoute={handleUpdateRoute}
        onDeleteRoute={handleDeleteRoute}
      />
      <MapContainer center={[41.2995, 69.2401]} zoom={13} className="h-full w-full" style={{ marginLeft: '320px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onClick={handleMapClick} />
        {stations.map(station => (
          <Marker key={station.id} position={[station.lat, station.lng]} eventHandlers={{ click: () => handleStationClickForRoute(station) }}>
            <Popup>{station.name}</Popup>
          </Marker>
        ))}
        {routes.map(route => (
          <Polyline key={route.id} positions={getPathForRoute(route)} color={route.color}>
            <Popup>{route.name}</Popup>
          </Polyline>
        ))}
        {isDrawingRoute && <Polyline positions={newRouteStations.map(s => [s.lat, s.lng])} color={routeColor} />}
      </MapContainer>
       {/* A simple panel for new route details */}
      {isDrawingRoute && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg z-[1000]">
          <input type="text" placeholder="Route name" value={routeName} onChange={e => setRouteName(e.target.value)} className="border p-1" />
          <input type="color" value={routeColor} onChange={e => setRouteColor(e.target.value)} />
          <button onClick={handleSaveRoute} className="bg-green-500 text-white p-1 ml-2">Save</button>
          <button onClick={() => setIsDrawingRoute(false)} className="bg-red-500 text-white p-1 ml-2">Cancel</button>
        </div>
      )}
    </div>
  );
}

// Helper component to handle map clicks
function MapClickHandler({ onClick }) {
    useMapEvents({
      click(e) {
        onClick(e);
      },
    });
    return null;
  }

export default App; 