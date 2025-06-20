import { io, Socket } from 'socket.io-client';
import { Station, Route } from '../types';

class RealtimeService {
  private socket: Socket | null = null;
  private listeners: { [key: string]: Function[] } = {};

  connect() {
    // Use WebSocket URL (change this to your production URL when deploying)
    this.socket = io('http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to realtime service');
    });

    this.socket.on('station:update', (station: Station) => {
      this.notifyListeners('station:update', station);
    });

    this.socket.on('station:delete', (stationId: string) => {
      this.notifyListeners('station:delete', stationId);
    });

    this.socket.on('route:update', (route: Route) => {
      this.notifyListeners('route:update', route);
    });

    this.socket.on('route:delete', (routeId: string) => {
      this.notifyListeners('route:delete', routeId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from realtime service');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Add listener for real-time updates
  addListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove listener
  removeListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private notifyListeners(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService; 