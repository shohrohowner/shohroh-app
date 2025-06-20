import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Station, Route } from '../types';
import config from '../config';

interface MapProps {
  stations: Station[];
  onStationClick: (station: Station) => void;
}

const Map: React.FC<MapProps> = ({ stations, onStationClick }) => {
  return (
    <MapContainer
      center={config.map.center}
      zoom={config.map.zoom}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stations.map(station => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          eventHandlers={{
            click: () => onStationClick(station)
          }}
        >
          <Popup>
            <h3>{station.name}</h3>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map; 