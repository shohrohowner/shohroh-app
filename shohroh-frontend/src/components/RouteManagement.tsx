import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { Route, Station } from '../types';

interface RouteManagementProps {
  onStatusChange: (message: string, type: 'success' | 'error' | 'info') => void;
}

const RouteManagement: React.FC<RouteManagementProps> = ({ onStatusChange }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [newRoute, setNewRoute] = useState<{ name: string; color: string; stationIds: string[] }>({ name: '', color: '#0000ff', stationIds: [] });
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  useEffect(() => {
    fetchRoutesAndStations();
  }, []);

  const fetchRoutesAndStations = async () => {
    try {
      const [routesRes, stationsRes] = await Promise.all([
        api.getRoutes(),
        api.getStations()
      ]);
      setRoutes(Array.isArray(routesRes) ? routesRes : []);
      setStations(Array.isArray(stationsRes) ? stationsRes : []);
    } catch (error) {
      onStatusChange('Failed to load initial data', 'error');
    }
  };

  const handleStationSelect = (stationId: string) => {
    setNewRoute(prev => {
      const newStationIds = prev.stationIds.includes(stationId)
        ? prev.stationIds.filter(id => id !== stationId)
        : [...prev.stationIds, stationId];
      return { ...prev, stationIds: newStationIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await api.updateRoute(editingRoute.id, newRoute);
      } else {
        await api.addRoute(newRoute);
      }
      
      await fetchRoutesAndStations();
      setNewRoute({ name: '', color: '#0000ff', stationIds: [] });
      setEditingRoute(null);
      onStatusChange(`Route ${editingRoute ? 'updated' : 'created'} successfully`, 'success');
    } catch (error) {
      onStatusChange('Failed to save route', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    
    try {
      await api.deleteRoute(id);
      await fetchRoutesAndStations();
      onStatusChange('Route deleted successfully', 'success');
    } catch (error) {
      onStatusChange('Failed to delete route', 'error');
    }
  };

  const getStationName = (id: string) => {
    const station = stations.find(s => s.id === id);
    return station ? station.name : 'Unknown';
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Route Name"
            value={newRoute.name}
            onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
            style={{ padding: '8px' }}
            required
          />
          <input
            type="color"
            value={newRoute.color}
            onChange={(e) => setNewRoute({ ...newRoute, color: e.target.value })}
            style={{ padding: '8px' }}
          />
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
            <h4 style={{ marginTop: 0 }}>Select Stations</h4>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {stations.map((station) => (
                <div key={station.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={newRoute.stationIds.includes(station.id)}
                      onChange={() => handleStationSelect(station.id)}
                    />
                    {station.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {editingRoute ? 'Update Route' : 'Add Route'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h4>Existing Routes</h4>
        <div style={{ display: 'grid', gap: '10px' }}>
          {(routes || []).map((route) => (
            <div
              key={route.id}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: route.color || '#000' }}>{route.name}</strong>
                <div>
                  <button
                    onClick={() => {
                      setEditingRoute(route);
                      setNewRoute({
                        name: route.name,
                        color: route.color,
                        stationIds: route.stationIds
                      });
                    }}
                    style={{
                      marginRight: '5px',
                      padding: '5px 10px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(route.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                Stations: {route.stationIds.map(getStationName).join(' → ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteManagement; 