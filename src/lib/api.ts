// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || window.location.origin.replace('http', 'ws');

export const fetchFromApi = async (endpoint: string, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return response.json();
};

export const createWebSocketConnection = (path: string) => {
  return new WebSocket(`${WS_BASE_URL}${path}`);
};