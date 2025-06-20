import React, { useState } from 'react';
import StatusBanner from './StatusBanner';
import StationManagement from './StationManagement';
import RouteManagement from './RouteManagement';
import { StatusMessage } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stations' | 'routes'>('stations');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const handleStatusChange = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRight: '1px solid #ddd'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Admin Panel</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('stations')}
            style={{
              padding: '10px',
              backgroundColor: activeTab === 'stations' ? '#2196f3' : '#fff',
              color: activeTab === 'stations' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Manage Stations
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            style={{
              padding: '10px',
              backgroundColor: activeTab === 'routes' ? '#2196f3' : '#fff',
              color: activeTab === 'routes' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Manage Routes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {activeTab === 'stations' ? (
          <div>
            <h3>Station Management</h3>
            <StationManagement onStatusChange={handleStatusChange} />
          </div>
        ) : (
          <div>
            <h3>Route Management</h3>
            <RouteManagement onStatusChange={handleStatusChange} />
          </div>
        )}
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <StatusBanner
          message={statusMessage.text}
          type={statusMessage.type}
          onClose={() => setStatusMessage(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel; 