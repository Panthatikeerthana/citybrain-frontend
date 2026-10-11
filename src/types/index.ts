export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'In Progress' | 'Resolved' | 'Dispatched' | 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED';
export type DataSourceType = 'live' | 'demo' | 'hybrid' | 'stored' | 'unavailable';

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
  id?: string | number;
  city: string;
  location?: string;
  temperature: number; // Celsius
  feelsLike: number;
  humidity: number; // percentage
  rainfall: number; // mm
  windSpeed: number; // km/h
  pressure: number; // hPa
  condition: 'Clear' | 'Sunny' | 'Partly Cloudy' | 'Overcast' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm' | string;
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
  id: string | number;
  location: string;
  issueType: 'Pipeline Leakage' | 'Low Pressure' | 'Water Contamination' | 'Supply Disruption' | 'Valve Malfunction' | string;
  issue_type?: string;
  severity: SeverityLevel;
  affectedHouseholds: number;
  pressurePsi: number;
  status: 'Reported' | 'Inspecting' | 'Repair in Progress' | 'Resolved' | string;
  description?: string;
  reportedAt?: string;
  reported_at?: string;
  coordinates?: [number, number];
  zone?: string;
  isLive?: boolean;
}

export interface WasteRecord {
  id: string | number;
  zone: string;
  location: string;
  binCapacityLiters?: number;
  fillPercentage: number;
  lastCollection?: string;
  collectedAt?: string;
  collected_at?: string;
  status: 'Normal' | 'Near Capacity' | 'Overflowing' | 'Scheduled for Pickup' | string;
  priority: SeverityLevel;
  vehicleAssigned?: string;
  coordinates?: [number, number];
  wasteType?: 'Municipal Solid Waste' | 'Recyclable' | 'Hazardous/Medical' | 'Commercial' | string;
  waste_type?: string;
  quantity?: number;
  isLive?: boolean;
}

export interface PollutionRecord {
  id: string | number;
  stationName: string;
  zone: string;
  location?: string;
  aqi: number;
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  no2?: number; // µg/m³
  co?: number; // mg/m³
  o3?: number; // µg/m³
  dominantPollutant?: 'PM2.5' | 'PM10' | 'NO2' | 'CO' | 'O3' | string;
  status: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | string;
  trend?: 'improving' | 'stable' | 'deteriorating';
  coordinates?: [number, number];
  updatedAt?: string;
  recordedAt?: string;
  recorded_at?: string;
  isSimulated?: boolean;
  isLive?: boolean;
}

export interface EmergencyIncident {
  id: string | number;
  title: string;
  category: 'Fire' | 'Traffic Accident' | 'Medical' | 'Waterlogging' | 'Structural Hazard' | 'Power Outage' | string;
  type?: string;
  severity: SeverityLevel;
  location: string;
  coordinates?: [number, number];
  timestamp: string;
  reportedAt?: string;
  reported_at?: string;
  updatedAt?: string;
  updated_at?: string;
  status: IncidentStatus | string;
  description: string;
  reportedBy?: string;
  respondersAssigned: string[];
  estimatedResolutionMin?: number;
  isLive?: boolean;
}

export interface CitizenComplaint {
  id: string | number;
  title: string;
  description: string;
  category: 'Road & Potholes' | 'Water Supply' | 'Garbage & Sanitation' | 'Streetlight' | 'Drainage' | 'Traffic Violation' | 'Other' | string;
  location: string;
  severity: SeverityLevel;
  priority?: string;
  citizenName?: string;
  citizen_name?: string;
  citizenPhone?: string;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'Resolved' | 'OPEN' | 'IN_PROGRESS' | string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  isLocalDemo?: boolean;
  coordinates?: [number, number];
  isLive?: boolean;
}

export interface RiskPrediction {
  id: string | number;
  riskType: 'Traffic Gridlock' | 'Urban Flash Flood' | 'Water Supply Shortage' | 'Air Pollution Surge' | 'Waste Accumulation Hazard' | string;
  risk_type?: string;
  riskLevel?: string;
  risk_level?: string;
  title: string;
  location: string;
  riskScore: number; // 0 - 100
  probability?: number;
  severity: SeverityLevel;
  detectedPatterns: string[];
  recommendedAction: string;
  timestamp: string;
  predictedAt?: string;
  predicted_at?: string;
  whyFlagged: string;
  timeHorizon: 'Next 1 Hour' | 'Next 3 Hours' | 'Next 6 Hours' | 'Next 24 Hours' | string;
  impactZone: string;
  description?: string;
  isRuleBasedDemo?: boolean;
  isLive?: boolean;
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
  trafficSource: 'live' | 'stored' | 'unavailable' | 'demo';
  weatherSource: 'live' | 'stored' | 'unavailable' | 'demo';
  latencyMs: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  expiresIn: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  termsAccepted?: boolean;
}

// Phase 4 Live Telemetry Models
export interface LiveWeatherData {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  observationTime: string;
  fetchedAt: string;
  isLive: boolean;
  source: string;
}

export interface LivePollutionData {
  location: string;
  latitude: number;
  longitude: number;
  aqi: number;
  europeanAqi: number;
  pm25: number;
  pm10: number;
  carbonMonoxide?: number;
  nitrogenDioxide?: number;
  sulphurDioxide?: number;
  ozone?: number;
  category: string;
  dominantPollutant: string;
  observationTime: string;
  fetchedAt: string;
  isLive: boolean;
  source: string;
}

export interface TrafficFlowItem {
  location: string;
  latitude: number;
  longitude: number;
  congestionLevel: number;
  currentSpeed: number;
  freeFlowSpeed: number;
  status: string;
  confidence: number;
  observationTime: string;
}

export interface LiveTrafficData {
  configured: boolean;
  provider: string;
  status: string;
  message: string;
  items: TrafficFlowItem[];
  fetchedAt: string;
  isLive: boolean;
}

