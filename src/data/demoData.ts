import { 
  TrafficRecord, 
  WeatherData, 
  WaterIssue, 
  WasteRecord, 
  PollutionRecord, 
  EmergencyIncident, 
  CitizenComplaint, 
  RiskPrediction 
} from '../types';

/**
 * City Brain Operational Data Policy:
 * Mock, demo, seeded, placeholder, and fabricated operational records are strictly prohibited.
 * All operational telemetry must originate from verified live APIs (Open-Meteo, TomTom)
 * or real user-submitted database records.
 */
export const DEMO_TRAFFIC_DATA: TrafficRecord[] = [];

export const DEMO_WEATHER_DATA: WeatherData = {
  city: 'Unavailable',
  temperature: 0,
  feelsLike: 0,
  humidity: 0,
  rainfall: 0,
  windSpeed: 0,
  pressure: 1013,
  condition: 'Unavailable',
  uvIndex: 0,
  visibilityKm: 0,
  updatedAt: '',
};

export const DEMO_WATER_ISSUES: WaterIssue[] = [];

export const DEMO_WASTE_RECORDS: WasteRecord[] = [];

export const DEMO_POLLUTION_RECORDS: PollutionRecord[] = [];

export const DEMO_EMERGENCIES: EmergencyIncident[] = [];

export const DEMO_COMPLAINTS: CitizenComplaint[] = [];

export const DEMO_RISK_PREDICTIONS: RiskPrediction[] = [];
