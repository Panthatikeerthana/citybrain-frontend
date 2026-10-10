import { WeatherData } from '../types';
import { DEMO_WEATHER_DATA } from '../data/demoData';
import { API_BASE_URL } from './api';

export interface WeatherFetchResult {
  data: WeatherData;
  isLive: boolean;
  message?: string;
}

export const fetchWeatherData = async (): Promise<WeatherFetchResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}/weather`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather API returned status ${response.status}`);
    }

    const json = await response.json();
    return {
      data: {
        ...DEMO_WEATHER_DATA,
        ...json,
        isLive: true,
      },
      isLive: true,
      message: 'Connected to live weather telemetry endpoint.',
    };
  } catch (error) {
    return {
      data: DEMO_WEATHER_DATA,
      isLive: false,
      message: 'Weather API not active on backend. Displaying regional demo meteorological model.',
    };
  }
};
