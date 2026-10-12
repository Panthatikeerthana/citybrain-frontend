import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  TrafficRecord, 
  WeatherData, 
  WaterIssue, 
  WasteRecord, 
  PollutionRecord, 
  EmergencyIncident, 
  CitizenComplaint, 
  RiskPrediction,
  SystemStatus,
  LiveWeatherData,
  LivePollutionData,
  LiveTrafficData
} from '../types';
import { checkBackendHealth, API_BASE_URL } from '../services/api';
import { fetchTrafficData, fetchLiveTraffic } from '../services/trafficService';
import { fetchWeatherData, fetchLiveWeather } from '../services/weatherService';
import { fetchWaterIssues } from '../services/waterService';
import { fetchWasteRecords } from '../services/wasteService';
import { fetchPollutionRecords, fetchLivePollution } from '../services/pollutionService';
import { fetchEmergencyIncidents, updateIncidentStatus } from '../services/emergencyService';
import { getComplaints, submitComplaint } from '../services/complaintService';
import { fetchRiskPredictions } from '../services/riskService';
import { useAuth } from './AuthContext';

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  link?: string;
}

interface CityBrainContextType {
  systemStatus: SystemStatus;
  traffic: TrafficRecord[];
  weather: WeatherData;
  waterIssues: WaterIssue[];
  wasteRecords: WasteRecord[];
  pollutionRecords: PollutionRecord[];
  emergencies: EmergencyIncident[];
  complaints: CitizenComplaint[];
  riskPredictions: RiskPrediction[];
  // Phase 4 Live Telemetry State
  liveWeather: LiveWeatherData | null;
  livePollution: LivePollutionData | null;
  liveTraffic: LiveTrafficData | null;
  notifications: AlertNotification[];
  unreadCount: number;
  isLoading: boolean;
  lastRefresh: Date;
  refreshAllData: () => Promise<void>;
  refreshLiveTelemetry: (force?: boolean) => Promise<void>;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addComplaint: (complaint: {
    citizenName: string;
    category: string;
    description: string;
    location: string;
    priority?: string;
    status?: string;
  }) => Promise<CitizenComplaint>;
  updateEmergencyStatus: (id: string | number, status: string) => Promise<void>;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const CityBrainContext = createContext<CityBrainContextType | undefined>(undefined);

export const CityBrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [traffic, setTraffic] = useState<TrafficRecord[]>([]);
  const [weather, setWeather] = useState<WeatherData>({} as WeatherData);
  const [waterIssues, setWaterIssues] = useState<WaterIssue[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [pollutionRecords, setPollutionRecords] = useState<PollutionRecord[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>([]);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);

  // Phase 4 Live Telemetry
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [livePollution, setLivePollution] = useState<LivePollutionData | null>(null);
  const [liveTraffic, setLiveTraffic] = useState<LiveTrafficData | null>(null);
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backendConnected: false,
    backendUrl: API_BASE_URL,
    lastChecked: new Date().toLocaleTimeString(),
    trafficSource: 'unavailable',
    weatherSource: 'unavailable',
    latencyMs: 0,
  });

  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const refreshLiveTelemetry = useCallback(async (force: boolean = false) => {
    if (!isAuthenticated) return;
    try {
      const [w, p, t] = await Promise.all([
        fetchLiveWeather(undefined, undefined, force).catch(() => null),
        fetchLivePollution(undefined, undefined, force).catch(() => null),
        fetchLiveTraffic(force).catch(() => null),
      ]);
      if (w) setLiveWeather(w);
      if (p) setLivePollution(p);
      if (t) setLiveTraffic(t);
    } catch (e) {
      console.warn('Live telemetry refresh notice:', e);
    }
  }, [isAuthenticated]);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        setTraffic([]);
        setWeather({} as WeatherData);
        setWaterIssues([]);
        setWasteRecords([]);
        setPollutionRecords([]);
        setEmergencies([]);
        setComplaints([]);
        setRiskPredictions([]);
        setLiveWeather(null);
        setLivePollution(null);
        setLiveTraffic(null);

        setSystemStatus({
          backendConnected: false,
          backendUrl: API_BASE_URL,
          lastChecked: new Date().toLocaleTimeString(),
          trafficSource: 'unavailable',
          weatherSource: 'unavailable',
          latencyMs: 0,
        });
        return;
      }

      // 1. Health check with JWT
      const health = await checkBackendHealth();

      // 2. Parallel data fetching directly from MySQL + Live Telemetry
      const [
        trafficRes,
        weatherRes,
        waterRes,
        wasteRes,
        pollutionRes,
        emergencyRes,
        complaintsData,
        risksRes,
        liveWeatherRes,
        livePollutionRes,
        liveTrafficRes,
      ] = await Promise.all([
        fetchTrafficData().catch(() => ({ data: [], isLive: false, message: '' })),
        fetchWeatherData().catch(() => ({ data: {} as WeatherData, isLive: false, message: '' })),
        fetchWaterIssues().catch(() => ({ data: [], isLive: false, message: '' })),
        fetchWasteRecords().catch(() => ({ data: [], isLive: false, message: '' })),
        fetchPollutionRecords().catch(() => ({ data: [], isLive: false, message: '' })),
        fetchEmergencyIncidents().catch(() => ({ data: [], isLive: false, message: '' })),
        getComplaints().catch(() => []),
        fetchRiskPredictions().catch(() => ({ data: [], isLive: false, message: '' })),
        fetchLiveWeather().catch(() => null),
        fetchLivePollution().catch(() => null),
        fetchLiveTraffic().catch(() => null),
      ]);

      setTraffic(trafficRes.data);
      setWeather(weatherRes.data);
      setWaterIssues(waterRes.data);
      setWasteRecords(wasteRes.data);
      setPollutionRecords(pollutionRes.data);
      setEmergencies(emergencyRes.data);
      setComplaints(complaintsData);
      setRiskPredictions(risksRes.data);

      if (liveWeatherRes) setLiveWeather(liveWeatherRes);
      if (livePollutionRes) setLivePollution(livePollutionRes);
      if (liveTrafficRes) setLiveTraffic(liveTrafficRes);

      setSystemStatus({
        backendConnected: health.isConnected,
        backendUrl: API_BASE_URL,
        lastChecked: new Date().toLocaleTimeString(),
        trafficSource: liveTrafficRes?.configured ? 'live' : 'stored',
        weatherSource: liveWeatherRes ? 'live' : 'stored',
        latencyMs: health.latencyMs,
      });

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error refreshing City Brain telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAllData();
    if (isAuthenticated) {
      // Refresh telemetry every 60 seconds
      const interval = setInterval(refreshAllData, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshAllData]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addComplaint = async (complaint: {
    citizenName: string;
    category: string;
    description: string;
    location: string;
    priority?: string;
    status?: string;
  }): Promise<CitizenComplaint> => {
    const created = await submitComplaint(complaint);
    
    // Refresh complaints from MySQL
    try {
      const refreshed = await getComplaints();
      setComplaints(refreshed);
    } catch {
      setComplaints(prev => [created, ...prev]);
    }
    
    // Add an alert notification
    const newNotif: AlertNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Citizen Grievance',
      message: `${created.title} (${created.location})`,
      type: created.severity === 'High' || created.severity === 'Critical' ? 'critical' : 'info',
      timestamp: 'Just now',
      read: false,
      link: '/complaints',
    };
    setNotifications(prev => [newNotif, ...prev]);

    return created;
  };

  const updateEmergencyStatus = async (id: string | number, status: string) => {
    const updated = await updateIncidentStatus(id, status);
    setEmergencies(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <CityBrainContext.Provider
      value={{
        systemStatus,
        traffic,
        weather,
        waterIssues,
        wasteRecords,
        pollutionRecords,
        emergencies,
        complaints,
        riskPredictions,
        liveWeather,
        livePollution,
        liveTraffic,
        notifications,
        unreadCount,
        isLoading,
        lastRefresh,
        refreshAllData,
        refreshLiveTelemetry,
        markNotificationRead,
        clearNotifications,
        addComplaint,
        updateEmergencyStatus,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </CityBrainContext.Provider>
  );
};

export const useCityBrain = () => {
  const context = useContext(CityBrainContext);
  if (!context) {
    throw new Error('useCityBrain must be used within a CityBrainProvider');
  }
  return context;
};
