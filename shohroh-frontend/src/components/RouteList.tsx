import React from 'react';

interface Route {
  id: string;
  name: string;
  color: string;
  stationIds: string[];
}

interface RouteListProps {
  routes: Route[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string | null) => void;
  isLoading?: boolean;
}

const RouteList: React.FC<RouteListProps> = ({ 
  routes = [], 
  selectedRouteId, 
  onRouteSelect,
  isLoading = false 
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-bold text-gray-900">Transport Routes</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">Loading routes...</p>
            </div>
          </div>
        ) : routes.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            No routes available
          </div>
        ) : (
          <>
            {/* All Routes option */}
            <button
              onClick={() => onRouteSelect(null)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                selectedRouteId === null ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-gray-400" />
                <span className="text-gray-800 font-medium">All Routes</span>
              </div>
            </button>

            <div className="divide-y">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => onRouteSelect(route.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                    selectedRouteId === route.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="text-gray-800 font-medium">{route.name}</span>
                    <span className="text-gray-500 text-sm ml-auto">
                      {route.stationIds.length} stations
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RouteList; 