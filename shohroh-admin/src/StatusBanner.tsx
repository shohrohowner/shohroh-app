import React from 'react';

interface StatusBannerProps {
  message: string;
}

export function StatusBanner({ message }: StatusBannerProps) {
  if (!message) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg z-[1000] animate-pulse">
      <p className="font-semibold">{message}</p>
    </div>
  );
} 