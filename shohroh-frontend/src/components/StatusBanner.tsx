import React from 'react';

interface StatusBannerProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ message, type, onClose }) => {
  const backgroundColor = {
    success: '#4caf50',
    error: '#f44336',
    info: '#2196f3'
  }[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '4px',
        backgroundColor,
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0 5px',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default StatusBanner; 