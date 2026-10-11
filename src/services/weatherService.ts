import { WeatherData, LiveWeatherData } from '../types';
import { apiFetch } from './api';

export interface WeatherFetchResult {
  data: WeatherData;
  isLive: boolean;
  message?: string;
}

/**
 * Fetches stored historical weather records from MySQL database.
 */
export const fetchWeatherData = async (): Promise<WeatherFetchResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await apiFetch('/weather', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather API returned status ${response.status}`);
    }

    const json = await response.json();
    return {
      data: json as WeatherData,
      isLive: false,
      message: 'Connected to stored Spring Boot /api/weather endpoint.',
    };
  } catch (error) {
    return {
      data: {} as WeatherData,
      isLive: false,
      message: 'No stored weather records found in database.',
    };
  }
};

/**
 * Phase 4: Fetches real-time LIVE weather telemetry from Open-Meteo via Spring Boot /api/live/weather.
 */
export const fetchLiveWeather = async (
  lat?: number,
  lon?: number,
  refresh: boolean = false
): Promise<LiveWeatherData> => {
  const query = new URLSearchParams();
  if (lat != null) query.set('lat', lat.toString());
  if (lon != null) query.set('lon', lon.toString());
  if (refresh) query.set('refresh', 'true');

  const endpoint = `/live/weather${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiFetch(endpoint);

  if (!response.ok) {
    let err = `Live weather request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      err = errJson.message || err;
    } catch {
    }
    throw new Error(err);
  }

  return response.json();
};
