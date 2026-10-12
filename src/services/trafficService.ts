import { TrafficRecord, LiveTrafficData } from '../types';
import { apiFetch, normalizeTrafficRecord } from './api';

/**
 * Phase 4: Fetches real-time LIVE Traffic telemetry from TomTom via Spring Boot /api/live/traffic.
 */
export const fetchLiveTraffic = async (refresh: boolean = false): Promise<LiveTrafficData> => {
  const endpoint = `/live/traffic${refresh ? '?refresh=true' : ''}`;
  const response = await apiFetch(endpoint);

  if (!response.ok) {
    let err = `Live traffic request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      err = errJson.message || err;
    } catch {
    }
    throw new Error(err);
  }

  return response.json();
};

export interface TrafficFetchResult {
  data: TrafficRecord[];
  isLive: boolean;
  message?: string;
}

export const fetchTrafficData = async (): Promise<TrafficFetchResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await apiFetch('/traffic', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Traffic API HTTP status ${response.status}`);
    }

    const json = await response.json();
    let records: TrafficRecord[] = [];

    if (Array.isArray(json)) {
      records = json.map(normalizeTrafficRecord);
    } else if (json && Array.isArray(json.data)) {
      records = json.data.map(normalizeTrafficRecord);
    } else if (json && typeof json === 'object') {
      records = [normalizeTrafficRecord(json)];
    }

    return {
      data: records,
      isLive: false,
      message: records.length > 0
        ? 'Connected to stored Spring Boot /api/traffic database records.'
        : 'No traffic records found in database.',
    };
  } catch (error: any) {
    return {
      data: [],
      isLive: false,
      message: `Database traffic records unavailable (${error.message || 'offline'}).`,
    };
  }
};

export const createTrafficRecord = async (record: {
  location: string;
  congestion: number;
  vehicles: number;
  status?: string;
}): Promise<TrafficRecord> => {
  const response = await apiFetch('/traffic', {
    method: 'POST',
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to create traffic record: ${response.status}`);
  }

  const created = await response.json();
  return normalizeTrafficRecord(created);
};

export const updateTrafficRecord = async (
  id: string | number,
  updatedData: Partial<{
    location: string;
    congestion: number;
    vehicles: number;
    status: string;
  }>
): Promise<TrafficRecord> => {
  const response = await apiFetch(`/traffic/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update traffic record #${id}: ${response.status}`);
  }

  const updated = await response.json();
  return normalizeTrafficRecord(updated);
};

export const deleteTrafficRecord = async (id: string | number): Promise<void> => {
  const response = await apiFetch(`/traffic/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete traffic record #${id}: ${response.status}`);
  }
};

