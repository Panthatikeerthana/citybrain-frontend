export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const TOKEN_STORAGE_KEY = 'citybrain_auth_token';

export const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (e) {
    console.error('Failed to save session token:', e);
  }
};

export const removeStoredToken = (): void => {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove session token:', e);
  }
};

/**
 * Centralized API request helper.
 * Automatically injects Authorization Bearer header if token exists in sessionStorage.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

const HYDERABAD_KNOWN_COORDS: Record<string, [number, number]> = {
  'uppal': [17.3984, 78.5583],
  'ghatkesar': [17.4475, 78.6835],
  'jodimetla': [17.4621, 78.6542],
  'lb nagar': [17.3457, 78.5522],
  'lbnagar': [17.3457, 78.5522],
  'kukatpally': [17.4938, 78.3989],
  'hitec city': [17.4435, 78.3772],
  'gachibowli': [17.4399, 78.3489],
  'secunderabad': [17.4399, 78.4983],
  'banjara hills': [17.4156, 78.4350],
  'charminar': [17.3616, 78.4747],
  'dilsukhnagar': [17.3688, 78.5247],
  'madhapur': [17.4483, 78.3740],
  'mehdipatnam': [17.3916, 78.4397],
};

const resolveCoordinates = (locationName: string): [number, number] => {
  const norm = locationName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(HYDERABAD_KNOWN_COORDS)) {
    if (norm.includes(key)) {
      return coords;
    }
  }
  return [17.3850 + (Math.random() * 0.08 - 0.04), 78.4867 + (Math.random() * 0.08 - 0.04)];
};

export const checkBackendHealth = async (): Promise<{ isConnected: boolean; latencyMs: number }> => {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await apiFetch('/traffic', {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);
    return {
      isConnected: response.ok,
      latencyMs,
    };
  } catch (err) {
    return {
      isConnected: false,
      latencyMs: 0,
    };
  }
};

export const normalizeTrafficRecord = (raw: any): any => {
  if (!raw || typeof raw !== 'object') return raw;
  
  // Normalize snake_case and camelCase
  const recordedAt = raw.recorded_at || raw.recordedAt || raw.timestamp || new Date().toISOString();
  const id = raw.id ?? Math.floor(Math.random() * 10000);
  const location = raw.location || raw.name || 'Unknown Location';
  const congestion = Number(raw.congestion ?? raw.congestion_level ?? 50);
  const vehicles = Number(raw.vehicles ?? raw.vehicle_count ?? 500);
  
  let status = raw.status;
  if (!status) {
    if (congestion >= 75) status = 'High';
    else if (congestion >= 45) status = 'Moderate';
    else status = 'Low';
  }

  const coordinates = raw.coordinates || resolveCoordinates(location);

  return {
    id,
    location,
    congestion,
    vehicles,
    status,
    recorded_at: recordedAt,
    recordedAt,
    coordinates,
    trend: raw.trend || (congestion > 70 ? 'increasing' : congestion < 40 ? 'decreasing' : 'stable'),
    speedKmh: raw.speedKmh || Math.max(10, Math.round(80 - (congestion * 0.7))),
    isLive: true,
  };
};
