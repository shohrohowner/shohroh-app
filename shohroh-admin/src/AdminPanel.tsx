import React, { useState } from 'react';

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

interface AdminPanelProps {
  stations: Station[];
  routes: Route[];
  onLogout: () => void;
  onAddStation: () => void;
  onUpdateStation: (id: string, newName: string) => void;
  onDeleteStation: (id: string) => void;
  onAddRoute: () => void;
  onUpdateRoute: (id: string, name: string, color: string) => void;
  onDeleteRoute: (id: string) => void;
}

export function AdminPanel({
  stations,
  routes,
  onLogout,
  onAddStation,
  onUpdateStation,
  onDeleteStation,
  onAddRoute,
  onUpdateRoute,
  onDeleteRoute,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('stations');
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingRouteName, setEditingRouteName] = useState('');
  const [editingRouteColor, setEditingRouteColor] = useState('#0000ff');

  const handleEditStationClick = (station: Station) => {
    setEditingStationId(station.id);
    setEditingName(station.name);
  };

  const handleCancelStationClick = () => {
    setEditingStationId(null);
    setEditingName('');
  };

  const handleSaveStationClick = () => {
    if (editingStationId) {
      onUpdateStation(editingStationId, editingName);
      setEditingStationId(null);
      setEditingName('');
    }
  };
  
  const handleEditRouteClick = (route: Route) => {
    setEditingRouteId(route.id);
    setEditingRouteName(route.name);
    setEditingRouteColor(route.color);
  };

  const handleCancelRouteClick = () => {
    setEditingRouteId(null);
    setEditingRouteName('');
    setEditingRouteColor('#0000ff');
  };

  const handleSaveRouteClick = () => {
    if (editingRouteId) {
      onUpdateRoute(editingRouteId, editingRouteName, editingRouteColor);
      setEditingRouteId(null);
    }
  };

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-[1000] p-4 flex flex-col">
      <div className="flex-grow overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('stations')}
              className={`${
                activeTab === 'stations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Stations
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`${
                activeTab === 'routes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Routes
            </button>
          </nav>
        </div>

        {activeTab === 'stations' && (
          <div>
            <button
              onClick={onAddStation}
              className="w-full mb-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add New Station
            </button>
            <ul className="space-y-2">
              {stations.map(station => (
                <li key={station.id} className="p-2 border rounded-md">
                  {editingStationId === station.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                      <div className="flex space-x-2">
                        <button onClick={handleSaveStationClick} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                        <button onClick={handleCancelStationClick} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span>{station.name}</span>
                      <div className="space-x-2">
                        <button onClick={() => handleEditStationClick(station)} className="text-blue-500">Edit</button>
                        <button onClick={() => onDeleteStation(station.id)} className="text-red-500">Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'routes' && (
          <div>
            <button
              onClick={onAddRoute}
              className="w-full mb-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add New Route
            </button>
            <ul className="space-y-2">
              {routes.map(route => (
                <li key={route.id} className="p-2 border rounded-md">
                  {editingRouteId === route.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingRouteName}
                        onChange={(e) => setEditingRouteName(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Route Name"
                      />
                      <input
                        type="color"
                        value={editingRouteColor}
                        onChange={(e) => setEditingRouteColor(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex space-x-2">
                        <button onClick={handleSaveRouteClick} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                        <button onClick={handleCancelRouteClick} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span style={{ color: route.color, fontWeight: 'bold' }}>{route.name}</span>
                      <div className="space-x-2">
                        <button onClick={() => handleEditRouteClick(route)} className="text-blue-500">Edit</button>
                        <button onClick={() => onDeleteRoute(route.id)} className="text-red-500">Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-4">
        <button
          onClick={onLogout}
          className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 