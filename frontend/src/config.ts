// API base URL - uses Vite env variable in production, falls back to localhost for dev
export const API_BASE_URL: string = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) 
    || 'http://127.0.0.1:8000';
