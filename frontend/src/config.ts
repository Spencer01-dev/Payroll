// API base URL - uses Vite env variable in production, falls back to localhost for dev
const rawUrl: string = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) 
    || 'http://127.0.0.1:8000';

// Sanitize URL in case of accidental markdown formatting (e.g. `url](url`), quotes, or trailing slashes
const sanitizeUrl = (url: string): string => {
  let cleaned = url.trim();
  // Extract URL from markdown link pattern like https://...](https://...)
  if (cleaned.includes('](')) {
    const parts = cleaned.split('](');
    cleaned = parts[parts.length - 1].replace(/\)+$/, '').trim();
  }
  // Remove wrapping quotes or brackets
  cleaned = cleaned.replace(/^[\["']+|[\]"']+$/g, '').trim();
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};

export const API_BASE_URL: string = sanitizeUrl(rawUrl);
