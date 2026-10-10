export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'In Progress' | 'Resolved' | 'Dispatched';
export type DataSourceType = 'live' | 'demo' | 'hybrid';

export interface TrafficRecord {
  id: number | string;
  location: string;
  congestion: number; // 0 - 100 percentage
  vehicles: number;
  status: 'Low' | 'Moderate' | 'High' | 'Severe' | string;
  recorded_at?: string;
  recordedAt?: string;
  coordinates?: [number, number]; // [lat, lng]
  trend?: 'increasing' | 'stable' | 'decreasing';
  speedKmh?: number;
  isLive?: boolean;
}

export interface WeatherData {
  id?: string;
  city: string;
  location?: string;
  temperature: number; // Celsius
  feelsLike: number;
  humidity: number; // percentage
  rainfall: number; // mm
  windSpeed: number; // km/h
  pressure: number; // hPa
  condition: 'Clear' | 'Sunny' | 'Partly Cloudy' | 'Overcast' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm';
  uvIndex: number;
  visibilityKm: number;
  updatedAt: string;
  isLive?: boolean;
  forecast?: Array<{
    time: string;
    temp: number;
    rainfall: number;
    condition?: string;
    humidity?: number;
  }>;
}

export interface WaterIssue {
  id: string;
  location: string;
  issueType: 'Pipeline Leakage' | 'Low Pressure' | 'Water Contamination' | 'Supply Disruption' | 'Valve Malfunction';
  severity: SeverityLevel;
  affectedHouseholds: number;
  pressurePsi: number;
  status: 'Reported' | 'Inspecting' | 'Repair in Progress' | 'Resolved';
  reportedAt: string;
  coordinates: [number, number];
  zone: string;
}

export interface WasteRecord {
  id: string;
  zone: string;
  location: string;
  binCapacityLiters: number;
  fillPercentage: number;
  lastCollection: string;
  status: 'Normal' | 'Near Capacity' | 'Overflowing' | 'Scheduled for Pickup';
  priority: SeverityLevel;
  vehicleAssigned?: string;
  coordinates: [number, number];
  wasteType: 'Municipal Solid Waste' | 'Recyclable' | 'Hazardous/Medical' | 'Commercial';
}

export interface PollutionRecord {
  id: string;
  stationName: string;
  zone: string;
  aqi: number;
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  no2: number; // µg/m³
  co: number; // mg/m³
  o3: number; // µg/m³
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'CO' | 'O3';
  status: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  trend: 'improving' | 'stable' | 'deteriorating';
  coordinates: [number, number];
  updatedAt: string;
  isSimulated: boolean;
}

export interface EmergencyIncident {
  id: string;
  title: string;
  category: 'Fire' | 'Traffic Accident' | 'Medical' | 'Waterlogging' | 'Structural Hazard' | 'Power Outage';
  severity: SeverityLevel;
  location: string;
  coordinates: [number, number];
  timestamp: string;
  status: IncidentStatus;
  description: string;
  reportedBy: string;
  respondersAssigned: string[];
  estimatedResolutionMin?: number;
}

export interface CitizenComplaint {
  id: string;
  title: string;
  description: string;
  category: 'Road & Potholes' | 'Water Supply' | 'Garbage & Sanitation' | 'Streetlight' | 'Drainage' | 'Traffic Violation' | 'Other';
  location: string;
  severity: SeverityLevel;
  citizenName?: string;
  citizenPhone?: string;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'Resolved';
  createdAt: string;
  isLocalDemo: boolean;
  coordinates?: [number, number];
}

export interface RiskPrediction {
  id: string;
  riskType: 'Traffic Gridlock' | 'Urban Flash Flood' | 'Water Supply Shortage' | 'Air Pollution Surge' | 'Waste Accumulation Hazard';
  title: string;
  location: string;
  riskScore: number; // 0 - 100
  severity: SeverityLevel;
  detectedPatterns: string[];
  recommendedAction: string;
  timestamp: string;
  whyFlagged: string;
  timeHorizon: 'Next 1 Hour' | 'Next 3 Hours' | 'Next 6 Hours' | 'Next 24 Hours';
  impactZone: string;
  isRuleBasedDemo: boolean;
}

export interface SimulatorState {
  trafficVolumeMultiplier: number; // 0.5x to 2.5x
  rainfallIntensityMm: number; // 0 to 120 mm/hr
  solidWasteAccumulationFactor: number; // 1x to 3x
  waterSupplyPressureFactor: number; // 50% to 150%
  emergencyStaffingPercent: number; // 40% to 100%
}

export interface SimulatorResult {
  overallRiskScore: number; // 0 - 100
  gridlockRiskIndex: number;
  floodedHotspotsCount: number;
  drainageOverloadPercent: number;
  emergencyResponseTimeMin: number;
  airQualityImpactAQI: number;
  suggestedActions: string[];
  affectedZones: string[];
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedFollowups?: string[];
  dataContext?: any;
}

export interface SystemStatus {
  backendConnected: boolean;
  backendUrl: string;
  lastChecked: string;
  trafficSource: 'live' | 'demo';
  weatherSource: 'live' | 'demo';
  latencyMs: number;
}
