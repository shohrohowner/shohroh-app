import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { Station } from '../types';

interface StationManagementProps {
  onStatusChange: (message: string, type: 'info' | 'error') => void;
}

interface NewStation {
  name: string;
  latitude: string;
  longitude: string;
}

export default function StationManagement({ onStatusChange }: StationManagementProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [newStation, setNewStation] = useState<NewStation>({
    name: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const response = await api.getStations();
      setStations(Array.isArray(response) ? response : []);
    } catch (error) {
      onStatusChange('Failed to load stations', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStation) {
        const response = await api.updateStation(editingStation.id, {
          name: newStation.name,
          latitude: parseFloat(newStation.latitude),
          longitude: parseFloat(newStation.longitude)
        });
        setStations(prev => prev.map(s => s.id === editingStation.id ? response : s));
      } else {
        const response = await api.addStation({
          name: newStation.name,
          latitude: parseFloat(newStation.latitude),
          longitude: parseFloat(newStation.longitude)
        });
        setStations(prev => [...prev, response]);
      }
      
      setNewStation({ name: '', latitude: '', longitude: '' });
      setEditingStation(null);
      onStatusChange(
        `Station ${editingStation ? 'updated' : 'added'} successfully`,
        'info'
      );
    } catch (error) {
      onStatusChange(
        `Failed to ${editingStation ? 'update' : 'add'} station`,
        'error'
      );
    }
  };

  const handleDelete = async (station: Station) => {
    try {
      await api.deleteStation(station.id);
      setStations(prev => prev.filter(s => s.id !== station.id));
      onStatusChange('Station deleted successfully', 'info');
    } catch (error) {
      onStatusChange('Failed to delete station', 'error');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {editingStation ? 'Edit Station' : 'Add New Station'}
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name:</label>
          <input
            type="text"
            value={newStation.name}
            onChange={e => setNewStation(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Latitude:</label>
          <input
            type="number"
            step="any"
            value={newStation.latitude}
            onChange={e => setNewStation(prev => ({ ...prev, latitude: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Longitude:</label>
          <input
            type="number"
            step="any"
            value={newStation.longitude}
            onChange={e => setNewStation(prev => ({ ...prev, longitude: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingStation ? 'Update' : 'Add'} Station
          </button>
          {editingStation && (
            <button
              type="button"
              onClick={() => {
                setEditingStation(null);
                setNewStation({ name: '', latitude: '', longitude: '' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-lg font-bold mb-2">Stations</h3>
      <div className="space-y-2">
        {stations.map(station => (
          <div
            key={station.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded"
          >
            <div>
              <div className="font-medium">{station.name}</div>
              <br />
              <small>
                Lat: {station.latitude}, Long: {station.longitude}
              </small>
            </div>
            <div>
              <button
                onClick={() => {
                  setEditingStation(station);
                  setNewStation({
                    name: station.name,
                    latitude: station.latitude.toString(),
                    longitude: station.longitude.toString()
                  });
                }}
                className="text-blue-500 hover:text-blue-700 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(station)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 