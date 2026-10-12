import { PollutionRecord, LivePollutionData } from '../types';
import { apiFetch, resolveCoordinates } from './api';

/**
 * Phase 4: Fetches real-time LIVE Air Quality telemetry from Open-Meteo via Spring Boot /api/live/pollution.
 */
export const fetchLivePollution = async (
  lat?: number,
  lon?: number,
  refresh: boolean = false
): Promise<LivePollutionData> => {
  const query = new URLSearchParams();
  if (lat != null) query.set('lat', lat.toString());
  if (lon != null) query.set('lon', lon.toString());
  if (refresh) query.set('refresh', 'true');

  const endpoint = `/live/pollution${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiFetch(endpoint);

  if (!response.ok) {
    let err = `Live air quality request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      err = errJson.message || err;
    } catch {
    }
    throw new Error(err);
  }

  return response.json();
};


export const fetchPollutionRecords = async (): Promise<{ data: PollutionRecord[]; isLive: boolean; message: string }> => {
  const response = await apiFetch('/pollution');
  if (!response.ok) {
    throw new Error(`Failed to fetch pollution records: ${response.statusText}`);
  }
  const rawList = await response.json();
  const data: PollutionRecord[] = rawList.map((item: any) => ({
    ...item,
    stationName: item.stationName || `${item.location} Monitoring Station`,
    zone: item.zone || item.location,
    location: item.location || item.stationName || item.zone,
    aqi: item.aqi ?? 85,
    pm25: item.pm25 ?? 35.0,
    pm10: item.pm10 ?? 60.0,
    no2: item.no2 ?? 24.5,
    co: item.co ?? 1.2,
    o3: item.o3 ?? 18.0,
    dominantPollutant: (item.pm25 > 50 ? 'PM2.5' : 'PM10') as PollutionRecord['dominantPollutant'],
    status: item.status || (item.aqi > 200 ? 'Very Unhealthy' : item.aqi > 150 ? 'Unhealthy' : item.aqi > 100 ? 'Moderate' : 'Good'),
    updatedAt: item.recordedAt || item.recorded_at || new Date().toISOString(),
    coordinates: item.coordinates || resolveCoordinates(item.location || item.stationName),
    isLive: true,
  }));

  return {
    data,
    isLive: true,
    message: 'Displaying ambient air quality metrics directly from MySQL database.',
  };
};

export const createPollutionRecord = async (record: {
  location: string;
  aqi: number;
  pm25: number;
  pm10: number;
  status?: string;
}): Promise<PollutionRecord> => {
  const response = await apiFetch('/pollution', {
    method: 'POST',
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to create pollution record: ${response.status}`);
  }

  const created = await response.json();
  return {
    ...created,
    stationName: created.stationName || `${created.location} Station`,
    zone: created.zone || created.location,
    isLive: true,
  };
};

export const updatePollutionRecord = async (
  id: string | number,
  updatedData: Partial<{
    location: string;
    aqi: number;
    pm25: number;
    pm10: number;
    status: string;
  }>
): Promise<PollutionRecord> => {
  const response = await apiFetch(`/pollution/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update pollution record #${id}: ${response.status}`);
  }

  const updated = await response.json();
  return {
    ...updated,
    stationName: updated.stationName || `${updated.location} Station`,
    zone: updated.zone || updated.location,
    isLive: true,
  };
};

export const deletePollutionRecord = async (id: string | number): Promise<void> => {
  const response = await apiFetch(`/pollution/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete pollution record #${id}: ${response.status}`);
  }
};
