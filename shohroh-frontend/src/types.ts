export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  osm_id?: string;
  osm_type?: string;
  shelter?: boolean;
  bench?: boolean;
  lit?: boolean;
  network?: string;
  operator?: string;
  ref?: string;
}

export interface Route {
  id: string;
  name: string;
  color: string;
  stationIds: string[];
  stations?: Station[];
}

export interface StatusMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface LoginResponse {
  token: string;
  username: string;
}

export type StationEvent = 'station:created' | 'station:updated' | 'station:deleted';
export type RouteEvent = 'route:created' | 'route:updated' | 'route:deleted';
export type WebSocketEvent = StationEvent | RouteEvent; 