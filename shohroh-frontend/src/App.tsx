import React, { useState, useEffect } from 'react';
import './App.css';
import * as api from './api';
import { ErrorBoundary } from './ErrorBoundary';
import RouteList from './components/RouteList';
import Map from './components/Map';
import StatusBanner from './components/StatusBanner';
import { getStations } from './api';
import { Station, Route } from './types';

// Main App Component
function App() {
  // State
  const [stations, setStations] = useState<Station[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data fetching effect
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [stationsResponse, routesResponse] = await Promise.all([
          getStations(),
          api.getRoutes()
        ]);
        setStations(Array.isArray(stationsResponse) ? stationsResponse : []);
        setRoutes(Array.isArray(routesResponse) ? routesResponse : []);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading data:', err);
        setStations([]);
        setRoutes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Run once on component mount

  return (
    <div className="app-container h-screen flex flex-col">
      <div className="flex-1 flex">
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <RouteList
            routes={routes}
            selectedRouteId={selectedRouteId}
            onRouteSelect={setSelectedRouteId}
          />
        </aside>
        <main className="flex-1 relative">
          <ErrorBoundary>
            <StatusBanner 
              message={isLoading ? 'Loading bus stations...' : `${stations.length} bus stations loaded`}
              type={error ? 'error' : 'info'}
            />
            <Map
              stations={stations}
              onStationClick={(station) => {
                console.log('Station clicked:', station);
              }}
            />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// App Wrapper with Error Boundary
export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
