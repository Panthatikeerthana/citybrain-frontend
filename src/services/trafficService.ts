import { TrafficRecord } from '../types';
import { DEMO_TRAFFIC_DATA } from '../data/demoData';
import { API_BASE_URL, normalizeTrafficRecord } from './api';

export interface TrafficFetchResult {
  data: TrafficRecord[];
  isLive: boolean;
  message?: string;
}

export const fetchTrafficData = async (): Promise<TrafficFetchResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/traffic`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
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

    if (records.length === 0) {
      return {
        data: DEMO_TRAFFIC_DATA,
        isLive: false,
        message: 'Backend returned empty array. Showing verified fallback demo records.',
      };
    }

    return {
      data: records,
      isLive: true,
      message: 'Connected to live Spring Boot /api/traffic endpoint.',
    };
  } catch (error: any) {
    // Graceful fallback to verified demo data
    return {
      data: DEMO_TRAFFIC_DATA,
      isLive: false,
      message: `Live backend unavailable (${error.message || 'offline'}). Serving verified Hyderabad demo records.`,
    };
  }
};
